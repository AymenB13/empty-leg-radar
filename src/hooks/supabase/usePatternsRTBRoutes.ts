import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { PatternsRTBRoutes } from "@/types/database";
import { RTBRoutesFilter } from "@/types/filters";

export function usePatternsRTBRoutes(filters?: RTBRoutesFilter) {
  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ["patternsRTBRoutes", filters],
    queryFn: async () => {
      let query = supabase
        .from("patterns_rtb_routes")
        .select("*")
        .order("rtb_rate_30d", { ascending: false });

      if (filters?.depIcao) {
        query = query.eq("dep_icao", filters.depIcao);
      }

      if (filters?.arrIcao) {
        query = query.eq("arr_icao", filters.arrIcao);
      }

      if (filters?.limit) {
        query = query.limit(filters.limit);
      }

      const { data, error } = await query;

      if (error) throw error;
      return data as PatternsRTBRoutes[];
    },
    staleTime: 1000 * 60 * 60, // 1 hour
  });

  return { data, isLoading, error, refetch };
}
