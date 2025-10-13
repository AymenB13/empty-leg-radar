-- Step 1: Clean up all views (including the existing one to recreate properly)
DROP VIEW IF EXISTS public.broker_feed_enriched_72h CASCADE;
DROP VIEW IF EXISTS public.broker_feed_opportunities_72h CASCADE;
DROP VIEW IF EXISTS public.broker_feed_opportunities CASCADE;
DROP VIEW IF EXISTS public.broker_feed_enriched CASCADE;

-- Step 2: Recreate broker_feed_enriched view with correct column mapping
CREATE VIEW public.broker_feed_enriched AS
WITH b AS (
  SELECT
    id,
    etd_utc,
    airport_dep_icao AS dep_icao,
    airport_arr_icao AS arr_icao,
    n_number,
    call_sign,
    flight_number,
    aircraft_model,
    operator_primary,
    operator_count
  FROM public.broker_feed
),
e AS (
  SELECT
    id,
    reg,
    reg_norm,
    airport_icao,
    to_icao,
    eta_arrival,
    etd_next,
    minutes_between,
    prob_baseline,
    prob_ml,
    prob_final,
    reason,
    status
  FROM public.emptyleg_signals
)
SELECT
  b.id                       AS broker_feed_id,
  b.dep_icao,
  b.arr_icao,
  b.etd_utc,
  b.call_sign,
  b.flight_number,
  b.n_number,
  b.aircraft_model,
  b.operator_primary,
  b.operator_count,
  e.id                       AS signal_id,
  e.minutes_between,
  e.prob_baseline,
  e.prob_ml,
  e.prob_final,
  e.reason,
  e.status
FROM b
LEFT JOIN e
  ON e.reg_norm = public.norm_n(b.n_number)
 AND e.airport_icao = b.dep_icao
 AND COALESCE(e.to_icao, b.arr_icao) = b.arr_icao
 AND e.etd_next IS NOT NULL
 AND ABS(EXTRACT(EPOCH FROM (e.etd_next - b.etd_utc))) <= 900;

-- Step 3: Recreate broker_feed_opportunities view with 0.30 threshold
CREATE VIEW public.broker_feed_opportunities AS
SELECT *
FROM public.broker_feed_enriched
WHERE prob_final IS NOT NULL
  AND COALESCE(status,'pending') = 'pending'
  AND prob_final >= 0.30
ORDER BY etd_utc ASC;

-- Step 4: Create performance indexes on emptyleg_signals table only
CREATE INDEX IF NOT EXISTS emptyleg_signals_join_idx
  ON public.emptyleg_signals (reg_norm, airport_icao, to_icao, etd_next)
  WHERE reg_norm IS NOT NULL;

-- Step 5: Grant SELECT permissions to authenticated role (CRITICAL)
GRANT USAGE ON SCHEMA public TO authenticated;

GRANT SELECT ON public.broker_feed_enriched      TO authenticated;
GRANT SELECT ON public.broker_feed_opportunities TO authenticated;
GRANT SELECT ON public.signals_publish_enriched  TO authenticated;
GRANT SELECT ON public.patterns_hot_hours_by_airport TO authenticated;
GRANT SELECT ON public.patterns_tail_habits      TO authenticated;
GRANT SELECT ON public.patterns_rtb_routes       TO authenticated;

-- Grant on demo view if it exists
DO $$ 
BEGIN
  IF EXISTS (SELECT FROM pg_views WHERE schemaname = 'public' AND viewname = 'bfe_demo') THEN
    GRANT SELECT ON public.bfe_demo TO authenticated;
  END IF;
END $$;