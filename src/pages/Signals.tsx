import { AppLayout } from "@/components/layouts/AppLayout";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useSignals } from "@/hooks/supabase/useSignals";
import { useUserSettings } from "@/hooks/supabase/useUserSettings";
import { Skeleton } from "@/components/ui/skeleton";
import { Input } from "@/components/ui/input";
import { Slider } from "@/components/ui/slider";
import { Button } from "@/components/ui/button";
import { MultiSelectAirports } from "@/components/signals/MultiSelectAirports";
import { CountdownTimer } from "@/components/signals/CountdownTimer";
import { ProbabilityBadge } from "@/components/signals/ProbabilityBadge";
import { SignalActions } from "@/components/signals/SignalActions";
import { useState, useMemo } from "react";

export default function Signals() {
  const { settings } = useUserSettings();
  const [selectedAirports, setSelectedAirports] = useState<string[]>([]);
  const [probThreshold, setProbThreshold] = useState(0.6);
  const [statusFilter, setStatusFilter] = useState<"all" | "pending" | "sent">("all");
  const [search, setSearch] = useState("");
  
  // Initialize filters from settings
  useState(() => {
    if (settings) {
      setSelectedAirports(settings.airports || []);
      setProbThreshold(settings.prob_threshold || 0.6);
    }
  });
  
  const { signals, isLoading, refetch } = useSignals({
    airports: selectedAirports.length > 0 ? selectedAirports : undefined,
    probThreshold: probThreshold,
    status: statusFilter === "all" ? ["pending", "sent"] : [statusFilter],
  });
  
  // Client-side search filter
  const filteredSignals = useMemo(() => {
    if (!signals) return [];
    if (!search) return signals;
    
    const searchLower = search.toLowerCase();
    return signals.filter(signal => 
      signal.reg?.toLowerCase().includes(searchLower) ||
      signal.airport_icao?.toLowerCase().includes(searchLower) ||
      signal.from_icao?.toLowerCase().includes(searchLower) ||
      signal.to_icao?.toLowerCase().includes(searchLower)
    );
  }, [signals, search]);
  
  const availableAirports = ["KTEB", "KVNY", "LFPB", "KASE", "EGGW", "KBOS", "KSFO", "KJFK"];

  return (
    <AppLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-medium">Signals Live</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Real-time empty leg opportunities
          </p>
        </div>
        
        {/* Filter Header */}
        <Card className="p-4">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="space-y-2">
              <label className="text-xs font-medium text-muted-foreground">Airports</label>
              <MultiSelectAirports
                value={selectedAirports}
                onChange={setSelectedAirports}
                options={availableAirports}
              />
            </div>
            
            <div className="space-y-2">
              <label className="text-xs font-medium text-muted-foreground">
                Probability ≥ {(probThreshold * 100).toFixed(0)}%
              </label>
              <Slider
                value={[probThreshold * 100]}
                onValueChange={(v) => setProbThreshold(v[0] / 100)}
                min={40}
                max={95}
                step={5}
              />
            </div>
            
            <div className="space-y-2">
              <label className="text-xs font-medium text-muted-foreground">Status</label>
              <div className="flex gap-1">
                {(["all", "pending", "sent"] as const).map((status) => (
                  <Button
                    key={status}
                    variant={statusFilter === status ? "secondary" : "outline"}
                    size="sm"
                    onClick={() => setStatusFilter(status)}
                    className="flex-1 capitalize"
                  >
                    {status}
                  </Button>
                ))}
              </div>
            </div>
            
            <div className="space-y-2">
              <label className="text-xs font-medium text-muted-foreground">Search</label>
              <Input
                placeholder="Tail or airport..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
          </div>
        </Card>

        <Card className="overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="border-b border-border bg-muted/30">
                <tr>
                  <th className="px-6 py-4 text-left text-sm font-medium">Time to Depart</th>
                  <th className="px-6 py-4 text-left text-sm font-medium">Tail</th>
                  <th className="px-6 py-4 text-left text-sm font-medium">Route</th>
                  <th className="px-6 py-4 text-left text-sm font-medium">Probability</th>
                  <th className="px-6 py-4 text-left text-sm font-medium">Reason</th>
                  <th className="px-6 py-4 text-left text-sm font-medium">Status</th>
                  <th className="px-6 py-4 text-left text-sm font-medium">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {isLoading ? (
                  Array.from({ length: 5 }).map((_, i) => (
                    <tr key={i}>
                      <td className="px-6 py-4"><Skeleton className="h-4 w-20" /></td>
                      <td className="px-6 py-4"><Skeleton className="h-4 w-20" /></td>
                      <td className="px-6 py-4"><Skeleton className="h-4 w-24" /></td>
                      <td className="px-6 py-4"><Skeleton className="h-4 w-12" /></td>
                      <td className="px-6 py-4"><Skeleton className="h-4 w-24" /></td>
                      <td className="px-6 py-4"><Skeleton className="h-4 w-16" /></td>
                      <td className="px-6 py-4"><Skeleton className="h-4 w-20" /></td>
                    </tr>
                  ))
                ) : filteredSignals?.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="px-6 py-12 text-center text-sm text-muted-foreground">
                      No hot signals yet. You'll see live heads-up here as jets turn around.
                    </td>
                  </tr>
                ) : (
                  filteredSignals?.map((signal) => (
                    <tr key={signal.id} className="hover:bg-muted/20">
                      <td className="px-6 py-4">
                        <CountdownTimer etd_next={signal.etd_next} />
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          <span className="font-medium font-mono">{signal.reg || "—"}</span>
                          {signal.is_ml_augmented && (
                            <Badge variant="outline" className="text-xs">Part135</Badge>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4 font-medium">
                        {signal.airport_icao} → {signal.to_icao}
                      </td>
                      <td className="px-6 py-4">
                        <ProbabilityBadge signal={signal} />
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex flex-wrap gap-1">
                          {signal.reason?.split(",").map((tag, idx) => (
                            <Badge key={idx} variant="outline" className="text-xs">
                              {tag.trim()}
                            </Badge>
                          ))}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <Badge
                          variant={signal.status === "pending" ? "secondary" : "default"}
                          className="capitalize"
                        >
                          {signal.status}
                        </Badge>
                      </td>
                      <td className="px-6 py-4">
                        <SignalActions
                          signal={signal}
                          slackWebhook={settings?.notify_slack_webhook}
                          onUpdate={refetch}
                        />
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
