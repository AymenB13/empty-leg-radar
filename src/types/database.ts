import { Database } from "@/integrations/supabase/types";

export type UserSettings = Database["public"]["Tables"]["user_settings"]["Row"];
export type UserSettingsInsert = Database["public"]["Tables"]["user_settings"]["Insert"];
export type UserSettingsUpdate = Database["public"]["Tables"]["user_settings"]["Update"];

export type Watchlist = Database["public"]["Tables"]["watchlists"]["Row"];
export type WatchlistInsert = Database["public"]["Tables"]["watchlists"]["Insert"];
export type WatchlistUpdate = Database["public"]["Tables"]["watchlists"]["Update"];

export type EmptylegSignal = Database["public"]["Tables"]["emptyleg_signals"]["Row"];
export type PatternsHotHours = Database["public"]["Views"]["patterns_hot_hours_by_airport"]["Row"];
export type PatternsTailHabits = Database["public"]["Views"]["patterns_tail_habits"]["Row"];
export type PatternsRTBRoutes = Database["public"]["Views"]["patterns_rtb_routes"]["Row"];
