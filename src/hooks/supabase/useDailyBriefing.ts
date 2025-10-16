import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { DailyBriefing } from "@/types/database";

export function useDailyBriefing(airports: string[]) {
  return useQuery({
    queryKey: ["dailyBriefing", airports],
    queryFn: async () => {
      const today = new Date().toISOString().split('T')[0];
      
      const { data, error } = await supabase
        .from("daily_briefing")
        .select("*")
        .eq("briefing_date", today)
        .in("airport_icao", airports)
        .order("airport_icao");
      
      if (error) throw error;
      return data as DailyBriefing[];
    },
    enabled: airports.length > 0,
    staleTime: 1000 * 60 * 60, // 1h
  });
}
