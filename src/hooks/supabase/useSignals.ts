import { useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { EmptylegSignal } from "@/types/database";
import { SignalsFilter } from "@/types/filters";
import { toast } from "sonner";

export function useSignals(filters?: SignalsFilter) {
  const { data: signals, isLoading, error, refetch } = useQuery({
    queryKey: ["signals", filters],
    queryFn: async () => {
      let query = supabase
        .from("emptyleg_signals")
        .select("*")
        .order("created_at", { ascending: false })
        .limit(100);

      // Apply filters
      if (filters?.status?.length) {
        query = query.in("status", filters.status);
      }

      if (filters?.airports?.length) {
        query = query.in("airport_icao", filters.airports);
      }

      const { data, error } = await query;

      if (error) throw error;

      // Client-side probability threshold filter
      let filtered = data as EmptylegSignal[];
      if (filters?.probThreshold !== undefined) {
        filtered = filtered.filter(
          (signal) => (signal.prob_final || 0) >= filters.probThreshold!
        );
      }

      return filtered;
    },
  });

  // Realtime subscription
  useEffect(() => {
    const channel = supabase
      .channel("signals-changes")
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "emptyleg_signals",
        },
        (payload) => {
          console.log("Signal update:", payload);
          refetch();
          if (payload.eventType === "INSERT") {
            toast.info("New signal detected");
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [refetch]);

  return { signals, isLoading, error, refetch };
}
