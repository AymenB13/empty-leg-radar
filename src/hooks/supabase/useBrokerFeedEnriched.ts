import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { BrokerFeedEnriched } from "@/types/database";
import { useEffect } from "react";

export function useBrokerFeedEnriched() {
  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ["brokerFeedEnriched"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("broker_feed_enriched" as any)
        .select("*")
        .gte("etd_utc", new Date().toISOString())
        .lte("etd_utc", new Date(Date.now() + 72 * 60 * 60 * 1000).toISOString())
        .order("etd_utc", { ascending: true });

      if (error) throw error;
      return data as unknown as BrokerFeedEnriched[];
    },
    staleTime: 1000 * 60 * 5,
  });

  // Auto-refresh polling
  useEffect(() => {
    const interval = setInterval(() => {
      refetch();
    }, 60000); // Refresh every 60 seconds

    return () => clearInterval(interval);
  }, [refetch]);

  return { data, isLoading, error, refetch };
}
