-- Accorder l'accès au schéma public
GRANT USAGE ON SCHEMA public TO authenticated, anon;

-- GRANTs critiques sur les vues broker_feed
GRANT SELECT ON public.broker_feed_enriched TO authenticated, anon;
GRANT SELECT ON public.broker_feed_opportunities TO authenticated, anon;

-- GRANTs sur les autres vues utilisées par l'application
GRANT SELECT ON public.signals_publish_enriched TO authenticated, anon;
GRANT SELECT ON public.patterns_hot_hours_by_airport TO authenticated, anon;
GRANT SELECT ON public.patterns_tail_habits TO authenticated, anon;
GRANT SELECT ON public.patterns_rtb_routes TO authenticated, anon;