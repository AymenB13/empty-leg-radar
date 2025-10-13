import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { OperatorContact } from "@/types/database";

export function useOperatorContacts() {
  return useQuery({
    queryKey: ["operatorContacts"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("operator_contacts")
        .select("*")
        .order("operator_name");
      
      if (error) throw error;
      return data as OperatorContact[];
    },
    staleTime: 1000 * 60 * 5,
  });
}

export function useUpsertOperatorContact() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (contact: OperatorContact) => {
      const { data, error } = await supabase
        .from("operator_contacts")
        .upsert(contact, { 
          onConflict: "operator_name",
          ignoreDuplicates: false 
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["operatorContacts"] });
      queryClient.invalidateQueries({ queryKey: ["prospectByAirport"] });
      queryClient.invalidateQueries({ queryKey: ["prospectByCorridor"] });
    },
  });
}
