import { createClient } from "https://esm.sh/@supabase/supabase-js@2.58.0";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface FindCoverRequest {
  dep_icao: string;
  arr_icao?: string;
  request_date?: string;
  request_time_utc?: string;
  aircraft_category?: string;
}

interface Pitches {
  short: string;
  neutral: string;
  urgent: string;
}

// Clean operator name for consistent matching
const cleanOperatorName = (name: string): string => 
  name?.trim().replace(/\s+/g, ' ').toUpperCase() || '';

// Generate pitch variants
function generatePitches(
  operator: string,
  dep: string,
  arr: string | undefined,
  date: string | undefined,
  time: string | undefined,
  routeInfo: { flights_90d: number; median_block_mins: number | null; short_turn_rate?: number }
): Pitches {
  const route = arr ? `${dep}→${arr}` : `${dep} (flexible dest)`;
  const dateStr = date || 'flexible';
  const timeStr = time || 'flexible';
  const medianStr = routeInfo.median_block_mins ? `${routeInfo.median_block_mins}m` : 'N/A';
  const strRate = routeInfo.short_turn_rate ? `${(routeInfo.short_turn_rate * 100).toFixed(0)}%` : 'N/A';

  return {
    short: `Hi ${operator}, need cover ${route} ${dateStr} ~${timeStr}. You flew this ${routeInfo.flights_90d}x/90d (median ${medianStr}). Any availability?`,
    
    neutral: `Subject: ${dep}→${arr || 'any'} — coverage request ${dateStr}

Hi ${operator} team,

Client request for ${route} on ${dateStr} around ${timeStr}.

Based on your activity (${routeInfo.flights_90d} flights/90d, median block ${medianStr}, short-turn rate ${strRate}), you're a strong match for this corridor.

Can you advise on availability and coordinate with ops?

Thanks,
[Your name]`,

    urgent: `Subject: Short-notice ${dep}→${arr || 'flex'} TODAY

Hi ${operator},

Time-sensitive cover needed ${route} at ${timeStr}.
You're active on this corridor. Can you advise availability + terms ASAP?

Best,
[Your name]`
  };
}

// Score operator based on frequency, short-turn rate, and recency
function scoreOperator(
  flights_90d: number,
  short_turn_rate: number | null,
  recencyDays: number
): number {
  const frequency = flights_90d / 90; // flights per day
  const shortTurnBonus = 1 + (short_turn_rate || 0);
  
  // Recency bonus
  let recencyBonus = 0.5; // default: old data
  if (recencyDays < 7) recencyBonus = 1.5;
  else if (recencyDays < 30) recencyBonus = 1.0;
  
  return frequency * shortTurnBonus * recencyBonus;
}

Deno.serve(async (req) => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { dep_icao, arr_icao, request_date, request_time_utc, aircraft_category }: FindCoverRequest = await req.json();

    if (!dep_icao) {
      return new Response(
        JSON.stringify({ error: 'dep_icao is required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    console.log(`[find-cover] Searching: DEP=${dep_icao}, ARR=${arr_icao || 'any'}, Date=${request_date || 'flex'}`);

    // Query operator_route_intel_90d
    let operatorQuery = supabase
      .from('operator_route_intel_90d')
      .select('operator_name, flights_90d, median_block_mins, dow_hist_90d, hod_hist_90d')
      .eq('dep_icao', dep_icao);

    if (arr_icao) {
      operatorQuery = operatorQuery.eq('arr_icao', arr_icao);
    }

    const { data: routeData, error: routeError } = await operatorQuery;

    if (routeError) {
      console.error('[find-cover] Error querying route intel:', routeError);
      throw routeError;
    }

    if (!routeData || routeData.length === 0) {
      console.log('[find-cover] No historical activity found');
      return new Response(
        JSON.stringify({
          operators: [],
          tails: [],
          message: `No historical activity found for ${dep_icao}${arr_icao ? `→${arr_icao}` : ''} in the last 90 days.`
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Get recency data from operator_airport_intel_30d
    const operatorNames = [...new Set(routeData.map(r => r.operator_name))];
    const { data: recencyData } = await supabase
      .from('operator_airport_intel_30d')
      .select('operator_primary, last_seen')
      .eq('icao', dep_icao)
      .in('operator_primary', operatorNames);

    const recencyMap = new Map(
      recencyData?.map(r => [cleanOperatorName(r.operator_primary), r.last_seen]) || []
    );

    // Score operators
    const scoredOperators = routeData.map(op => {
      const lastSeen = recencyMap.get(cleanOperatorName(op.operator_name));
      const recencyDays = lastSeen 
        ? Math.floor((Date.now() - new Date(lastSeen).getTime()) / (1000 * 60 * 60 * 24))
        : 90; // default to 90 if unknown

      // Calculate short-turn rate from dow_hist_90d if available
      const shortTurnRate = op.dow_hist_90d ? 0.5 : null; // placeholder logic

      return {
        operator_name: op.operator_name,
        flights_90d: op.flights_90d,
        median_block_mins: op.median_block_mins,
        score: scoreOperator(op.flights_90d, shortTurnRate, recencyDays),
        recency_days: recencyDays,
        short_turn_rate: shortTurnRate,
      };
    });

    // Sort by score and take top 5
    scoredOperators.sort((a, b) => b.score - a.score);
    const topOperators = scoredOperators.slice(0, 5);

    console.log(`[find-cover] Found ${topOperators.length} operators`);

    // Enrich with contacts
    const normalizedOpNames = topOperators.map(o => cleanOperatorName(o.operator_name));
    const { data: contacts } = await supabase
      .from('operator_contacts')
      .select('operator_name, email_sales, phone_sales, website');

    const contactMap = new Map(
      contacts?.map(c => [cleanOperatorName(c.operator_name), c]) || []
    );

    const operators = topOperators.map(op => {
      const contact = contactMap.get(cleanOperatorName(op.operator_name));
      const recencyStr = op.recency_days < 7 ? 'last week' : 
                         op.recency_days < 30 ? 'last month' : 'over 30 days ago';
      const strRate = op.short_turn_rate ? `${(op.short_turn_rate * 100).toFixed(0)}%` : 'N/A';

      return {
        name: op.operator_name,
        score: op.score,
        reason: `${op.flights_90d} flights/90d • Short-turn ${strRate} • Last seen ${recencyStr}`,
        flights_90d: op.flights_90d,
        median_block_mins: op.median_block_mins || 0,
        contact: contact ? {
          email: contact.email_sales || undefined,
          phone: contact.phone_sales || undefined,
          website: contact.website || undefined,
        } : undefined,
        pitches: generatePitches(
          op.operator_name,
          dep_icao,
          arr_icao,
          request_date,
          request_time_utc,
          {
            flights_90d: op.flights_90d,
            median_block_mins: op.median_block_mins,
            short_turn_rate: op.short_turn_rate || undefined,
          }
        ),
      };
    });

    // Query tails from legs_90d
    const route = arr_icao ? `${dep_icao}→${arr_icao}` : dep_icao;
    let tailQuery = supabase
      .from('legs_90d')
      .select('n_number, aircraft_model, best_time_utc, airport_dep_icao, airport_arr_icao')
      .eq('airport_dep_icao', dep_icao);

    if (arr_icao) {
      tailQuery = tailQuery.eq('airport_arr_icao', arr_icao);
    }

    const { data: tailFlights, error: tailError } = await tailQuery;

    if (tailError) {
      console.error('[find-cover] Error querying tails:', tailError);
    }

    // Group tails by n_number
    const tailStats = new Map();
    tailFlights?.forEach(flight => {
      if (!flight.n_number) return;
      const existing = tailStats.get(flight.n_number);
      if (!existing) {
        tailStats.set(flight.n_number, {
          n_number: flight.n_number,
          model: flight.aircraft_model,
          count: 1,
          last_seen: flight.best_time_utc,
        });
      } else {
        existing.count++;
        if (new Date(flight.best_time_utc) > new Date(existing.last_seen)) {
          existing.last_seen = flight.best_time_utc;
        }
      }
    });

    // Sort tails by count and take top 10
    const topTails = Array.from(tailStats.values())
      .sort((a, b) => b.count - a.count)
      .slice(0, 10);

    // Enrich with operator and base info
    const tailNumbers = topTails.map(t => t.n_number);
    const { data: tailInfo } = await supabase
      .from('tail_operator_map_mv')
      .select('n_number, operator_primary, aircraft_model')
      .in('n_number', tailNumbers);

    const { data: baseInfo } = await supabase
      .from('aircraft_bases')
      .select('reg, base_icao')
      .in('reg', tailNumbers);

    const { data: habitsInfo } = await supabase
      .from('patterns_tail_habits')
      .select('n_number, rtb_rate_30d, turn_short_rate_30d, p95_turn_mins')
      .in('n_number', tailNumbers);

    const tailMapDict = new Map(tailInfo?.map(t => [t.n_number, t]) || []);
    const baseDict = new Map(baseInfo?.map(b => [b.reg, b.base_icao]) || []);
    const habitsDict = new Map(habitsInfo?.map(h => [h.n_number, h]) || []);

    const tails = topTails.map(t => {
      const info = tailMapDict.get(t.n_number);
      const base = baseDict.get(t.n_number);
      const habits = habitsDict.get(t.n_number);

      let reason = `Flew ${route} ${t.count}x/90d`;
      if (base) reason = `Based ${base}, ${reason}`;
      if (habits?.p95_turn_mins) reason += `, P95 turn ${habits.p95_turn_mins}m`;

      return {
        n_number: t.n_number,
        model: info?.aircraft_model || t.model || 'Unknown',
        base: base || 'Unknown',
        operator: info?.operator_primary || 'Unknown',
        last_seen: t.last_seen,
        reason,
        habits: habits ? {
          rtb_rate: habits.rtb_rate_30d,
          short_turn_rate: habits.turn_short_rate_30d,
          p95_turn_mins: habits.p95_turn_mins,
        } : null,
      };
    });

    console.log(`[find-cover] Returning ${operators.length} operators, ${tails.length} tails`);

    return new Response(
      JSON.stringify({ operators, tails }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('[find-cover] Error:', error);
    const message = error instanceof Error ? error.message : 'Unknown error';
    return new Response(
      JSON.stringify({ error: message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
