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
import { RefreshCw, HelpCircle, ChevronDown, Plane, Clock, TrendingUp, AlertCircle, BookOpen, Shield } from "lucide-react";
import { useState, useMemo, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import { TooltipProvider } from "@/components/ui/tooltip";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Alert, AlertDescription } from "@/components/ui/alert";

export default function Signals() {
  const [searchParams, setSearchParams] = useSearchParams();
  const { settings } = useUserSettings();
  const [selectedAirports, setSelectedAirports] = useState<string[]>([]);
  const [probThreshold, setProbThreshold] = useState(0.6);
  const [search, setSearch] = useState("");
  const [showHelp, setShowHelp] = useState(false);
  const [showGlossary, setShowGlossary] = useState(false);
  
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
          <div className="flex items-center gap-2">
            <Popover open={showGlossary} onOpenChange={setShowGlossary}>
              <PopoverTrigger asChild>
                <Button variant="ghost" size="sm">
                  <BookOpen className="h-4 w-4 mr-2" />
                  Glossary
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-80">
                <div className="space-y-3">
                  <h4 className="font-semibold text-sm">Mini Glossary</h4>
                  <div className="space-y-2 text-xs">
                    <div>
                      <p className="font-medium">Part 135</p>
                      <p className="text-muted-foreground">US certificate authorizing on-demand charter.</p>
                    </div>
                    <div>
                      <p className="font-medium">Empty leg</p>
                      <p className="text-muted-foreground">Repositioning/empty segment likely sellable.</p>
                    </div>
                    <div>
                      <p className="font-medium">Heads-up</p>
                      <p className="text-muted-foreground">Early signal triggered by operational patterns.</p>
                    </div>
                    <div>
                      <p className="font-medium">De-dup (tail×minute)</p>
                      <p className="text-muted-foreground">Prevent alert spam for the same aircraft/time.</p>
                    </div>
                  </div>
                </div>
              </PopoverContent>
            </Popover>
            <Button 
              variant="outline" 
              size="sm"
              onClick={() => refetch()}
            >
              <RefreshCw className="h-4 w-4 mr-2" />
              Refresh
            </Button>
          </div>
        </div>

        {/* Help Section */}
        <Collapsible open={showHelp} onOpenChange={setShowHelp}>
          <CollapsibleTrigger asChild>
            <Button variant="outline" className="w-full justify-between">
              <span className="flex items-center gap-2">
                <HelpCircle className="h-4 w-4" />
                Help: What am I seeing?
              </span>
              <ChevronDown className={`h-4 w-4 transition-transform ${showHelp ? "rotate-180" : ""}`} />
            </Button>
          </CollapsibleTrigger>
          <CollapsibleContent>
            <Card className="p-4 mt-2 bg-muted/30">
              <div className="space-y-4 text-sm">
                <div>
                  <h3 className="font-semibold mb-2">What You're Seeing</h3>
                  <p className="text-muted-foreground">
                    Early predicted empty legs, already filtered to Part 135 and de-duplicated.
                  </p>
                </div>

                <div>
                  <h3 className="font-semibold mb-2">Each Card Shows</h3>
                  <ul className="space-y-2 text-muted-foreground">
                    <li className="flex items-start gap-2">
                      <Plane className="h-4 w-4 mt-0.5 flex-shrink-0" />
                      <span><strong>Route:</strong> FROM → TO (derived from recent ops)</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <Clock className="h-4 w-4 mt-0.5 flex-shrink-0" />
                      <span><strong>ETD next (UTC) and ETA arrival</strong> (context)</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <Plane className="h-4 w-4 mt-0.5 flex-shrink-0" />
                      <span><strong>Tail & Operator</strong> (Part 135 holder)</span>
                    </li>
                  </ul>
                </div>

                <div>
                  <h3 className="font-semibold mb-2">Scores</h3>
                  <ul className="space-y-2 text-muted-foreground">
                    <li className="flex items-start gap-2">
                      <TrendingUp className="h-4 w-4 mt-0.5 flex-shrink-0" />
                      <span><strong>Empty-leg probability:</strong> Chance the next sector is empty</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <TrendingUp className="h-4 w-4 mt-0.5 flex-shrink-0" />
                      <span><strong>Heads-up score:</strong> Confidence in the signal itself</span>
                    </li>
                  </ul>
                </div>

                <div className="bg-background border p-3 rounded">
                  <h3 className="font-semibold mb-1 flex items-center gap-2">
                    <AlertCircle className="h-4 w-4" />
                    Reason
                  </h3>
                  <p className="text-muted-foreground text-xs">
                    Short driver (e.g., Fast turnaround)
                  </p>
                </div>

                {/* Badge Legend */}
                <div className="bg-blue-50 dark:bg-blue-950 border border-blue-200 dark:border-blue-800 p-3 rounded-lg">
                  <h3 className="font-semibold mb-2 flex items-center gap-2 text-sm">
                    <Shield className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                    Badge Legend
                  </h3>
                  <div className="space-y-2 text-muted-foreground">
                    <div className="flex items-center gap-2">
                      <Badge className="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-100 text-xs">
                        <Shield className="h-3 w-3 mr-1" />
                        Part 135
                      </Badge>
                      <span className="text-xs">US charter-eligible.</span>
                    </div>
                    <p className="text-xs">• <strong>Non-US (grey):</strong> (optional later) needs EASA/AOC module to qualify.</p>
                    <p className="text-xs">• <strong>Not eligible:</strong> No Part 135/AOC match.</p>
                  </div>
                </div>

                {/* Common Edge Cases */}
                <Alert>
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>
                    <h4 className="font-medium mb-2 text-sm">Common Edge Cases</h4>
                    <ul className="space-y-1 text-xs text-muted-foreground">
                      <li>• <strong>Missing tail:</strong> We fallback via Mode-S (ICAO24) and timing.</li>
                      <li>• <strong>Different names:</strong> Owner (FAA) ≠ operator (Part 135) is normal.</li>
                      <li>• <strong>Cargo / Part 121:</strong> May appear in Opportunities but won't get a Part 135 badge.</li>
                    </ul>
                  </AlertDescription>
                </Alert>
              </div>
            </Card>
          </CollapsibleContent>
        </Collapsible>
        
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
              No early signals match your filters. Lower the probability or add airports.
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

            {/* Data Freshness Footer */}
            <div className="flex items-start gap-3 p-3 bg-muted/30 rounded-lg border">
              <Clock className="h-4 w-4 text-muted-foreground mt-0.5 flex-shrink-0" />
              <div className="space-y-1">
                <p className="text-xs text-muted-foreground">
                  <strong>Updated continuously;</strong> materialized views refresh server-side.
                </p>
                <p className="text-xs text-muted-foreground">
                  Flight status and routings can change without notice.
                </p>
              </div>
            </div>
          </>
        )}
        </div>
      </TooltipProvider>
    </AppLayout>
  );
}
