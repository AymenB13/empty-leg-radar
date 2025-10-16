-- ============================================
-- Sprint 1: RLS Policies + Refresh Function
-- ============================================

-- 1. Permissions sur daily_briefing (READ-ONLY pour authenticated)
GRANT SELECT ON public.daily_briefing TO authenticated;

ALTER TABLE public.daily_briefing ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow authenticated to read daily_briefing"
  ON public.daily_briefing FOR SELECT
  TO authenticated
  USING (true);

-- 2. Permissions sur operator_intelligence (READ-ONLY pour authenticated)
GRANT SELECT ON public.operator_intelligence TO authenticated;

ALTER TABLE public.operator_intelligence ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow authenticated to read operator_intelligence"
  ON public.operator_intelligence FOR SELECT
  TO authenticated
  USING (true);

-- 3. Fonction refresh pour les MVs (UNIQUEMENT pour service role, non exposée aux users)
CREATE OR REPLACE FUNCTION public.refresh_intel_matviews()
RETURNS void
LANGUAGE sql
SECURITY DEFINER
AS $$
  REFRESH MATERIALIZED VIEW CONCURRENTLY legs_90d;
  REFRESH MATERIALIZED VIEW CONCURRENTLY operator_airport_intel_30d;
  REFRESH MATERIALIZED VIEW CONCURRENTLY operator_route_intel_90d;
$$;

-- PAS de GRANT EXECUTE sur cette fonction (seulement pour scheduler)