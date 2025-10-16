import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.38.4';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    console.log('Starting operator intelligence computation...');

    // Get distinct operators from operator_airport_intel_30d
    const { data: operators, error: opsError } = await supabase
      .from('operator_airport_intel_30d')
      .select('operator_primary')
      .order('operator_primary');

    if (opsError) throw opsError;

    const uniqueOperators = [...new Set(operators?.map(o => o.operator_primary) || [])];
    console.log(`Processing ${uniqueOperators.length} operators...`);

    const intelligence = [];

    for (const operator of uniqueOperators) {
      console.log(`Processing ${operator}...`);

      // 1. FOOTPRINT AIRPORTS
      const { data: airportData, error: airportErr } = await supabase
        .from('operator_airport_intel_30d')
        .select('airport_icao, flights_30d')
        .eq('operator_primary', operator)
        .order('flights_30d', { ascending: false })
        .limit(10);

      if (airportErr) {
        console.error(`Error fetching airports for ${operator}:`, airportErr);
        continue;
      }

      const footprint_airports = airportData?.map(a => ({
        icao: a.airport_icao,
        flights_30d: a.flights_30d,
        last_seen: new Date().toISOString(), // approximation
      })) || [];

      // 2. TOP ROUTES
      const { data: routeData, error: routeErr } = await supabase
        .from('operator_route_intel_90d')
        .select('dep_icao, arr_icao, legs_90d, short_turn_rate')
        .eq('operator_primary', operator)
        .order('legs_90d', { ascending: false })
        .limit(10);

      if (routeErr) {
        console.error(`Error fetching routes for ${operator}:`, routeErr);
        continue;
      }

      const top_routes = routeData?.map(r => ({
        dep: r.dep_icao,
        arr: r.arr_icao,
        legs: r.legs_90d,
        short_turn_rate: r.short_turn_rate || 0,
      })) || [];

      // 3. HOT HOURS (aggregate hod_hist_90d across all routes)
      const { data: allRoutes, error: hodErr } = await supabase
        .from('operator_route_intel_90d')
        .select('hod_hist_90d, legs_90d')
        .eq('operator_primary', operator);

      if (hodErr) {
        console.error(`Error fetching HOD data for ${operator}:`, hodErr);
        continue;
      }

      const hot_hours = new Array(24).fill(0);
      let totalWeight = 0;

      allRoutes?.forEach(route => {
        if (route.hod_hist_90d && Array.isArray(route.hod_hist_90d)) {
          const weight = route.legs_90d || 1;
          route.hod_hist_90d.forEach((score: number, hour: number) => {
            hot_hours[hour] += score * weight;
          });
          totalWeight += weight;
        }
      });

      // Normalize
      const normalized_hot_hours = hot_hours.map(h => totalWeight > 0 ? h / totalWeight : 0);

      // Find best call time (peak hour)
      const peakHour = normalized_hot_hours.indexOf(Math.max(...normalized_hot_hours));
      const best_call_time = `${peakHour}-${(peakHour + 2) % 24}h UTC`;

      // 4. RTB PATTERNS (placeholder - would need to join with aircraft_bases)
      const rtb_patterns = {
        bases: footprint_airports.slice(0, 3).map(a => a.icao),
        rtb_rate: 0.35, // placeholder - needs calculation
      };

      // 5. ACTIVE TAILS (from patterns_tail_habits)
      const { data: tailData, error: tailErr } = await supabase
        .from('patterns_tail_habits')
        .select('n_number, turn_short_rate_30d, last_seen_at')
        .order('last_seen_at', { ascending: false })
        .limit(10);

      if (tailErr) {
        console.error(`Error fetching tails for ${operator}:`, tailErr);
      }

      // Get tail-operator mapping
      const tailNumbers = tailData?.map(t => t.n_number) || [];
      const { data: tailMap } = await supabase
        .from('tail_operator_map_mv')
        .select('n_number, operator_primary, aircraft_model')
        .in('n_number', tailNumbers)
        .eq('operator_primary', operator);

      const tailMapDict = new Map(tailMap?.map(t => [t.n_number, t]) || []);

      const active_tails = tailData
        ?.filter(t => tailMapDict.has(t.n_number))
        .map(t => ({
          n_number: t.n_number,
          model: tailMapDict.get(t.n_number)?.aircraft_model || 'Unknown',
          base: footprint_airports[0]?.icao || 'Unknown',
          turn_rate: t.turn_short_rate_30d || 0,
        })) || [];

      intelligence.push({
        operator_name: operator,
        footprint_airports,
        top_routes,
        rtb_patterns,
        hot_hours: normalized_hot_hours,
        active_tails,
        best_call_time,
      });
    }

    // Upsert all intelligence
    const { error: upsertError } = await supabase
      .from('operator_intelligence')
      .upsert(intelligence, { onConflict: 'operator_name' });

    if (upsertError) throw upsertError;

    console.log(`Successfully computed intelligence for ${intelligence.length} operators`);

    return new Response(
      JSON.stringify({ 
        success: true, 
        operators_processed: intelligence.length 
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error: any) {
    console.error('Error computing operator intelligence:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { 
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );
  }
});
