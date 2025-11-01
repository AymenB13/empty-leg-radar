import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.38.4';

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

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    const { dep_icao, arr_icao, request_date, request_time_utc, aircraft_category }: FindCoverRequest = await req.json();

    if (!dep_icao) {
      return new Response(
        JSON.stringify({ error: 'dep_icao is required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log(`Finding cover for ${dep_icao} → ${arr_icao || 'any'}`);

    // 1. Query operator_route_intel_90d for matching routes
    let operatorQuery = supabase
      .from('operator_route_intel_90d')
      .select('operator_name, dep_icao, arr_icao, flights_90d, median_block_mins')
      .eq('dep_icao', dep_icao)
      .order('flights_90d', { ascending: false });

    if (arr_icao) {
      operatorQuery = operatorQuery.eq('arr_icao', arr_icao);
    }

    const { data: routeData, error: routeErr } = await operatorQuery.limit(20);

    if (routeErr) throw routeErr;

    // 2. Score operators
    const scoredOperators = routeData?.map(r => {
      const frequency = r.flights_90d / 90; // flights per day
      
      return {
        ...r,
        score: frequency,
      };
    }).sort((a, b) => b.score - a.score) || [];

    // 3. Enrich with operator contacts
    const operatorNames = scoredOperators.map(o => o.operator_name);
    const { data: contacts } = await supabase
      .from('operator_contacts')
      .select('operator_name, email_sales, phone_sales, website')
      .in('operator_name', operatorNames);

    const contactMap = new Map(contacts?.map(c => [c.operator_name, c]) || []);

    const operators = scoredOperators.map(op => {
      const contact = contactMap.get(op.operator_name);
      const route = arr_icao ? `${dep_icao}→${arr_icao}` : `${dep_icao}→any`;
      
      return {
        name: op.operator_name,
        reason: `Flew ${route} ${op.flights_90d}x last 90d, median block ${op.median_block_mins || 'N/A'}min`,
        flights_90d: op.flights_90d,
        median_block_mins: op.median_block_mins || 0,
        contact: contact ? {
          email: contact.email_sales || undefined,
          phone: contact.phone_sales || undefined,
          website: contact.website || undefined,
        } : undefined,
        email_script: generateEmailScript(op.operator_name, dep_icao, arr_icao, request_date, request_time_utc, aircraft_category, op),
      };
    });

    // 4. Query legs_90d for tails
    let tailQuery = supabase
      .from('legs_90d')
      .select('n_number, dep_icao, arr_icao, dep_time_utc')
      .eq('dep_icao', dep_icao)
      .gte('dep_time_utc', new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString());

    if (arr_icao) {
      tailQuery = tailQuery.eq('arr_icao', arr_icao);
    }

    const { data: tailLegs, error: tailErr } = await tailQuery;

    if (tailErr) throw tailErr;

    // Group by n_number, count flights, get last seen
    const tailStats = new Map<string, { count: number; last_seen: string }>();
    tailLegs?.forEach(leg => {
      const current = tailStats.get(leg.n_number) || { count: 0, last_seen: leg.dep_time_utc };
      tailStats.set(leg.n_number, {
        count: current.count + 1,
        last_seen: leg.dep_time_utc > current.last_seen ? leg.dep_time_utc : current.last_seen,
      });
    });

    const topTails = Array.from(tailStats.entries())
      .sort((a, b) => {
        if (b[1].count !== a[1].count) return b[1].count - a[1].count;
        return new Date(b[1].last_seen).getTime() - new Date(a[1].last_seen).getTime();
      })
      .slice(0, 15)
      .map(([n_number, stats]) => ({ n_number, ...stats }));

    // 5. Enrich tails with tail_operator_map_mv, aircraft_bases, patterns_tail_habits
    const tailNumbers = topTails.map(t => t.n_number);
    
    const { data: tailMap } = await supabase
      .from('tail_operator_map_mv')
      .select('n_number, operator_primary, aircraft_model')
      .in('n_number', tailNumbers);

    const { data: bases } = await supabase
      .from('aircraft_bases')
      .select('reg, base_icao')
      .in('reg', tailNumbers);

    const tailMapDict = new Map(tailMap?.map(t => [t.n_number, t]) || []);
    const baseDict = new Map(bases?.map(b => [b.reg, b.base_icao]) || []);

    const tails = topTails.map(t => {
      const info = tailMapDict.get(t.n_number);
      const base = baseDict.get(t.n_number);
      const route = arr_icao ? `${dep_icao}→${arr_icao}` : dep_icao;
      
      return {
        n_number: t.n_number,
        model: info?.aircraft_model || 'Unknown',
        base: base || 'Unknown',
        operator: info?.operator_primary || 'Unknown',
        reason: `${base ? `Based at ${base}, ` : ''}flew ${route} ${t.count}x last 30d`,
        last_seen: t.last_seen,
      };
    });

    return new Response(
      JSON.stringify({ operators, tails }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error: any) {
    console.error('Error in find-cover:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { 
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );
  }
});

function generateEmailScript(
  operator: string,
  dep: string,
  arr: string | undefined,
  date: string | undefined,
  time: string | undefined,
  category: string | undefined,
  routeInfo: any
): string {
  const route = arr ? `${dep}→${arr}` : `${dep} (flexible destination)`;
  const dateStr = date || 'flexible date';
  const timeStr = time || 'flexible timing';
  const aircraftStr = category || 'business jet';

  return `Subject: Short-notice request ${dep}→${arr || '(any)'} on ${dateStr}

Hi ${operator},

We're helping a client with a ${aircraftStr} request:
• Route: ${route}
• Date/Time: ${dateStr} around ${timeStr}

Based on public patterns, ${operator} flew this route ${routeInfo.flights_90d}x in the last 90 days (median block ${routeInfo.median_block_mins || 'N/A'}min).

Would you have availability? If so, who's the best ops/charter contact?

Thanks,
[Your name]`;
}
