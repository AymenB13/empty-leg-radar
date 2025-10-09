import { useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { SignalPublishEnriched } from "@/types/database";
import { SignalsFilter } from "@/types/filters";
import { toast } from "sonner";

export function useSignals(filters?: SignalsFilter) {
  const { data: signals, isLoading, error, refetch } = useQuery({
    queryKey: ["signals", filters],
    queryFn: async () => {
      let query = supabase
        .from("signals_publish_enriched")
        .select("*")
        .order("prob_emptyleg", { ascending: false, nullsFirst: false })
        .order("etd_next", { ascending: true })
        .limit(100);

      // Apply filters - from_icao OR to_icao
      if (filters?.airports?.length) {
        const orConditions = filters.airports.map(apt => 
          `from_icao.eq.${apt},to_icao.eq.${apt}`
        ).join(',');
        query = query.or(orConditions);
      }

      const { data, error } = await query;

      if (error) throw error;

      // Client-side probability threshold filter
      let filtered = data as SignalPublishEnriched[];
      if (filters?.probThreshold !== undefined) {
        filtered = filtered.filter(
          (signal) => (signal.prob_headsup || 0) >= filters.probThreshold!
        );
      }

      return filtered;
    },
    staleTime: 1000 * 60 * 2, // 2 minutes
  });

  // Auto-refresh polling (view doesn't support realtime)
  useEffect(() => {
    const interval = setInterval(() => {
      refetch();
    }, 60000); // Refresh every 60 seconds

    return () => clearInterval(interval);
  }, [refetch]);

  return { signals, isLoading, error, refetch };
}
