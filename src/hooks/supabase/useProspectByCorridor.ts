import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { ProspectShortlistByCorridor } from "@/types/database";

export function useProspectByCorridor(
  depIcao?: string,
  arrIcao?: string,
  minFlights: number = 2
) {
  return useQuery({
    queryKey: ["prospectByCorridor", depIcao, arrIcao, minFlights],
    queryFn: async () => {
      if (!depIcao) return [];
      
      let query = supabase
        .from("prospect_shortlist_by_corridor" as any)
        .select("*")
        .eq("dep_icao", depIcao)
        .gte("flights_30d", minFlights)
        .order("fill_score", { ascending: false })
        .order("flights_30d", { ascending: false });

      if (arrIcao) {
        query = query.eq("arr_icao", arrIcao);
      }

      const { data, error } = await query;
      if (error) throw error;
      return data as unknown as ProspectShortlistByCorridor[];
    },
    enabled: !!depIcao,
    staleTime: 1000 * 60 * 10,
  });
}
