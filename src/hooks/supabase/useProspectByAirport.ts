import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { ProspectShortlistByAirport } from "@/types/database";

export function useProspectByAirport(icao?: string, minDeps: number = 3) {
  return useQuery({
    queryKey: ["prospectByAirport", icao, minDeps],
    queryFn: async () => {
      if (!icao) return [];
      
      let query = supabase
        .from("prospect_shortlist_by_airport" as any)
        .select("*")
        .eq("icao", icao)
        .gte("dep_pairs_30d", minDeps)
        .order("short_turn_rate", { ascending: false })
        .order("dep_pairs_30d", { ascending: false });

      const { data, error } = await query;
      if (error) throw error;
      return data as unknown as ProspectShortlistByAirport[];
    },
    enabled: !!icao,
    staleTime: 1000 * 60 * 10, // 10 min
  });
}
