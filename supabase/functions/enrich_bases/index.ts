// supabase/functions/enrich_bases/index.ts
// Enrichit aircraft_bases pour les tails vus récemment aux aéroports surveillés.
// 1 appel ADB (historique par plage /flights/reg/{reg}/{from}/{to}) par tail, borné + caché.
// Base = aéroport avec le plus de "nuits" (dwell >= minDwellH) ; fallback = aéroport le plus fréquent.
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const SUPABASE_URL = Deno.env.get("SUPABASE_URL") || "https://uqiawlhgseoibvfpghgz.supabase.co";
const SERVICE_ROLE = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
const ADB_HOST = "aerodatabox.p.rapidapi.com";
const SLEEP_MS = 250;
const HTTP_TIMEOUT_MS = 20000;

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
const jsonResp = (obj, status = 200) =>
  new Response(JSON.stringify(obj), { status, headers: { "content-type": "application/json" } });

async function fetchTO(url, init = {}, ms = HTTP_TIMEOUT_MS) {
  const ctrl = new AbortController();
  const id = setTimeout(() => ctrl.abort(), ms);
  try { return await fetch(url, { ...init, signal: ctrl.signal }); }
  finally { clearTimeout(id); }
}

const isoDate = (d) => d.toISOString().slice(0, 10);
const pickUtc = (t) =>
  t?.runwayTime?.utc || t?.revisedTime?.utc || t?.scheduledTime?.utc || t?.predictedTime?.utc || null;
function toTs(utc) {
  if (!utc) return null;
  const iso = utc.includes("T") ? utc : utc.replace(" ", "T");
  const ms = Date.parse(iso);
  return Number.isFinite(ms) ? Math.floor(ms / 1000) : null;
}
const extractLeg = (f) => ({
  dep: f?.departure?.airport?.icao ?? null,
  arr: f?.arrival?.airport?.icao ?? null,
  depTs: toTs(pickUtc(f?.departure)),
  arrTs: toTs(pickUtc(f?.arrival)),
});

// Base = aéroport avec le plus de "nuits" (dwell >= minDwellH). Fallback = plus fréquent.
function computeBase(flights, minDwellH) {
  const legs = flights.map(extractLeg).filter((x) => x.arr && x.arrTs).sort((a, b) => a.arrTs - b.arrTs);
  const nights = new Map();
  for (const a of legs) {
    const next = legs.find((l) => l.dep === a.arr && (l.depTs ?? 0) > (a.arrTs ?? 0));
    const dwellH = next && a.arrTs && next.depTs ? (next.depTs - a.arrTs) / 3600 : undefined;
    if (dwellH !== undefined && dwellH >= minDwellH) {
      const cur = nights.get(a.arr) ?? { n: 0, h: 0 };
      cur.n += 1; cur.h += dwellH; nights.set(a.arr, cur);
    }
  }
  let best = null, bestN = -1, bestH = -1;
  for (const [apt, v] of nights.entries()) {
    if (v.n > bestN || (v.n === bestN && v.h > bestH)) { best = apt; bestN = v.n; bestH = v.h; }
  }
  let method = "overnight";
  if (!best) {
    const freq = new Map();
    for (const l of legs) for (const ic of [l.dep, l.arr]) if (ic) freq.set(ic, (freq.get(ic) ?? 0) + 1);
    let fN = -1;
    for (const [ic, n] of freq.entries()) if (n > fN) { best = ic; fN = n; }
    bestN = 0; method = "frequency";
  }
  const confidence = bestN <= 0 ? (best ? 0.3 : 0) : Math.min(0.95, 0.5 + bestN * 0.08 + Math.min(bestH, 200) * 0.001);
  return { base_icao: best, nights: bestN, confidence, sampleN: flights.length, method };
}

Deno.serve(async (req) => {
  const t0 = performance.now();
  const db = createClient(SUPABASE_URL, SERVICE_ROLE);
  try {
    const body = await req.json().catch(() => ({}));
    const apiKey = body.apiKey || Deno.env.get("RAPIDAPI_KEY");
    if (!apiKey) return jsonResp({ ok: false, error: "Missing RAPIDAPI key (env RAPIDAPI_KEY or body.apiKey)" }, 400);

    const maxTails    = Math.max(1, Math.min(Number(body.maxTails ?? 8), 25));
    const lookbackDays = Math.max(3, Math.min(Number(body.lookbackDays ?? 7), 30));
    const staleDays   = Math.max(1, Math.min(Number(body.staleDays ?? 21), 180));
    const minDwellH   = Math.min(Math.max(Number(body.minDwellHours ?? 6), 3), 24);
    const windowHours = Math.max(1, Math.min(Number(body.windowHours ?? 6), 48));

    // 1) Aéroports surveillés
    const { data: watch } = await db.from("watch_airports").select("icao").eq("active", true);
    const watchIcaos = (watch ?? []).map((r) => (r.icao ?? "").toUpperCase()).filter(Boolean);
    if (!watchIcaos.length) return jsonResp({ ok: true, note: "no watched airports", enriched: [] });

    // 2) Tails vus récemment dans la fenêtre (élargie autour du scoring)
    const nowMs = Date.now();
    const fromISO = new Date(nowMs - windowHours * 3600_000).toISOString();
    const toISO   = new Date(nowMs + 3 * 3600_000).toISOString();
    const inList = watchIcaos.join(",");
    const { data: fRows } = await db.from("flights_canonical")
      .select("aircraft_reg")
      .or(`and(arr_icao.in.(${inList}),arr_time_utc.gte.${fromISO},arr_time_utc.lte.${toISO}),and(dep_icao.in.(${inList}),dep_time_utc.gte.${fromISO},dep_time_utc.lte.${toISO})`)
      .not("aircraft_reg", "is", null);
    const candidates = Array.from(new Set((fRows ?? []).map((r) => (r.aircraft_reg || "").toUpperCase()).filter(Boolean)));
    if (!candidates.length) return jsonResp({ ok: true, note: "no recent tails in window", enriched: [] });

    // 3) Écarter les tails avec base déjà fraîche (cache)
    const { data: baseRows } = await db.from("aircraft_bases").select("reg,base_icao,updated_at").in("reg", candidates);
    const freshCut = nowMs - staleDays * 86400_000;
    const fresh = new Set();
    for (const b of baseRows ?? []) {
      if (b.reg && b.base_icao && b.updated_at && Date.parse(b.updated_at) >= freshCut) fresh.add((b.reg || "").toUpperCase());
    }
    const toLearn = candidates.filter((r) => !fresh.has(r)).slice(0, maxTails);

    // 4) 1 appel historique par plage → base, upsert
    const dateTo = isoDate(new Date(nowMs));
    const dateFrom = isoDate(new Date(nowMs - lookbackDays * 86400_000));
    const enriched = [], noData = [];
    for (const reg of toLearn) {
      const url = `https://${ADB_HOST}/flights/reg/${encodeURIComponent(reg)}/${dateFrom}/${dateTo}`;
      let flights = [];
      try {
        const r = await fetchTO(url, { headers: { "X-RapidAPI-Key": apiKey, "X-RapidAPI-Host": ADB_HOST } });
        if (r.ok) { const j = await r.json(); flights = Array.isArray(j) ? j : (Array.isArray(j?.flights) ? j.flights : []); }
      } catch (_) { /* soft-fail */ }
      if (!flights.length) { noData.push(reg); await sleep(SLEEP_MS); continue; }
      const pick = computeBase(flights, minDwellH);
      if (!pick.base_icao) { noData.push(reg); await sleep(SLEEP_MS); continue; }
      const row = {
        reg, base_icao: pick.base_icao, confidence: pick.confidence,
        sample_n: pick.sampleN, method: `history_range_${pick.method}`, updated_at: new Date().toISOString(),
      };
      const { data: exists } = await db.from("aircraft_bases").select("reg").eq("reg", reg).limit(1);
      if (exists && exists.length) await db.from("aircraft_bases").update(row).eq("reg", reg);
      else await db.from("aircraft_bases").insert(row);
      enriched.push({ reg, base_icao: pick.base_icao, nights: pick.nights, confidence: Number(pick.confidence.toFixed(2)), legs: pick.sampleN, via: pick.method });
      await sleep(SLEEP_MS);
    }

    return jsonResp({
      ok: true, candidates: candidates.length, skipped_fresh: fresh.size,
      attempted: toLearn.length, enriched, no_data: noData, took_ms: Math.round(performance.now() - t0),
    });
  } catch (e) {
    return jsonResp({ ok: false, error: String(e?.message || e) }, 500);
  }
});
