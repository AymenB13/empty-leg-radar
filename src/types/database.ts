import { Database } from "@/integrations/supabase/types";

export type UserSettings = Database["public"]["Tables"]["user_settings"]["Row"];
export type UserSettingsInsert = Database["public"]["Tables"]["user_settings"]["Insert"];
export type UserSettingsUpdate = Database["public"]["Tables"]["user_settings"]["Update"];

export type Watchlist = Database["public"]["Tables"]["watchlists"]["Row"];
export type WatchlistInsert = Database["public"]["Tables"]["watchlists"]["Insert"];
export type WatchlistUpdate = Database["public"]["Tables"]["watchlists"]["Update"];

export type EmptylegSignal = Database["public"]["Tables"]["emptyleg_signals"]["Row"];
export type SignalPublishEnriched = Database["public"]["Views"]["signals_publish_enriched"]["Row"];
export type BrokerFeed = Database["public"]["Views"]["broker_feed"]["Row"];
export type PatternsHotHours = Database["public"]["Views"]["patterns_hot_hours_by_airport"]["Row"];
export type PatternsTailHabits = Database["public"]["Views"]["patterns_tail_habits"]["Row"];
export type PatternsRTBRoutes = Database["public"]["Views"]["patterns_rtb_routes"]["Row"];
export type TailOperatorMap = Database["public"]["Views"]["tail_operator_map_mv"]["Row"];

// Nouvelles vues pour Opportunities
export type BrokerFeedEnriched = {
  broker_feed_id: number | null;
  signal_id: number | null;
  dep_icao: string | null;
  arr_icao: string | null;
  etd_utc: string | null;
  call_sign: string | null;
  flight_number: string | null;
  aircraft_model: string | null;
  n_number: string | null;
  operator_primary: string | null;
  operator_count: number | null;
  status: string | null;
  reason: string | null;
  prob_final: number | null;
  prob_ml: number | null;
  prob_baseline: number | null;
  minutes_between: number | null;
};

export type BrokerFeedOpportunities = {
  broker_feed_id: number | null;
  signal_id: number | null;
  dep_icao: string | null;
  arr_icao: string | null;
  etd_utc: string | null;
  call_sign: string | null;
  flight_number: string | null;
  aircraft_model: string | null;
  n_number: string | null;
  operator_primary: string | null;
  operator_count: number | null;
  status: string | null;
  reason: string | null;
  prob_final: number | null;
  prob_ml: number | null;
  prob_baseline: number | null;
  minutes_between: number | null;
};

// Types pour Prospect
export type ProspectShortlistByAirport = {
  operator_primary: string | null;
  icao: string | null;
  dep_pairs_30d: number | null;
  short_turn_rate: number | null;
  p95_turn_mins: number | null;
  last_seen: string | null;
};

export type ProspectShortlistByCorridor = {
  operator_primary: string | null;
  dep_icao: string | null;
  arr_icao: string | null;
  flights_30d: number | null;
  short_turn_rate: number | null;
  fill_score: number | null;
  last_seen: string | null;
};

export type OperatorContact = {
  id?: number;
  operator_name: string;
  website?: string | null;
  email_sales?: string | null;
  phone_sales?: string | null;
  notes?: string | null;
  source?: string | null;
  last_verified_at?: string | null;
  created_at?: string;
};

// Types pour Daily Briefing
export type DailyBriefing = {
  id: number;
  airport_icao: string;
  briefing_date: string;
  hot_hours: {
    hour: number;
    score: number;
    sample_n: number;
  }[];
  probable_routes: {
    dep: string;
    arr: string;
    prob: number;
    dow?: string;
  }[];
  priority_operators: {
    name: string;
    reason: string;
    contact?: {
      email?: string;
      phone?: string;
      website?: string;
    };
  }[];
  computed_at: string;
};
