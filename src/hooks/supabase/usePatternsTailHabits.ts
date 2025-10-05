import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { PatternsTailHabits } from "@/types/database";
import { TailHabitsFilter } from "@/types/filters";

export function usePatternsTailHabits(filters?: TailHabitsFilter) {
  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ["patternsTailHabits", filters],
    queryFn: async () => {
      let query = supabase
        .from("patterns_tail_habits")
        .select("*")
        .order("turn_short_rate_30d", { ascending: false });

      if (filters?.nNumber) {
        query = query.eq("n_number", filters.nNumber);
      }

      if (filters?.isPart135 !== undefined) {
        query = query.eq("is_part135", filters.isPart135);
      }

      if (filters?.limit) {
        query = query.limit(filters.limit);
      }

      const { data, error } = await query;

      if (error) throw error;
      return data as PatternsTailHabits[];
    },
    staleTime: 1000 * 60 * 60, // 1 hour
  });

  return { data, isLoading, error, refetch };
}
