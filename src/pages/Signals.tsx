import { AppLayout } from "@/components/layouts/AppLayout";
import { Card } from "@/components/ui/card";
import { useSignals } from "@/hooks/supabase/useSignals";
import { useUserSettings } from "@/hooks/supabase/useUserSettings";
import { Skeleton } from "@/components/ui/skeleton";
import { Input } from "@/components/ui/input";
import { Slider } from "@/components/ui/slider";
import { Button } from "@/components/ui/button";
import { MultiSelectAirports } from "@/components/signals/MultiSelectAirports";
import { HeadsUpCard } from "@/components/signals/HeadsUpCard";
import { Badge } from "@/components/ui/badge";
import { RefreshCw } from "lucide-react";
import { useState, useMemo, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import { TooltipProvider } from "@/components/ui/tooltip";

export default function Signals() {
  const [searchParams, setSearchParams] = useSearchParams();
  const { settings } = useUserSettings();
  const [selectedAirports, setSelectedAirports] = useState<string[]>([]);
  const [probThreshold, setProbThreshold] = useState(0.6);
  const [search, setSearch] = useState("");
  
  // Initialize from URL params or settings
  useEffect(() => {
    const airportsParam = searchParams.get("airports");
    const thresholdParam = searchParams.get("threshold");
    const searchParam = searchParams.get("search");

    if (airportsParam) {
      setSelectedAirports(airportsParam.split(","));
    } else if (settings) {
      setSelectedAirports(settings.airports || []);
    }

    if (thresholdParam) {
      setProbThreshold(parseFloat(thresholdParam));
    } else if (settings) {
      setProbThreshold(settings.prob_threshold || 0.6);
    }

    if (searchParam) {
      setSearch(searchParam);
    }
  }, [settings, searchParams]);

  // Update URL params when filters change
  useEffect(() => {
    const params = new URLSearchParams();
    if (selectedAirports.length > 0) params.set("airports", selectedAirports.join(","));
    if (probThreshold !== 0.6) params.set("threshold", probThreshold.toString());
    if (search) params.set("search", search);
    setSearchParams(params, { replace: true });
  }, [selectedAirports, probThreshold, search, setSearchParams]);
  
  const { signals, isLoading, refetch } = useSignals({
    airports: selectedAirports.length > 0 ? selectedAirports : undefined,
    probThreshold: probThreshold,
  });
  
  // Client-side search filter
  const filteredSignals = useMemo(() => {
    if (!signals) return [];
    if (!search) return signals;
    
    const searchLower = search.toLowerCase();
    return signals.filter(signal => 
      signal.n_number?.toLowerCase().includes(searchLower) ||
      signal.from_icao?.toLowerCase().includes(searchLower) ||
      signal.to_icao?.toLowerCase().includes(searchLower) ||
      signal.operator_primary?.toLowerCase().includes(searchLower)
    );
  }, [signals, search]);
  
  const availableAirports = ["KTEB", "KVNY", "LFPB", "KASE", "EGGW", "KBOS", "KSFO", "KJFK"];

  return (
    <AppLayout>
      <TooltipProvider>
        <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-3xl font-bold">Heads-up Predictions</h1>
              <Badge className="bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-100 border-orange-300">
                Early
              </Badge>
            </div>
            <p className="text-muted-foreground mt-1">
              Early empty-leg predictions (scored & Part 135 only).
            </p>
          </div>
          <Button 
            variant="outline" 
            size="sm"
            onClick={() => refetch()}
          >
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh
          </Button>
        </div>
        
        {/* Filter Header */}
        <Card className="p-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
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
                Heads-up Probability ≥ {(probThreshold * 100).toFixed(0)}%
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
              <label className="text-xs font-medium text-muted-foreground">Search</label>
              <Input
                placeholder="Tail, airport, or operator..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
          </div>
        </Card>

        {/* Signals Grid */}
        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {Array.from({ length: 6 }).map((_, i) => (
              <Card key={i} className="p-6">
                <Skeleton className="h-6 w-32 mb-4" />
                <Skeleton className="h-4 w-24 mb-2" />
                <Skeleton className="h-4 w-full mb-2" />
                <Skeleton className="h-4 w-3/4" />
              </Card>
            ))}
          </div>
        ) : filteredSignals?.length === 0 ? (
          <Card className="p-12">
            <div className="text-center text-muted-foreground">
              No early signals match your filters.
            </div>
          </Card>
        ) : (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredSignals?.map((signal) => (
                <HeadsUpCard key={signal.id} signal={signal} />
              ))}
            </div>
            
            {/* Count footer */}
            <div className="text-center text-sm text-muted-foreground">
              {filteredSignals?.length || 0} active prediction{filteredSignals?.length !== 1 ? 's' : ''}
            </div>
          </>
        )}
        </div>
      </TooltipProvider>
    </AppLayout>
  );
}
