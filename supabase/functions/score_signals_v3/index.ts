// supabase/functions/score_signals_v3/index.ts
// Scoring heuristique TRANSPARENT (ML retiré le 2026-07 — plus de ml_models/logit).
// Écrit prob_baseline (= score heuristique), prob_final (= prob_baseline), prob_emptyleg (= prob_final).
// Conserve : gate Part135 + fallback "solo departure".
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const SUPABASE_URL = Deno.env.get("SUPABASE_URL");
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");

// ▶️ Paramètres runtime
const ARR_LOOKBACK_HOURS = Number(Deno.env.get("ARR_LOOKBACK_HOURS") ?? 4);   // fenêtre d’arrivées
const MAX_TURN_MIN       = Number(Deno.env.get("MAX_TURN_MIN") ?? 150);       // turn pairing max
// Fallback “solo departure”
const SOLO_LOOKBACK_HOURS = Number(Deno.env.get("SOLO_LOOKBACK_HOURS") ?? 12); // dernier passage au sol toléré
const SOLO_BASELINE       = Number(Deno.env.get("SOLO_BASELINE") ?? 0.38);     // baseline plus prudente

function hashString(s) {
  let h = 0;
  for (let i = 0; i < s.length; i++) h = Math.imul(31, h) + s.charCodeAt(i) | 0;
  return String(h);
}
const clamp   = (x, a, b) => Math.max(a, Math.min(b, x));
const toRad   = (d) => d * Math.PI / 180;

// haversine → km
function haversineKm(a, b) {
  const R = 6371;
  const dLat = toRad(b[0] - a[0]);
  const dLon = toRad(b[1] - a[1]);
  const lat1 = toRad(a[0]);
  const lat2 = toRad(b[0]);
  const h = Math.sin(dLat / 2) ** 2 + Math.cos(lat1) * Math.cos(lat2) * Math.sin(dLon / 2) ** 2;
  return 2 * R * Math.atan2(Math.sqrt(h), Math.sqrt(1 - h));
}
const kmToNm = (km) => km * 0.539957;

// Normalise N-number (US)
function normN(reg) {
  if (!reg) return null;
  const x = reg.replace(/\s+/g, "").toUpperCase();
  if (!x) return null;
  return x.startsWith("N") ? x : "N" + x.replace(/[^0-9A-Z]/g, "");
}

Deno.serve(async () => {
  const db = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);
  try {
    // Fenêtres : arrivées [-ARR_LOOKBACK_HOURS, +5min], départs [now, +3h]
    const now     = Date.now();
    const arrFrom = new Date(now - ARR_LOOKBACK_HOURS * 3600_000).toISOString();
    const arrTo   = new Date(now + 5 * 60_000).toISOString();
    const depFrom = new Date(now).toISOString();
    const depTo   = new Date(now + 3 * 3600_000).toISOString();

    // Aéroports actifs
    const { data: watch } = await db.from("watch_airports").select("icao").eq("active", true);
    const watchIcaos = (watch ?? []).map(r => (r.icao ?? "").toUpperCase()).filter(Boolean);
    if (!watchIcaos.length) {
      return new Response(JSON.stringify({ ok: true, inserted_or_updated: 0, note: "no watched airports" }), {
        headers: { "Content-Type": "application/json" }
      });
    }

    // Vols canoniques dans la fenêtre
    const { data: rows, error } = await db
      .from("flights_canonical")
      .select("flight_uid,dep_icao,dep_time_utc,arr_icao,arr_time_utc,aircraft_reg,aircraft_mode_s,aircraft_model")
      .or(
        `and(arr_icao.in.(${watchIcaos.join(",")}),arr_time_utc.gte.${arrFrom},arr_time_utc.lte.${arrTo}),` +
        `and(dep_icao.in.(${watchIcaos.join(",")}),dep_time_utc.gte.${depFrom},dep_time_utc.lte.${depTo})`
      );
    if (error) return new Response(`DB read error: ${error.message}`, { status: 500 });

    // Indexation Arrivées/Départs par (reg|modeS, ICAO)
    const key = (reg, modeS, icao) =>
      `${(reg ?? "").toUpperCase()}|${(modeS ?? "").toUpperCase()}|${(icao ?? "").toUpperCase()}`;

    const arrivalsByKey   = new Map();
    const departuresByKey = new Map();
    for (const r of rows ?? []) {
      if (r.arr_icao && r.arr_time_utc) {
        const k = key(r.aircraft_reg, r.aircraft_mode_s, r.arr_icao);
        (arrivalsByKey.get(k) ?? arrivalsByKey.set(k, []).get(k)).push(r);
      }
      if (r.dep_icao && r.dep_time_utc) {
        const k = key(r.aircraft_reg, r.aircraft_mode_s, r.dep_icao);
        (departuresByKey.get(k) ?? departuresByKey.set(k, []).get(k)).push(r);
      }
    }
    for (const v of arrivalsByKey.values())   v.sort((a,b) => Date.parse(a.arr_time_utc) - Date.parse(b.arr_time_utc));
    for (const v of departuresByKey.values()) v.sort((a,b) => Date.parse(a.dep_time_utc) - Date.parse(b.dep_time_utc));

    // ---------- Bases opérateur (via aircraft_bases) ----------
    const regs  = Array.from(new Set((rows ?? []).map(r => r.aircraft_reg).filter(Boolean)));
    const modes = Array.from(new Set((rows ?? []).map(r => r.aircraft_mode_s).filter(Boolean)));
    const baseByReg   = {};
    const baseByModeS = {};
    if (regs.length) {
      const { data: rowsR } = await db.from("aircraft_bases").select("reg,base_icao").in("reg", regs);
      for (const r of rowsR || []) if (r.reg) baseByReg[r.reg] = (r.base_icao || "").toUpperCase();
    }
    if (modes.length) {
      const { data: rowsM } = await db.from("aircraft_bases").select("mode_s,base_icao").in("mode_s", modes);
      for (const r of rowsM || []) if (r.mode_s) baseByModeS[r.mode_s] = (r.base_icao || "").toUpperCase();
    }

    // ---------- Coordonnées aéroports ----------
    const icaosSet = new Set();
    for (const r of rows ?? []) {
      if (r.arr_icao) icaosSet.add((r.arr_icao || "").toUpperCase());
      if (r.dep_icao) icaosSet.add((r.dep_icao || "").toUpperCase());
    }
    Object.values(baseByReg).forEach(v => v && icaosSet.add(v));
    Object.values(baseByModeS).forEach(v => v && icaosSet.add(v));
    const icaos = Array.from(icaosSet);

    const airportCoords = new Map();
    if (icaos.length) {
      const { data: apRows } = await db
        .from("ourairports")
        .select("ident,icao_code,gps_code,latitude_deg,longitude_deg")
        .in("ident", icaos);
      for (const ar of apRows || []) {
        const icao = (ar.ident || ar.icao_code || ar.gps_code || "").toUpperCase();
        if (icao && ar.latitude_deg != null && ar.longitude_deg != null) {
          airportCoords.set(icao, [Number(ar.latitude_deg), Number(ar.longitude_deg)]);
        }
      }
      const missing = icaos.filter(c => !airportCoords.has(c));
      if (missing.length) {
        const { data: waRows } = await db
          .from("watch_airports")
          .select("icao,latitude_deg,longitude_deg")
          .in("icao", missing);
        for (const ar of waRows || []) {
          const icao = (ar.icao || "").toUpperCase();
          if (icao && ar.latitude_deg != null && ar.longitude_deg != null) {
            airportCoords.set(icao, [Number(ar.latitude_deg), Number(ar.longitude_deg)]);
          }
        }
      }
    }

    // ---------- Part135 : features tail (is_part135) + mapping tail_operator_map_mv ----------
    // (features_aircraft_daily reste alimentée par build_features_daily et sert aussi la page Patterns)
    const nSet  = new Set();
    (rows ?? []).forEach(r => { const n = normN(r.aircraft_reg); if (n) nSet.add(n); });
    const nList = Array.from(nSet);

    const tailFeatMap = new Map();
    if (nList.length) {
      const { data: tfRows } = await db
        .from("features_aircraft_daily")
        .select("n_number,is_part135,as_of_date")
        .in("n_number", nList)
        .order("n_number", { ascending: true })
        .order("as_of_date", { ascending: false });
      for (const r of tfRows || []) {
        const kk = r.n_number?.toUpperCase();
        if (kk && !tailFeatMap.has(kk)) tailFeatMap.set(kk, r);
      }
    }

    // 🔒 map Part135 via tail_operator_map_mv (proxy 135)
    const part135Tails = new Set();
    if (nList.length) {
      const { data: tmap } = await db
        .from("tail_operator_map_mv")
        .select("n_number")
        .in("n_number", nList);
      for (const r of tmap || []) {
        const n = (r.n_number || "").toUpperCase();
        if (n) part135Tails.add(n);
      }
    }

    // Pairing + scoring heuristique (avec filtrage Part135)
    const toUpsert = [];
    // Pour éviter les doublons avec le fallback “solo”
    const existingSigKeys = new Set();

    for (const [, arrs] of arrivalsByKey.entries()) {
      const sample = arrs[0];
      const depsKey = key(sample.aircraft_reg, sample.aircraft_mode_s, sample.arr_icao);
      const deps = departuresByKey.get(depsKey) ?? [];
      if (!deps.length) continue;

      for (const a of arrs) {
        const aT = Date.parse(a.arr_time_utc);
        const d = deps.find(d0 => Date.parse(d0.dep_time_utc) >= aT);
        if (!d) continue;

        const diffMin = (Date.parse(d.dep_time_utc) - aT) / 60000;
        if (diffMin < 0 || diffMin > MAX_TURN_MIN) continue;

        const reg    = a.aircraft_reg ?? undefined;
        const modeS  = a.aircraft_mode_s ?? undefined;
        const airport = (a.arr_icao || "").toUpperCase();
        const toIcao  = (d.arr_icao  || "").toUpperCase() || null;

        // Base via reg puis mode_s
        const base = (reg && baseByReg[reg]) || (modeS && baseByModeS[modeS]) || null;
        const baseU = base ? base.toUpperCase() : null;

        // ---- Score heuristique ----
        const reasons = [];
        let prob_headsup  = 0.6 + Math.max(0, 90 - diffMin) / 300; // ~0.6..0.9
        let prob_baseline = 0.5;

        // Distances à la base : depuis l'aéroport actuel ET depuis la destination (scoring directionnel)
        let distCurrBaseNm = null, distDestBaseNm = null;
        if (baseU && airportCoords.has(baseU)) {
          if (airportCoords.has(airport)) distCurrBaseNm = kmToNm(haversineKm(airportCoords.get(airport), airportCoords.get(baseU)));
          if (toIcao && airportCoords.has(toIcao)) distDestBaseNm = kmToNm(haversineKm(airportCoords.get(toIcao), airportCoords.get(baseU)));
        }
        // Un empty leg = aller VERS la base (repositionnement à vide), pas être PRÈS de la base
        if (!baseU) { prob_baseline -= 0.03; reasons.push("base_unknown"); }
        else if (toIcao && baseU === toIcao) { prob_baseline += 0.20; reasons.push("return_to_base"); }
        else if (distCurrBaseNm != null && distCurrBaseNm <= 40 && distDestBaseNm != null && distDestBaseNm > distCurrBaseNm) {
          prob_baseline -= 0.12; reasons.push("leaving_base");
        }
        else if (distDestBaseNm != null && distCurrBaseNm != null && distDestBaseNm < distCurrBaseNm - 80) {
          prob_baseline += 0.10; reasons.push(`heading_home(${Math.round(distDestBaseNm)}nm)`);
        }
        else if (distDestBaseNm != null && distCurrBaseNm != null && distDestBaseNm > distCurrBaseNm + 80) {
          prob_baseline -= 0.05; reasons.push("heading_away");
        }
        else { reasons.push("lateral"); }
        if (diffMin <= 60) { prob_baseline += 0.06; reasons.push("very_short_turn"); }
        else if (diffMin > 180) { prob_baseline -= 0.06; reasons.push("long_turn"); }
        prob_headsup  = clamp(prob_headsup, 0, 0.98);
        prob_baseline = clamp(prob_baseline, 0, 0.98);

        // 🔒 Gate Part135 (features OU mapping)
        const nNorm  = normN(reg);
        const tFeat  = nNorm ? tailFeatMap.get(nNorm) : undefined;
        const is_part135 = tFeat?.is_part135 ? 1 : 0;
        const is135ByFeat = is_part135 === 1;
        const is135ByMap  = nNorm ? part135Tails.has(nNorm) : false;
        if (!(is135ByFeat || is135ByMap)) continue;

        // ---- Score final = heuristique transparente (ML retiré) ----
        const prob_final = prob_baseline;

        const reason = reasons.length ? reasons.join(" | ") : "Fast turnaround";

        const dedup_key = hashString(JSON.stringify({
          reg: reg ?? modeS ?? "NA",
          airport_icao: airport,
          eta: new Date(a.arr_time_utc).toISOString().slice(0, 16),
          etd: new Date(d.dep_time_utc).toISOString().slice(0, 16),
          to: toIcao ?? "NA"
        }));

        const row = {
          reg,
          mode_s: modeS ?? null,
          airport_icao: airport,
          from_icao: null,
          to_icao: toIcao,
          eta_arrival: new Date(a.arr_time_utc).toISOString(),
          etd_next: new Date(d.dep_time_utc).toISOString(),
          minutes_between: Math.round(diffMin),
          prob_headsup,
          prob_emptyleg: prob_final,
          prob_baseline,
          prob_final,
          reason,
          status: "pending",
          dedup_key
        };

        toUpsert.push(row);
        existingSigKeys.add(`${row.reg ?? row.mode_s}|${row.airport_icao}|${row.to_icao}|${row.etd_next}`);
      }
    }

    // ---------- Fallback “solo departure” (pas d’arrivée ≤ MAX_TURN_MIN) ----------
    for (const d of rows ?? []) {
      if (!d.dep_icao || !d.dep_time_utc) continue;

      const depIcao = (d.dep_icao || "").toUpperCase();
      const toIcao  = (d.arr_icao  || "").toUpperCase() || null;
      const reg     = d.aircraft_reg ?? undefined;
      const modeS   = d.aircraft_mode_s ?? undefined;
      const depISO  = new Date(d.dep_time_utc).toISOString();

      // déjà couvert par un signal pairé ?
      const dupKey = `${reg ?? modeS}|${depIcao}|${toIcao}|${depISO}`;
      if (existingSigKeys.has(dupKey)) continue;

      // Existe-t-il une arrivée juste avant (≤ MAX_TURN_MIN) ? Si oui, le pairing l’a déjà géré
      const arrs = arrivalsByKey.get(key(reg, modeS, depIcao)) ?? [];
      let latestArr = null, latestArrT = 0;
      const dT = Date.parse(d.dep_time_utc);
      for (const a of arrs) {
        const aT = Date.parse(a.arr_time_utc);
        if (aT <= dT) { latestArr = a; latestArrT = aT; } else { break; }
      }
      if (latestArr && (dT - latestArrT) / 60000 <= MAX_TURN_MIN) continue;

      // Base via reg puis mode_s
      const base = (reg && baseByReg[reg]) || (modeS && baseByModeS[modeS]) || null;
      const baseU = base ? base.toUpperCase() : null;

      // Gate Part 135
      const nNorm  = normN(reg);
      const tFeat  = nNorm ? tailFeatMap.get(nNorm) : undefined;
      const is_part135 = tFeat?.is_part135 ? 1 : 0;
      const is135ByFeat = is_part135 === 1;
      const is135ByMap  = nNorm ? part135Tails.has(nNorm) : false;
      if (!(is135ByFeat || is135ByMap)) continue;

      // “Vu récemment au sol” ?
      const recentArrMin = latestArr ? (dT - latestArrT) / 60000 : Infinity;
      const seenRecently = Number.isFinite(recentArrMin) && recentArrMin <= SOLO_LOOKBACK_HOURS * 60;

      // Fallback seulement si base_departure OU vu récemment
      const isBaseDeparture = !!(baseU && baseU === depIcao);
      if (!(isBaseDeparture || seenRecently)) continue;

      // Baseline prudente
      const reasons = ["solo_departure"];
      let prob_headsup  = 0.55;
      let prob_baseline = SOLO_BASELINE;
      if (isBaseDeparture) { prob_baseline += 0.06; reasons.push("base_departure"); }
      if (seenRecently)    {
        prob_baseline += 0.04;
        reasons.push(`last_arrival_${Math.round(recentArrMin)}min_ago`);
      }
      if (baseU && toIcao && baseU === toIcao) { prob_baseline += 0.12; reasons.push("to_base"); }
      if (is_part135 === 1) reasons.push("part135_operator");

      prob_headsup  = clamp(prob_headsup, 0, 0.98);
      prob_baseline = clamp(prob_baseline, 0, 0.98);

      // Score final = heuristique transparente (ML retiré)
      const prob_final = prob_baseline;

      const reason = reasons.join(" | ");

      const dedup_key = hashString(JSON.stringify({
        reg: reg ?? modeS ?? "NA",
        airport_icao: depIcao,
        eta: "NA-SOLO",
        etd: depISO.slice(0, 16),
        to: toIcao ?? "NA"
      }));

      const row = {
        reg,
        mode_s: modeS ?? null,
        airport_icao: depIcao,
        from_icao: null,
        to_icao: toIcao,
        eta_arrival: null,
        etd_next: depISO,
        minutes_between: null,
        prob_headsup,
        prob_emptyleg: prob_final,
        prob_baseline,
        prob_final,
        reason,
        status: "pending",
        dedup_key
      };

      toUpsert.push(row);
      existingSigKeys.add(dupKey);
    }

    // Upsert
    let n = 0;
    for (const row of toUpsert) {
      const { error: upErr } = await db.from("emptyleg_signals").upsert(row, { onConflict: "dedup_key" });
      if (!upErr) n++;
    }

    // 🔄 Refresh MV si on a écrit des lignes
    if (toUpsert.length) {
      try { await db.rpc("refresh_mv_signals_publish"); } catch {}
    }

    return new Response(JSON.stringify({ ok: true, inserted_or_updated: n }), {
      headers: { "Content-Type": "application/json" }
    });
  } catch (e) {
    return new Response(`Server error: ${e?.message ?? String(e)}`, { status: 500 });
  }
});
