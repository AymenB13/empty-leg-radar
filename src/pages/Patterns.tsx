import { AppLayout } from "@/components/layouts/AppLayout";
import { Card } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { usePatternsHotHours } from "@/hooks/supabase/usePatternsHotHours";
import { usePatternsTailHabits } from "@/hooks/supabase/usePatternsTailHabits";
import { usePatternsRTBRoutes } from "@/hooks/supabase/usePatternsRTBRoutes";

export default function Patterns() {
  const { data: hotHours, isLoading: loadingHotHours } = usePatternsHotHours({ limit: 50 });
  const { data: tailHabits, isLoading: loadingTailHabits } = usePatternsTailHabits({ limit: 50 });
  const { data: rtbRoutes, isLoading: loadingRTBRoutes } = usePatternsRTBRoutes({ limit: 50 });

  return (
    <AppLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-medium">Pattern Intelligence</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Daily refreshed insights and trends
          </p>
        </div>

        <Tabs defaultValue="hot-hours" className="space-y-6">
          <TabsList>
            <TabsTrigger value="hot-hours">Hot Hours</TabsTrigger>
            <TabsTrigger value="tail-habits">Tail Habits</TabsTrigger>
            <TabsTrigger value="rtb-routes">RTB Routes</TabsTrigger>
          </TabsList>

          <TabsContent value="hot-hours" className="space-y-4">
            <Card className="overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="border-b border-border bg-muted/30">
                    <tr>
                      <th className="px-6 py-4 text-left text-sm font-medium">Airport</th>
                      <th className="px-6 py-4 text-left text-sm font-medium">Bizjet Share</th>
                      <th className="px-6 py-4 text-left text-sm font-medium">Short Turn Rate</th>
                      <th className="px-6 py-4 text-left text-sm font-medium">Top Hours UTC</th>
                      <th className="px-6 py-4 text-left text-sm font-medium">As Of</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border">
                    {loadingHotHours ? (
                      Array.from({ length: 5 }).map((_, i) => (
                        <tr key={i}>
                          <td className="px-6 py-4"><Skeleton className="h-4 w-16" /></td>
                          <td className="px-6 py-4"><Skeleton className="h-4 w-12" /></td>
                          <td className="px-6 py-4"><Skeleton className="h-4 w-12" /></td>
                          <td className="px-6 py-4"><Skeleton className="h-4 w-32" /></td>
                          <td className="px-6 py-4"><Skeleton className="h-4 w-20" /></td>
                        </tr>
                      ))
                    ) : hotHours?.length === 0 ? (
                      <tr>
                        <td colSpan={5} className="px-6 py-12 text-center text-sm text-muted-foreground">
                          No data available
                        </td>
                      </tr>
                    ) : (
                      hotHours?.map((airport, idx) => (
                        <tr key={idx} className="hover:bg-muted/20">
                          <td className="px-6 py-4 font-medium font-mono">{airport.icao}</td>
                          <td className="px-6 py-4">
                            <Badge variant="secondary" className="font-mono">
                              {((airport.bizjet_share_30d || 0) * 100).toFixed(0)}%
                            </Badge>
                          </td>
                          <td className="px-6 py-4">
                            <Badge variant="secondary" className="font-mono">
                              {((airport.short_turn_rate_30d || 0) * 100).toFixed(0)}%
                            </Badge>
                          </td>
                          <td className="px-6 py-4 text-sm text-muted-foreground font-mono">
                            {airport.top_hours_utc?.join(", ") || "—"}
                          </td>
                          <td className="px-6 py-4 text-sm text-muted-foreground">
                            {airport.as_of_date || "—"}
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </Card>
          </TabsContent>

          <TabsContent value="tail-habits" className="space-y-4">
            <Card className="overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="border-b border-border bg-muted/30">
                    <tr>
                      <th className="px-6 py-4 text-left text-sm font-medium">N-Number</th>
                      <th className="px-6 py-4 text-left text-sm font-medium">Part 135</th>
                      <th className="px-6 py-4 text-left text-sm font-medium">RTB Rate</th>
                      <th className="px-6 py-4 text-left text-sm font-medium">Short Turn Rate</th>
                      <th className="px-6 py-4 text-left text-sm font-medium">Avg Dist to Base</th>
                      <th className="px-6 py-4 text-left text-sm font-medium">P95 Turn</th>
                      <th className="px-6 py-4 text-left text-sm font-medium">Last Seen</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border">
                    {loadingTailHabits ? (
                      Array.from({ length: 5 }).map((_, i) => (
                        <tr key={i}>
                          <td className="px-6 py-4"><Skeleton className="h-4 w-20" /></td>
                          <td className="px-6 py-4"><Skeleton className="h-4 w-12" /></td>
                          <td className="px-6 py-4"><Skeleton className="h-4 w-12" /></td>
                          <td className="px-6 py-4"><Skeleton className="h-4 w-12" /></td>
                          <td className="px-6 py-4"><Skeleton className="h-4 w-16" /></td>
                          <td className="px-6 py-4"><Skeleton className="h-4 w-16" /></td>
                          <td className="px-6 py-4"><Skeleton className="h-4 w-20" /></td>
                        </tr>
                      ))
                    ) : tailHabits?.length === 0 ? (
                      <tr>
                        <td colSpan={7} className="px-6 py-12 text-center text-sm text-muted-foreground">
                          No data available
                        </td>
                      </tr>
                    ) : (
                      tailHabits?.map((tail, idx) => (
                        <tr key={idx} className="hover:bg-muted/20">
                          <td className="px-6 py-4 font-medium font-mono">{tail.n_number}</td>
                          <td className="px-6 py-4">
                            {tail.is_part135 ? (
                              <Badge variant="default">Yes</Badge>
                            ) : (
                              <Badge variant="outline">No</Badge>
                            )}
                          </td>
                          <td className="px-6 py-4">
                            <Badge variant="secondary" className="font-mono">
                              {((tail.rtb_rate_30d || 0) * 100).toFixed(0)}%
                            </Badge>
                          </td>
                          <td className="px-6 py-4">
                            <Badge variant="secondary" className="font-mono">
                              {((tail.turn_short_rate_30d || 0) * 100).toFixed(0)}%
                            </Badge>
                          </td>
                          <td className="px-6 py-4 text-sm font-mono">
                            {tail.avg_dist_to_base_30d ? `${Math.round(tail.avg_dist_to_base_30d as number)}nm` : "—"}
                          </td>
                          <td className="px-6 py-4 text-sm font-mono">
                            {tail.p95_turn_mins ? `${Math.round(tail.p95_turn_mins as number)}m` : "—"}
                          </td>
                          <td className="px-6 py-4 text-sm text-muted-foreground">
                            {tail.last_seen_at ? new Date(tail.last_seen_at).toLocaleDateString() : "—"}
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </Card>
          </TabsContent>

          <TabsContent value="rtb-routes" className="space-y-4">
            <Card className="overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="border-b border-border bg-muted/30">
                    <tr>
                      <th className="px-6 py-4 text-left text-sm font-medium">Route</th>
                      <th className="px-6 py-4 text-left text-sm font-medium">RTB Rate</th>
                      <th className="px-6 py-4 text-left text-sm font-medium">Short Turn Rate</th>
                      <th className="px-6 py-4 text-left text-sm font-medium">Sample Size</th>
                      <th className="px-6 py-4 text-left text-sm font-medium">Block Time</th>
                      <th className="px-6 py-4 text-left text-sm font-medium">As Of</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border">
                    {loadingRTBRoutes ? (
                      Array.from({ length: 5 }).map((_, i) => (
                        <tr key={i}>
                          <td className="px-6 py-4"><Skeleton className="h-4 w-24" /></td>
                          <td className="px-6 py-4"><Skeleton className="h-4 w-12" /></td>
                          <td className="px-6 py-4"><Skeleton className="h-4 w-12" /></td>
                          <td className="px-6 py-4"><Skeleton className="h-4 w-12" /></td>
                          <td className="px-6 py-4"><Skeleton className="h-4 w-16" /></td>
                          <td className="px-6 py-4"><Skeleton className="h-4 w-20" /></td>
                        </tr>
                      ))
                    ) : rtbRoutes?.length === 0 ? (
                      <tr>
                        <td colSpan={6} className="px-6 py-12 text-center text-sm text-muted-foreground">
                          No data available
                        </td>
                      </tr>
                    ) : (
                      rtbRoutes?.map((route, idx) => (
                        <tr key={idx} className="hover:bg-muted/20">
                          <td className="px-6 py-4 font-medium">
                            {route.dep_icao} → {route.arr_icao}
                          </td>
                          <td className="px-6 py-4">
                            <Badge variant="secondary" className="font-mono">
                              {((route.rtb_rate_30d || 0) * 100).toFixed(0)}%
                            </Badge>
                          </td>
                          <td className="px-6 py-4">
                            <Badge variant="secondary" className="font-mono">
                              {((route.short_turn_rate_30d || 0) * 100).toFixed(0)}%
                            </Badge>
                          </td>
                          <td className="px-6 py-4 text-sm font-mono">
                            {route.sample_n_30d || 0}
                          </td>
                          <td className="px-6 py-4 text-sm font-mono">
                            {route.median_block_time_mins ? `${Math.round(route.median_block_time_mins as number)}m` : "—"}
                          </td>
                          <td className="px-6 py-4 text-sm text-muted-foreground">
                            {route.as_of_date || "—"}
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </AppLayout>
  );
}
