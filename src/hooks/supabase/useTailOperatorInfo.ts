import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { TailOperatorMap } from "@/types/database";

export function useTailOperatorInfo(nNumber: string | null | undefined) {
  return useQuery({
    queryKey: ["tailOperatorInfo", nNumber],
    queryFn: async () => {
      if (!nNumber) return null;

      const { data, error } = await supabase
        .from("tail_operator_map_mv")
        .select("*")
        .eq("n_number", nNumber)
        .maybeSingle();

      if (error) throw error;
      return data as TailOperatorMap | null;
    },
    enabled: !!nNumber,
    staleTime: 1000 * 60 * 10, // 10 minutes
  });
}
