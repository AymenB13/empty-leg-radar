-- Index pour optimiser les requêtes daily_briefing par date + airport
CREATE INDEX IF NOT EXISTS idx_daily_briefing_date_airport
  ON public.daily_briefing (briefing_date, airport_icao);