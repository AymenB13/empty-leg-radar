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
      
      // Add demo data
      const demoData: BrokerFeedOpportunities[] = [
        {
          broker_feed_id: 999001,
          signal_id: 888001,
          n_number: "N488TK",
          aircraft_model: "Hawker 800XP",
          operator_primary: "Great Western Air LLC",
          dep_icao: "KVNY",
          arr_icao: "KLAS",
          etd_utc: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
          prob_baseline: 0.45,
          prob_ml: 0.78,
          prob_final: 0.65,
          minutes_between: 42,
          reason: "return_to_base | base_mid(199nm)",
          status: "pending",
          call_sign: "GWA488",
          flight_number: null,
          operator_count: 1,
        },
        {
          broker_feed_id: 999002,
          signal_id: 888002,
          n_number: "N550GV",
          aircraft_model: "Gulfstream G550",
          operator_primary: "Executive Jet Management",
          dep_icao: "KTEB",
          arr_icao: "KMIA",
          etd_utc: new Date(Date.now() + 6 * 60 * 60 * 1000).toISOString(),
          prob_baseline: 0.38,
          prob_ml: 0.61,
          prob_final: 0.52,
          minutes_between: 38,
          reason: "base_nearby | short_turn(38min)",
          status: "pending",
          call_sign: "EJM550",
          flight_number: null,
          operator_count: 1,
        },
        {
          broker_feed_id: 999003,
          signal_id: 888003,
          n_number: "N680XL",
          aircraft_model: "Bombardier Challenger 650",
          operator_primary: "Jet Aviation",
          dep_icao: "LFPB",
          arr_icao: "EGLF",
          etd_utc: new Date(Date.now() + 20 * 60 * 60 * 1000).toISOString(),
          prob_baseline: 0.35,
          prob_ml: 0.58,
          prob_final: 0.48,
          minutes_between: 55,
          reason: "corridor_rtb_pattern | ml_fused",
          status: "pending",
          call_sign: "JET680",
          flight_number: null,
          operator_count: 1,
        },
      ];
      
      const allData = [...demoData, ...(data || [])];
      return allData as unknown as BrokerFeedOpportunities[];
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
