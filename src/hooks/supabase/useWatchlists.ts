import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Watchlist, WatchlistInsert, WatchlistUpdate } from "@/types/database";
import { toast } from "sonner";

export function useWatchlists() {
  const queryClient = useQueryClient();

  const { data: watchlists, isLoading, error } = useQuery({
    queryKey: ["watchlists"],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated");

      const { data, error } = await supabase
        .from("watchlists")
        .select("*")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false });

      if (error) throw error;
      return data as Watchlist[];
    },
  });

  const createWatchlist = useMutation({
    mutationFn: async (newWatchlist: Omit<WatchlistInsert, "user_id">) => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated");

      const { data, error } = await supabase
        .from("watchlists")
        .insert({
          user_id: user.id,
          ...newWatchlist,
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["watchlists"] });
      toast.success("Watchlist created");
    },
    onError: (error: Error) => {
      toast.error(`Failed to create watchlist: ${error.message}`);
    },
  });

  const updateWatchlist = useMutation({
    mutationFn: async ({ id, updates }: { id: string; updates: WatchlistUpdate }) => {
      const { data, error } = await supabase
        .from("watchlists")
        .update(updates)
        .eq("id", id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["watchlists"] });
      toast.success("Watchlist updated");
    },
    onError: (error: Error) => {
      toast.error(`Failed to update watchlist: ${error.message}`);
    },
  });

  const deleteWatchlist = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from("watchlists")
        .delete()
        .eq("id", id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["watchlists"] });
      toast.success("Watchlist deleted");
    },
    onError: (error: Error) => {
      toast.error(`Failed to delete watchlist: ${error.message}`);
    },
  });

  return {
    watchlists,
    isLoading,
    error,
    createWatchlist: createWatchlist.mutate,
    updateWatchlist: updateWatchlist.mutate,
    deleteWatchlist: deleteWatchlist.mutate,
  };
}
