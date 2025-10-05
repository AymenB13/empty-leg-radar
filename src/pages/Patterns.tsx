import { AppLayout } from "@/components/layouts/AppLayout";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card } from "@/components/ui/card";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Badge } from "@/components/ui/badge";

export default function Patterns() {
  const { data: hotHours } = useQuery({
    queryKey: ["hot-hours"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("patterns_hot_hours_by_airport")
        .select("*")
        .limit(20);
      if (error) throw error;
      return data;
    },
  });

  const { data: tailHabits } = useQuery({
    queryKey: ["tail-habits"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("patterns_tail_habits")
        .select("*")
        .limit(20);
      if (error) throw error;
      return data;
    },
  });

  const { data: rtbRoutes } = useQuery({
    queryKey: ["rtb-routes"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("patterns_rtb_routes")
        .select("*")
        .limit(20);
      if (error) throw error;
      return data;
    },
  });

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
                      <th className="px-6 py-4 text-left text-sm font-medium">
                        Airport
                      </th>
                      <th className="px-6 py-4 text-left text-sm font-medium">
                        Bizjet Share
                      </th>
                      <th className="px-6 py-4 text-left text-sm font-medium">
                        Short Turn Rate
                      </th>
                      <th className="px-6 py-4 text-left text-sm font-medium">
                        As of
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border">
                    {hotHours?.map((row, i) => (
                      <tr key={i} className="hover:bg-muted/20">
                        <td className="px-6 py-4 font-medium">{row.icao}</td>
                        <td className="px-6 py-4">
                          <Badge variant="secondary" className="font-mono">
                            {((row.bizjet_share_30d || 0) * 100).toFixed(1)}%
                          </Badge>
                        </td>
                        <td className="px-6 py-4 text-sm">
                          {((row.short_turn_rate_30d || 0) * 100).toFixed(1)}%
                        </td>
                        <td className="px-6 py-4 text-sm text-muted-foreground">
                          {row.as_of_date || "—"}
                        </td>
                      </tr>
                    ))}
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
                      <th className="px-6 py-4 text-left text-sm font-medium">
                        N-Number
                      </th>
                      <th className="px-6 py-4 text-left text-sm font-medium">
                        RTB Rate
                      </th>
                      <th className="px-6 py-4 text-left text-sm font-medium">
                        Avg Distance to Base
                      </th>
                      <th className="px-6 py-4 text-left text-sm font-medium">
                        Part 135
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border">
                    {tailHabits?.map((row, i) => (
                      <tr key={i} className="hover:bg-muted/20">
                        <td className="px-6 py-4 font-medium font-mono">
                          {row.n_number}
                        </td>
                        <td className="px-6 py-4">
                          <Badge variant="secondary" className="font-mono">
                            {((row.rtb_rate_30d || 0) * 100).toFixed(1)}%
                          </Badge>
                        </td>
                        <td className="px-6 py-4 text-sm">
                          {row.avg_dist_to_base_30d?.toFixed(0) || "—"} nm
                        </td>
                        <td className="px-6 py-4 text-sm">
                          {row.is_part135 ? "Yes" : "No"}
                        </td>
                      </tr>
                    ))}
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
                      <th className="px-6 py-4 text-left text-sm font-medium">
                        Route
                      </th>
                      <th className="px-6 py-4 text-left text-sm font-medium">
                        RTB Rate
                      </th>
                      <th className="px-6 py-4 text-left text-sm font-medium">
                        Sample Size
                      </th>
                      <th className="px-6 py-4 text-left text-sm font-medium">
                        Block Time
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border">
                    {rtbRoutes?.map((row, i) => (
                      <tr key={i} className="hover:bg-muted/20">
                        <td className="px-6 py-4 font-medium">
                          {row.dep_icao} → {row.arr_icao}
                        </td>
                        <td className="px-6 py-4">
                          <Badge variant="secondary" className="font-mono">
                            {((row.rtb_rate_30d || 0) * 100).toFixed(1)}%
                          </Badge>
                        </td>
                        <td className="px-6 py-4 text-sm">
                          {row.sample_n_30d || 0}
                        </td>
                        <td className="px-6 py-4 text-sm text-muted-foreground">
                          {row.median_block_time_mins || "—"} min
                        </td>
                      </tr>
                    ))}
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
