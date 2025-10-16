import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.38.4';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface HotHour {
  hour: number;
  score: number;
  sample_n: number;
}

interface ProbableRoute {
  dep: string;
  arr: string;
  prob: number;
  dow?: string;
}

interface PriorityOperator {
  name: string;
  reason: string;
  contact?: {
    email?: string;
    phone?: string;
    website?: string;
  };
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const startTs = Date.now();
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    console.log('Starting daily briefing generation...');

    // Get airports from airports_watch (canonical source)
    const { data: watchRows, error: wErr } = await supabase
      .from('airports_watch')
      .select('airport_icao')
      .eq('enabled', true)
      .order('airport_icao');

    if (wErr) throw wErr;

    const uniqueAirports = [...new Set((watchRows ?? []).map(r => r.airport_icao).filter(Boolean))];
    console.log(`Processing ${uniqueAirports.length} airports...`);

    const today = new Date().toISOString().split('T')[0];
    const briefings = [];

    for (const airport of uniqueAirports) {
      console.log(`Processing ${airport}...`);

      // 1. HOT HOURS - aggregate hod_hist_90d from all routes departing this airport
      const { data: routeData, error: routeError } = await supabase
        .from('operator_route_intel_90d')
        .select('hod_hist_90d, legs_90d')
        .eq('dep_icao', airport);

      if (routeError) {
        console.error(`Error fetching routes for ${airport}:`, routeError);
        continue;
      }

      // Aggregate hot hours (weighted by legs_90d)
      const hourScores = new Array(24).fill(0);
      let totalWeight = 0;

      routeData?.forEach(route => {
        if (route.hod_hist_90d && Array.isArray(route.hod_hist_90d)) {
          const weight = route.legs_90d || 1;
          route.hod_hist_90d.forEach((score: number, hour: number) => {
            hourScores[hour] += score * weight;
          });
          totalWeight += weight;
        }
      });

      // Normalize and create hot_hours array
      let hot_hours: HotHour[];
      
      if (totalWeight === 0 || !routeData || routeData.length === 0) {
        // Fallback: generate business hours pattern (8h-20h)
        console.log(`No route data for ${airport}, using fallback pattern`);
        hot_hours = Array.from({ length: 24 }, (_, hour) => ({
          hour,
          score: (hour >= 8 && hour <= 20) ? 1/13 : 0,
          sample_n: 0,
        }));
      } else {
        hot_hours = hourScores
          .map((score, hour) => ({
            hour,
            score: totalWeight > 0 ? score / totalWeight : 0,
            sample_n: routeData?.length || 0,
          }))
          .sort((a, b) => b.score - a.score);
      }

      // 2. PROBABLE ROUTES - top 10 routes by probability
      const { data: routes, error: routesErr } = await supabase
        .from('operator_route_intel_90d')
        .select('dep_icao, arr_icao, legs_90d, short_turn_rate, last_seen_at')
        .eq('dep_icao', airport)
        .order('legs_90d', { ascending: false })
        .limit(20);

      if (routesErr) {
        console.error(`Error fetching probable routes for ${airport}:`, routesErr);
        continue;
      }

      const probable_routes: ProbableRoute[] = routes
        ?.map(r => {
          const frequency = r.legs_90d / 90; // flights per day
          const turnBonus = 1 + (r.short_turn_rate || 0);
          const recencyDays = r.last_seen_at 
            ? Math.floor((Date.now() - new Date(r.last_seen_at).getTime()) / (1000 * 60 * 60 * 24))
            : 90;
          const recencyBonus = recencyDays < 7 ? 1.5 : recencyDays < 30 ? 1.0 : 0.5;
          
          return {
            dep: r.dep_icao,
            arr: r.arr_icao,
            prob: Math.min(1, frequency * turnBonus * recencyBonus / 10),
          };
        })
        .sort((a, b) => b.prob - a.prob)
        .slice(0, 10) || [];

      // 3. PRIORITY OPERATORS - top 5 operators by activity
      const { data: operators, error: opsErr } = await supabase
        .from('operator_airport_intel_30d')
        .select('operator_primary, flights_30d, rtb_rate_24h')
        .eq('airport_icao', airport)
        .order('flights_30d', { ascending: false })
        .limit(5);

      if (opsErr) {
        console.error(`Error fetching operators for ${airport}:`, opsErr);
        continue;
      }

      // Enrich with contacts
      const operatorNames = operators?.map(o => o.operator_primary) || [];
      const { data: contacts } = await supabase
        .from('operator_contacts')
        .select('operator_name, email_sales, phone_sales, website')
        .in('operator_name', operatorNames);

      const contactMap = new Map(contacts?.map(c => [c.operator_name, c]) || []);

      const priority_operators: PriorityOperator[] = operators?.map(op => ({
        name: op.operator_primary,
        reason: `${op.flights_30d} flights/30d, RTB rate ${Math.round((op.rtb_rate_24h || 0) * 100)}%`,
        contact: contactMap.has(op.operator_primary) ? {
          email: contactMap.get(op.operator_primary)?.email_sales || undefined,
          phone: contactMap.get(op.operator_primary)?.phone_sales || undefined,
          website: contactMap.get(op.operator_primary)?.website || undefined,
        } : undefined,
      })) || [];

      briefings.push({
        airport_icao: airport,
        briefing_date: today,
        hot_hours,
        probable_routes,
        priority_operators,
      });
    }

    // Upsert all briefings
    const { error: upsertError } = await supabase
      .from('daily_briefing')
      .upsert(briefings, { onConflict: 'airport_icao,briefing_date' });

    if (upsertError) throw upsertError;

    // Log success to ingest_logs
    await supabase.from('ingest_logs').insert({
      function_name: 'generate-daily-briefing',
      airport_icao: 'ALL',
      status_code: 200,
      rows_written: briefings.length,
      latency_ms: Date.now() - startTs,
      message: `Generated ${briefings.length} briefings for ${today}`,
    });

    console.log(`Successfully generated ${briefings.length} briefings for ${today}`);

    return new Response(
      JSON.stringify({ 
        success: true, 
        briefings_generated: briefings.length,
        date: today 
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error: any) {
    console.error('Error generating daily briefing:', error);
    
    // Log error to ingest_logs
    try {
      const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
      const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
      const supabase = createClient(supabaseUrl, supabaseKey);
      
      await supabase.from('ingest_logs').insert({
        function_name: 'generate-daily-briefing',
        airport_icao: 'ALL',
        status_code: 500,
        rows_written: 0,
        latency_ms: 0,
        message: `Error: ${error.message}`,
      });
    } catch (logError) {
      console.error('Failed to log error:', logError);
    }
    
    return new Response(
      JSON.stringify({ error: error.message }),
      { 
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );
  }
});
