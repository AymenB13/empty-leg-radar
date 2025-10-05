import { AppLayout } from "@/components/layouts/AppLayout";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useEffect } from "react";
import { toast } from "sonner";

export default function Signals() {
  const { data: signals, refetch } = useQuery({
    queryKey: ["signals"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("signals_board")
        .select("*")
        .order("created_at", { ascending: false })
        .limit(50);

      if (error) throw error;
      return data;
    },
  });

  // Subscribe to realtime updates
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
        () => {
          refetch();
          toast.info("New signal detected");
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [refetch]);

  return (
    <AppLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-medium">Signals Live</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Real-time empty leg opportunities
          </p>
        </div>

        <Card className="overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="border-b border-border bg-muted/30">
                <tr>
                  <th className="px-6 py-4 text-left text-sm font-medium">
                    Route
                  </th>
                  <th className="px-6 py-4 text-left text-sm font-medium">
                    Aircraft
                  </th>
                  <th className="px-6 py-4 text-left text-sm font-medium">
                    Departure
                  </th>
                  <th className="px-6 py-4 text-left text-sm font-medium">
                    Probability
                  </th>
                  <th className="px-6 py-4 text-left text-sm font-medium">
                    Status
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {signals?.map((signal) => (
                  <tr key={signal.id} className="hover:bg-muted/20">
                    <td className="px-6 py-4">
                      <div className="font-medium">
                        {signal.from_icao} → {signal.to_icao}
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm text-muted-foreground">
                      {signal.reg || "—"}
                    </td>
                    <td className="px-6 py-4 text-sm">
                      {signal.etd_next
                        ? new Date(signal.etd_next).toLocaleString()
                        : "—"}
                    </td>
                    <td className="px-6 py-4">
                      <Badge variant="secondary" className="font-mono">
                        {((signal.prob_emptyleg || 0) * 100).toFixed(0)}%
                      </Badge>
                    </td>
                    <td className="px-6 py-4">
                      <Badge
                        variant={
                          signal.status === "pending" ? "secondary" : "default"
                        }
                      >
                        {signal.status}
                      </Badge>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      </div>
    </AppLayout>
  );
}
