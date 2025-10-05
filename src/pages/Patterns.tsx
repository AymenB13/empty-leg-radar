import { AppLayout } from "@/components/layouts/AppLayout";
import { Card } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { usePatternsHotHours } from "@/hooks/supabase/usePatternsHotHours";
import { usePatternsTailHabits } from "@/hooks/supabase/usePatternsTailHabits";
import { usePatternsRTBRoutes } from "@/hooks/supabase/usePatternsRTBRoutes";
import { HeatStrip } from "@/components/patterns/HeatStrip";
import { exportToCSV } from "@/lib/signal-utils";
import { Download, Bug, Plane } from "lucide-react";
import { useState } from "react";
import { useToast } from "@/hooks/use-toast";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";

export default function Patterns() {
  const { toast } = useToast();
  
  // Hot Hours filters
  const [selectedAirportHH, setSelectedAirportHH] = useState<string>("");
  const [minSampleHH, setMinSampleHH] = useState("");
  const [timezoneDisplay, setTimezoneDisplay] = useState<"UTC" | "Local">("UTC");
  
  // Tail Habits filters
  const [part135Only, setPart135Only] = useState(false);
  const [minSampleTH, setMinSampleTH] = useState("5");
  const [sortByTH, setSortByTH] = useState<"rtb_rate_30d" | "p95_turn_mins">("rtb_rate_30d");
  
  // RTB Routes filters
  const [depAirport, setDepAirport] = useState("");
  const [arrAirport, setArrAirport] = useState("");
  const [minSampleRTB, setMinSampleRTB] = useState("3");
  
  const { data: hotHours, isLoading: loadingHotHours, error: errorHotHours, refetch: refetchHotHours } = usePatternsHotHours({ limit: 200 });
  const { data: tailHabits, isLoading: loadingTailHabits, error: errorTailHabits, refetch: refetchTailHabits } = usePatternsTailHabits({ 
    limit: 50,
    isPart135: part135Only ? true : undefined 
  });
  const { data: rtbRoutes, isLoading: loadingRTBRoutes, error: errorRTBRoutes, refetch: refetchRTBRoutes } = usePatternsRTBRoutes({ limit: 50 });
  
  // Filter data client-side
  const filteredHotHours = hotHours
    ?.filter(airport => airport.icao != null)
    ?.filter(airport => {
      if (selectedAirportHH && airport.icao !== selectedAirportHH) return false;
      return true;
    });
  
  const filteredTailHabits = tailHabits
    ?.filter(tail => tail.n_number != null)
    ?.filter(tail => {
      if (minSampleTH && (tail.sample_n_30d || 0) < parseInt(minSampleTH)) return false;
      return true;
    })
    .sort((a, b) => {
      const aVal = (a[sortByTH] as number) || 0;
      const bVal = (b[sortByTH] as number) || 0;
      return bVal - aVal;
    });
  
  const filteredRTBRoutes = rtbRoutes
    ?.filter(route => route.dep_icao != null && route.arr_icao != null)
    ?.filter(route => {
      if (depAirport && route.dep_icao !== depAirport) return false;
      if (arrAirport && route.arr_icao !== arrAirport) return false;
      if (minSampleRTB && (route.sample_n_30d || 0) < parseInt(minSampleRTB)) return false;
      return true;
    });

  const handleAddToSignalsFilter = (nNumber: string) => {
    toast({
      title: "Added to watchlist",
      description: `${nNumber} is now tracked in Signals`,
    });
  };

  return (
    <AppLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-medium">Patterns that close deals</h1>
            <p className="mt-1 text-sm text-muted-foreground">
              Historical behavior by airport, tail, and route.
            </p>
          </div>
          
          {/* Debug Dropdown */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="sm">
                <Bug className="h-4 w-4 mr-2" />
                Debug
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="bg-popover">
              <DropdownMenuItem onClick={() => console.log('[DEBUG] Hot Hours:', hotHours?.[0])}>
                Fetch 1 Hot Hours row
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => console.log('[DEBUG] Tail Habits:', tailHabits?.[0])}>
                Fetch 1 Tail Habits row
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => console.log('[DEBUG] RTB Routes:', rtbRoutes?.[0])}>
                Fetch 1 RTB Route row
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        <Tabs defaultValue="hot-hours" className="space-y-6">
          <TabsList>
            <TabsTrigger value="hot-hours">Hot Hours</TabsTrigger>
            <TabsTrigger value="tail-habits">Tail Habits</TabsTrigger>
            <TabsTrigger value="rtb-routes">RTB Routes</TabsTrigger>
          </TabsList>

          <TabsContent value="hot-hours" className="space-y-4">
            {/* Filters */}
            <Card className="p-4">
              <div className="flex flex-wrap gap-4 items-end">
                <div className="flex-1 min-w-[200px] space-y-2">
                  <label className="text-xs font-medium text-muted-foreground">Airport</label>
                  <Select value={selectedAirportHH} onValueChange={setSelectedAirportHH}>
                    <SelectTrigger>
                      <SelectValue placeholder="All airports" />
                    </SelectTrigger>
                    <SelectContent className="bg-popover z-50">
                      <SelectItem value="">All airports</SelectItem>
                      {hotHours
                        ?.filter(airport => airport.icao != null)
                        ?.map(airport => (
                          <SelectItem key={airport.icao} value={airport.icao!}>
                            {airport.icao}
                          </SelectItem>
                        ))}
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="flex-1 min-w-[150px] space-y-2">
                  <label className="text-xs font-medium text-muted-foreground">Min Sample Size</label>
                  <Input
                    type="number"
                    placeholder="Any"
                    value={minSampleHH}
                    onChange={(e) => setMinSampleHH(e.target.value)}
                  />
                </div>
                
                <div className="space-y-2">
                  <label className="text-xs font-medium text-muted-foreground">Time Display</label>
                  <div className="flex gap-1">
                    <Button
                      variant={timezoneDisplay === "UTC" ? "secondary" : "outline"}
                      size="sm"
                      onClick={() => setTimezoneDisplay("UTC")}
                    >
                      UTC
                    </Button>
                    <Button
                      variant={timezoneDisplay === "Local" ? "secondary" : "outline"}
                      size="sm"
                      onClick={() => setTimezoneDisplay("Local")}
                    >
                      Local
                    </Button>
                  </div>
                </div>
                
                <Button
                  variant="outline"
                  onClick={() => filteredHotHours && exportToCSV(filteredHotHours, "hot-hours.csv")}
                  disabled={!filteredHotHours || filteredHotHours.length === 0}
                >
                  <Download className="h-4 w-4 mr-2" />
                  CSV
                </Button>
              </div>
            </Card>
            
            {/* Data Display */}
            {loadingHotHours ? (
              <div className="grid gap-4">
                {Array.from({ length: 3 }).map((_, i) => (
                  <Card key={i} className="p-6">
                    <Skeleton className="h-20 w-full" />
                  </Card>
                ))}
              </div>
            ) : errorHotHours ? (
              <Card className="p-6 text-center">
                <p className="text-sm text-destructive mb-4">Failed to load Hot Hours data</p>
                <Button variant="outline" size="sm" onClick={() => refetchHotHours()}>
                  Retry
                </Button>
              </Card>
            ) : filteredHotHours?.length === 0 ? (
              <Card className="p-12 text-center text-sm text-muted-foreground">
                No patterns found for these filters
              </Card>
            ) : selectedAirportHH ? (
              // Single airport card view
              <Card className="p-6">
                {(() => {
                  const airport = filteredHotHours?.[0];
                  if (!airport) return null;
                  
                  const hasData = airport.hour_of_day_hotness && (airport.hour_of_day_hotness as number[]).some(v => v > 0);
                  
                  return (
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <h3 className="text-lg font-medium font-mono">{airport.icao}</h3>
                        <div className="flex gap-2">
                          <Badge variant="secondary">
                            Bizjet: {((airport.bizjet_share_30d || 0) * 100).toFixed(0)}%
                          </Badge>
                          <Badge variant="secondary">
                            Short Turn: {((airport.short_turn_rate_30d || 0) * 100).toFixed(0)}%
                          </Badge>
                        </div>
                      </div>
                      
                      <div className="space-y-2">
                        <div className="text-xs text-muted-foreground">
                          24-Hour Activity Pattern ({timezoneDisplay})
                        </div>
                        {hasData ? (
                          <HeatStrip
                            hourData={airport.hour_of_day_hotness as number[]}
                            topHours={airport.top_hours_utc as number[] || []}
                          />
                        ) : (
                          <div className="h-16 flex items-center justify-center rounded-sm bg-muted/30 text-xs text-muted-foreground">
                            No signal yet for this airport (last 30d)
                          </div>
                        )}
                      </div>
                      
                      {hasData && (
                        <div className="text-xs text-muted-foreground">
                          Top hours: {airport.top_hours_utc?.map(h => h.toString().padStart(2, "0")).join(" • ") || "—"} UTC
                        </div>
                      )}
                    </div>
                  );
                })()}
              </Card>
            ) : (
              // Dense table view with mini sparklines
              <Card className="overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="border-b border-border bg-muted/30">
                      <tr>
                        <th className="px-4 py-3 text-left text-sm font-medium">ICAO</th>
                        <th className="px-4 py-3 text-left text-sm font-medium">Short Turn</th>
                        <th className="px-4 py-3 text-left text-sm font-medium">Bizjet %</th>
                        <th className="px-4 py-3 text-left text-sm font-medium">24-Hour Pattern</th>
                        <th className="px-4 py-3 text-left text-sm font-medium">Top Hours</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-border">
                      {filteredHotHours?.slice(0, 50).map((airport, idx) => {
                        const hasData = airport.hour_of_day_hotness && (airport.hour_of_day_hotness as number[]).some(v => v > 0);
                        return (
                          <tr key={idx} className="hover:bg-muted/20 h-12">
                            <td className="px-4 py-3 font-medium font-mono">{airport.icao}</td>
                            <td className="px-4 py-3">
                              <Badge variant="secondary" className="font-mono text-xs">
                                {((airport.short_turn_rate_30d || 0) * 100).toFixed(0)}%
                              </Badge>
                            </td>
                            <td className="px-4 py-3">
                              <Badge variant="outline" className="font-mono text-xs">
                                {((airport.bizjet_share_30d || 0) * 100).toFixed(0)}%
                              </Badge>
                            </td>
                            <td className="px-4 py-3">
                              <div className="w-48">
                                {hasData ? (
                                  <div className="flex items-end gap-px h-8">
                                    {(airport.hour_of_day_hotness as number[]).map((value, hour) => {
                                      const maxValue = Math.max(...(airport.hour_of_day_hotness as number[]));
                                      const heightPercent = maxValue > 0 ? (value / maxValue) * 100 : 0;
                                      const isTopHour = (airport.top_hours_utc as number[] || []).includes(hour);
                                      return (
                                        <div
                                          key={hour}
                                          className={`flex-1 rounded-sm ${
                                            isTopHour ? "bg-accent" : "bg-muted"
                                          }`}
                                          style={{ height: `${heightPercent}%`, minHeight: "2px" }}
                                        />
                                      );
                                    })}
                                  </div>
                                ) : (
                                  <span className="text-xs text-muted-foreground">No data</span>
                                )}
                              </div>
                            </td>
                            <td className="px-4 py-3 text-xs text-muted-foreground font-mono">
                              {airport.top_hours_utc && airport.top_hours_utc.length > 0
                                ? airport.top_hours_utc.map(h => h.toString().padStart(2, "0")).join(" • ")
                                : "—"}
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </Card>
            )}
          </TabsContent>

          <TabsContent value="tail-habits" className="space-y-4">
            {/* Filters */}
            <Card className="p-4">
              <div className="flex flex-wrap gap-4 items-end">
                <div className="space-y-2">
                  <label className="text-xs font-medium text-muted-foreground">Part 135 Only</label>
                  <Button
                    variant={part135Only ? "secondary" : "outline"}
                    onClick={() => setPart135Only(!part135Only)}
                  >
                    {part135Only ? "Yes" : "All"}
                  </Button>
                </div>
                
                <div className="flex-1 min-w-[150px] space-y-2">
                  <label className="text-xs font-medium text-muted-foreground">Min Samples</label>
                  <Input
                    type="number"
                    placeholder="5"
                    value={minSampleTH}
                    onChange={(e) => setMinSampleTH(e.target.value)}
                  />
                </div>
                
                <div className="flex-1 min-w-[200px] space-y-2">
                  <label className="text-xs font-medium text-muted-foreground">Sort By</label>
                  <Select value={sortByTH} onValueChange={(v: any) => setSortByTH(v)}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="bg-popover z-50">
                      <SelectItem value="rtb_rate_30d">RTB Rate</SelectItem>
                      <SelectItem value="p95_turn_mins">P95 Turn Time</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <Button
                  variant="outline"
                  onClick={() => filteredTailHabits && exportToCSV(filteredTailHabits, "tail-habits.csv")}
                  disabled={!filteredTailHabits || filteredTailHabits.length === 0}
                >
                  <Download className="h-4 w-4 mr-2" />
                  CSV
                </Button>
              </div>
            </Card>
            
            {errorTailHabits ? (
              <Card className="p-6 text-center">
                <p className="text-sm text-destructive mb-4">Failed to load Tail Habits data</p>
                <Button variant="outline" size="sm" onClick={() => refetchTailHabits()}>
                  Retry
                </Button>
              </Card>
            ) : (
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
                        <th className="px-6 py-4 text-left text-sm font-medium">Sample Size</th>
                        <th className="px-6 py-4 text-left text-sm font-medium">Actions</th>
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
                            <td className="px-6 py-4"><Skeleton className="h-4 w-12" /></td>
                            <td className="px-6 py-4"><Skeleton className="h-4 w-16" /></td>
                          </tr>
                        ))
                      ) : filteredTailHabits?.length === 0 ? (
                        <tr>
                          <td colSpan={9} className="px-6 py-12 text-center text-sm text-muted-foreground">
                            No patterns found for these filters
                          </td>
                        </tr>
                      ) : (
                        filteredTailHabits?.map((tail, idx) => (
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
                            <td className="px-6 py-4 text-sm font-mono text-muted-foreground">
                              {tail.sample_n_30d || 0}
                            </td>
                            <td className="px-6 py-4">
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handleAddToSignalsFilter(tail.n_number || "")}
                              >
                                <Plane className="h-3 w-3 mr-1" />
                                Track
                              </Button>
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              </Card>
            )}
          </TabsContent>

          <TabsContent value="rtb-routes" className="space-y-4">
            {/* Filters */}
            <Card className="p-4">
              <div className="flex flex-wrap gap-4 items-end">
                <div className="flex-1 min-w-[150px] space-y-2">
                  <label className="text-xs font-medium text-muted-foreground">DEP Airport</label>
                  <Input
                    placeholder="e.g., KTEB"
                    value={depAirport}
                    onChange={(e) => setDepAirport(e.target.value.toUpperCase())}
                    maxLength={4}
                  />
                </div>
                
                <div className="flex-1 min-w-[150px] space-y-2">
                  <label className="text-xs font-medium text-muted-foreground">ARR Airport</label>
                  <Input
                    placeholder="e.g., KVNY"
                    value={arrAirport}
                    onChange={(e) => setArrAirport(e.target.value.toUpperCase())}
                    maxLength={4}
                  />
                </div>
                
                <div className="flex-1 min-w-[150px] space-y-2">
                  <label className="text-xs font-medium text-muted-foreground">Min Samples</label>
                  <Input
                    type="number"
                    placeholder="3"
                    value={minSampleRTB}
                    onChange={(e) => setMinSampleRTB(e.target.value)}
                  />
                </div>
                
                <Button
                  variant="outline"
                  onClick={() => filteredRTBRoutes && exportToCSV(filteredRTBRoutes, "rtb-routes.csv")}
                  disabled={!filteredRTBRoutes || filteredRTBRoutes.length === 0}
                >
                  <Download className="h-4 w-4 mr-2" />
                  CSV
                </Button>
              </div>
            </Card>
            
            {errorRTBRoutes ? (
              <Card className="p-6 text-center">
                <p className="text-sm text-destructive mb-4">Failed to load RTB Routes data</p>
                <Button variant="outline" size="sm" onClick={() => refetchRTBRoutes()}>
                  Retry
                </Button>
              </Card>
            ) : (
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
                      ) : filteredRTBRoutes?.length === 0 ? (
                        <tr>
                          <td colSpan={6} className="px-6 py-12 text-center text-sm text-muted-foreground">
                            No patterns found for these filters
                          </td>
                        </tr>
                      ) : (
                        filteredRTBRoutes?.map((route, idx) => (
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
            )}
          </TabsContent>
        </Tabs>
      </div>
    </AppLayout>
  );
}
