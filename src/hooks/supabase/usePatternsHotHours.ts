import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { PatternsHotHours } from "@/types/database";
import { HotHoursFilter } from "@/types/filters";

export function usePatternsHotHours(filters?: HotHoursFilter) {
  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ["patternsHotHours", filters],
    queryFn: async () => {
      let query = supabase
        .from("patterns_hot_hours_by_airport")
        .select("*")
        .order("as_of_date", { ascending: false });

      if (filters?.icao) {
        query = query.eq("icao", filters.icao);
      }

      if (filters?.limit) {
        query = query.limit(filters.limit);
      }

      const { data, error } = await query;

      if (error) throw error;
      return data as PatternsHotHours[];
    },
    staleTime: 1000 * 60 * 60, // 1 hour - patterns update daily
  });

  return { data, isLoading, error, refetch };
}
