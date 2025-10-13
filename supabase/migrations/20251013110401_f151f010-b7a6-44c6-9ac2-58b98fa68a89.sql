-- Create filtered views for 72-hour window
-- This fixes the temporal filtering issue in the frontend

-- View for Live Feed (all flights in next 72 hours)
CREATE OR REPLACE VIEW public.broker_feed_enriched_72h AS
SELECT *
FROM public.broker_feed_enriched
WHERE etd_utc >= NOW()
  AND etd_utc <= NOW() + INTERVAL '72 hours'
ORDER BY etd_utc ASC;

-- View for Probables (72h window + probability threshold)
CREATE OR REPLACE VIEW public.broker_feed_opportunities_72h AS
SELECT *
FROM public.broker_feed_enriched
WHERE etd_utc >= NOW()
  AND etd_utc <= NOW() + INTERVAL '72 hours'
  AND prob_final IS NOT NULL
  AND prob_final >= 0.30
  AND COALESCE(status,'pending') = 'pending'
ORDER BY etd_utc ASC;

-- Grant access to authenticated users
GRANT SELECT ON public.broker_feed_enriched_72h TO authenticated;
GRANT SELECT ON public.broker_feed_opportunities_72h TO authenticated;