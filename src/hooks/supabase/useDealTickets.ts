import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { DealTicket, DealTicketShortlist } from "@/types/database";
import { toast } from "sonner";

export function useDealTickets() {
  return useQuery({
    queryKey: ["dealTickets"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("deal_tickets")
        .select("*")
        .order("created_at", { ascending: false });
      
      if (error) throw error;
      return data as DealTicket[];
    },
  });
}

export function useCreateDealTicket() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (ticket: {
      dep_icao: string;
      arr_icao?: string;
      req_date?: string;
      req_time_utc?: string;
      aircraft_category?: string;
      shortlist: DealTicketShortlist;
    }) => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated");

      const { data, error } = await supabase
        .from("deal_tickets")
        .insert({
          user_id: user.id,
          ...ticket,
        })
        .select()
        .single();

      if (error) throw error;
      return data as DealTicket;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["dealTickets"] });
      toast.success("Deal ticket saved successfully!");
    },
    onError: (error: Error) => {
      toast.error(`Failed to save deal ticket: ${error.message}`);
    },
  });
}

export function useUpdateDealTicketStatus() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, status, notes }: { id: string; status: DealTicket['status']; notes?: string }) => {
      const { data, error } = await supabase
        .from("deal_tickets")
        .update({ status, notes })
        .eq("id", id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["dealTickets"] });
      toast.success("Status updated successfully!");
    },
    onError: (error: Error) => {
      toast.error(`Failed to update status: ${error.message}`);
    },
  });
}
