import { AppLayout } from "@/components/layouts/AppLayout";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useSignals } from "@/hooks/supabase/useSignals";
import { useUserSettings } from "@/hooks/supabase/useUserSettings";
import { Skeleton } from "@/components/ui/skeleton";

export default function Signals() {
  const { settings } = useUserSettings();
  const { signals, isLoading } = useSignals({
    airports: settings?.airports || undefined,
    probThreshold: settings?.prob_threshold || undefined,
    status: ["pending", "sent"],
  });

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
                  <th className="px-6 py-4 text-left text-sm font-medium">Route</th>
                  <th className="px-6 py-4 text-left text-sm font-medium">Aircraft</th>
                  <th className="px-6 py-4 text-left text-sm font-medium">Airport</th>
                  <th className="px-6 py-4 text-left text-sm font-medium">Arrival</th>
                  <th className="px-6 py-4 text-left text-sm font-medium">Next Depart</th>
                  <th className="px-6 py-4 text-left text-sm font-medium">Turnaround</th>
                  <th className="px-6 py-4 text-left text-sm font-medium">Probability</th>
                  <th className="px-6 py-4 text-left text-sm font-medium">Reason</th>
                  <th className="px-6 py-4 text-left text-sm font-medium">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {isLoading ? (
                  Array.from({ length: 5 }).map((_, i) => (
                    <tr key={i}>
                      <td className="px-6 py-4"><Skeleton className="h-4 w-24" /></td>
                      <td className="px-6 py-4"><Skeleton className="h-4 w-20" /></td>
                      <td className="px-6 py-4"><Skeleton className="h-4 w-16" /></td>
                      <td className="px-6 py-4"><Skeleton className="h-4 w-32" /></td>
                      <td className="px-6 py-4"><Skeleton className="h-4 w-32" /></td>
                      <td className="px-6 py-4"><Skeleton className="h-4 w-16" /></td>
                      <td className="px-6 py-4"><Skeleton className="h-4 w-12" /></td>
                      <td className="px-6 py-4"><Skeleton className="h-4 w-24" /></td>
                      <td className="px-6 py-4"><Skeleton className="h-4 w-16" /></td>
                    </tr>
                  ))
                ) : signals?.length === 0 ? (
                  <tr>
                    <td colSpan={9} className="px-6 py-12 text-center text-sm text-muted-foreground">
                      No signals match your current filters
                    </td>
                  </tr>
                ) : (
                  signals?.map((signal) => (
                    <tr key={signal.id} className="hover:bg-muted/20">
                      <td className="px-6 py-4">
                        <div className="font-medium">
                          {signal.from_icao} → {signal.to_icao}
                        </div>
                      </td>
                      <td className="px-6 py-4 text-sm text-muted-foreground">
                        {signal.reg || "—"}
                      </td>
                      <td className="px-6 py-4 text-sm font-mono">
                        {signal.airport_icao || "—"}
                      </td>
                      <td className="px-6 py-4 text-sm">
                        {signal.eta_arrival
                          ? new Date(signal.eta_arrival).toLocaleString()
                          : "—"}
                      </td>
                      <td className="px-6 py-4 text-sm">
                        {signal.etd_next
                          ? new Date(signal.etd_next).toLocaleString()
                          : "—"}
                      </td>
                      <td className="px-6 py-4 text-sm font-mono">
                        {signal.minutes_between
                          ? `${Math.round(signal.minutes_between as number)}m`
                          : "—"}
                      </td>
                      <td className="px-6 py-4">
                        <div className="space-y-1">
                          <Badge variant="secondary" className="font-mono">
                            {((signal.prob_final || 0) * 100).toFixed(0)}%
                          </Badge>
                          {signal.is_ml_augmented && (
                            <div className="text-xs text-muted-foreground">ML</div>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4 text-sm text-muted-foreground">
                        {signal.reason || "—"}
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
                  ))
                )}
              </tbody>
            </table>
          </div>
        </Card>
      </div>
    </AppLayout>
  );
}
