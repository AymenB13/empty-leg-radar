import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { BrokerFeedOpportunities } from "@/types/database";
import { useEffect } from "react";

export function useBrokerFeedOpportunities() {
  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ["brokerFeedOpportunities"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("broker_feed_opportunities" as any)
        .select("*")
        .gte("etd_utc", new Date().toISOString())
        .lte("etd_utc", new Date(Date.now() + 72 * 60 * 60 * 1000).toISOString())
        .order("etd_utc", { ascending: true });

      if (error) throw error;
      return (data || []) as unknown as BrokerFeedOpportunities[];
    },
    staleTime: 1000 * 60 * 5,
  });

  // Auto-refresh polling
  useEffect(() => {
    const interval = setInterval(() => {
      refetch();
    }, 60000);
    return () => clearInterval(interval);
  }, [refetch]);

  return { data, isLoading, error, refetch };
}
