import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { BrokerFeed } from "@/types/database";

export function useBrokerFeed() {
  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ["brokerFeed"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("broker_feed")
        .select("*")
        .order("etd_utc", { ascending: true });

      if (error) throw error;
      return data as BrokerFeed[];
    },
    staleTime: 1000 * 60 * 5,
  });

  return { data, isLoading, error, refetch };
}
