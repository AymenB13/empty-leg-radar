import { useState } from "react";
import { SignalPublishEnriched } from "@/types/database";
import { Card, CardContent, CardHeader, CardFooter } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Plane, Clock, Building2, AlertCircle, Copy, ExternalLink, Shield, HelpCircle, Home } from "lucide-react";
import { format, formatDistanceToNow } from "date-fns";
import { getSignalVerdict } from "@/lib/signal-utils";
import { toast } from "sonner";
import { OperatorInfoDrawer } from "@/components/operators/OperatorInfoDrawer";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";

interface HeadsUpCardProps {
  signal: SignalPublishEnriched;
}

export function HeadsUpCard({ signal }: HeadsUpCardProps) {
  const [showOperatorInfo, setShowOperatorInfo] = useState(false);
  
  const etdFormatted = signal.etd_next 
    ? format(new Date(signal.etd_next), "MMM dd, HH:mm 'UTC'")
    : "N/A";
  
  const etaFormatted = signal.eta_arrival 
    ? format(new Date(signal.eta_arrival), "MMM dd, HH:mm 'UTC'")
    : null;
  
  const timeToDepart = signal.etd_next 
    ? formatDistanceToNow(new Date(signal.etd_next), { addSuffix: true })
    : "Unknown";

  // Plain-language empty-leg verdict derived from the scorer's base-direction reason.
  const verdict = getSignalVerdict(signal.reason, signal.to_icao);

  // Priority styling based on prob_headsup
  const getPriorityBorder = (prob: number | null) => {
    if (!prob) return "";
    if (prob >= 0.8) return "border-l-4 border-l-destructive";
    if (prob >= 0.6) return "border-l-4 border-l-orange-500";
    return "border-l-4 border-l-yellow-500";
  };

  const handleCopyPitch = async () => {
    const pitch = `🚨 Heads-up Alert

Aircraft: ${signal.aircraft_model || "Unknown"} (${signal.n_number || "N/A"})
Operator: ${signal.operator_primary || "Unknown"}
Route: ${signal.from_icao} → ${signal.to_icao}
ETD: ${etdFormatted}
${etaFormatted ? `ETA: ${etaFormatted}` : ''}

Probability: ${signal.prob_headsup ? (signal.prob_headsup * 100).toFixed(0) : "—"}% heads-up / ${signal.prob_emptyleg ? (signal.prob_emptyleg * 100).toFixed(0) : "—"}% empty-leg
Reason: ${signal.reason || "N/A"}

✅ Part 135 confirmed`;
    
    await navigator.clipboard.writeText(pitch);
    toast.success("Pitch copied to clipboard!");
  };

  return (
    <Card className={`hover:shadow-lg transition-all ${getPriorityBorder(signal.prob_headsup)}`}>
      <CardHeader className="pb-3">
        {/* Route principale */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 text-xl font-bold">
            <span className="text-foreground">{signal.from_icao || "???"}</span>
            <Plane className="h-5 w-5 text-muted-foreground" />
            <span className="text-foreground">{signal.to_icao || "???"}</span>
            
            {/* "Why am I seeing this?" Popover */}
            <Popover>
              <PopoverTrigger asChild>
                <button className="text-muted-foreground hover:text-primary transition-colors">
                  <HelpCircle className="h-4 w-4" />
                </button>
              </PopoverTrigger>
              <PopoverContent className="w-80">
                <div className="space-y-3 text-sm">
                  <div>
                    <h4 className="font-semibold mb-1">Why am I seeing this flight?</h4>
                  </div>
                  <div className="space-y-2">
                    <div className="flex items-start gap-2">
                      <Shield className="h-4 w-4 text-green-600 mt-0.5 flex-shrink-0" />
                      <div>
                        <p className="font-medium">Certified Part 135 ✅</p>
                        <p className="text-xs text-muted-foreground">FAA/135 match confirmed</p>
                      </div>
                    </div>
                    {signal.reason && (
                      <div className="flex items-start gap-2">
                        <AlertCircle className="h-4 w-4 text-orange-600 mt-0.5 flex-shrink-0" />
                        <div>
                          <p className="font-medium">Operational pattern</p>
                          <p className="text-xs text-muted-foreground">{signal.reason}</p>
                        </div>
                      </div>
                    )}
                    <div className="flex items-start gap-2">
                      <Clock className="h-4 w-4 text-blue-600 mt-0.5 flex-shrink-0" />
                      <div>
                        <p className="font-medium">Timing window</p>
                        <p className="text-xs text-muted-foreground">
                          dep ~ {etdFormatted}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-start gap-2">
                      <Plane className="h-4 w-4 text-purple-600 mt-0.5 flex-shrink-0" />
                      <div>
                        <p className="font-medium">De-dup</p>
                        <p className="text-xs text-muted-foreground">
                          One alert per tail per minute
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </PopoverContent>
            </Popover>
          </div>
          
          {/* Badge Part 135 */}
          <Tooltip>
            <TooltipTrigger asChild>
              <Badge className="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-100 border-green-300 cursor-help">
                <Shield className="h-3 w-3 mr-1" />
                Part 135
              </Badge>
            </TooltipTrigger>
            <TooltipContent>
              <p className="text-xs">Certified Part 135 (US). Eligible for on-demand charter.</p>
            </TooltipContent>
          </Tooltip>
        </div>

        {/* Time to Depart (prominent) */}
        <div className="flex items-center gap-2 text-sm font-medium text-orange-600">
          <Clock className="h-4 w-4" />
          <span>{timeToDepart}</span>
        </div>
      </CardHeader>
      
      <CardContent className="space-y-3">
        {/* Aircraft & Tail */}
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <Plane className="h-4 w-4 text-muted-foreground" />
            <Tooltip>
              <TooltipTrigger asChild>
                <span className="font-semibold cursor-help">{signal.aircraft_model || "Unknown"}</span>
              </TooltipTrigger>
              <TooltipContent>
                <p className="text-xs">As reported by the data source.</p>
              </TooltipContent>
            </Tooltip>
          </div>
          <div className="text-sm text-muted-foreground pl-6">
            Tail: <Tooltip>
              <TooltipTrigger asChild>
                <span className="font-mono font-medium cursor-help">{signal.n_number || "N/A"}</span>
              </TooltipTrigger>
              <TooltipContent>
                <p className="text-xs">US registration used to match Part 135.</p>
              </TooltipContent>
            </Tooltip>
          </div>
        </div>

        {/* Operator */}
        {signal.operator_primary && (
          <Tooltip>
            <TooltipTrigger asChild>
              <button
                onClick={() => setShowOperatorInfo(true)}
                className="flex items-center gap-2 text-sm w-full text-left hover:bg-muted/50 p-2 -m-2 rounded transition-colors group cursor-help"
              >
                <Building2 className="h-4 w-4 text-muted-foreground group-hover:text-primary transition-colors" />
                <span className="truncate group-hover:text-primary transition-colors">
                  {signal.operator_primary}
                </span>
                <ExternalLink className="h-3 w-3 ml-auto opacity-0 group-hover:opacity-100 transition-opacity" />
              </button>
            </TooltipTrigger>
            <TooltipContent>
              <p className="text-xs">Holder of the Part 135 certificate for this tail.</p>
            </TooltipContent>
          </Tooltip>
        )}

        {/* Probabilities */}
        <div className="flex gap-2">
          <Tooltip>
            <TooltipTrigger asChild>
              <Badge variant="secondary" className="font-mono cursor-help">
                Heads-up: {signal.prob_headsup ? (signal.prob_headsup * 100).toFixed(0) : "—"}%
              </Badge>
            </TooltipTrigger>
            <TooltipContent>
              <p className="text-xs">Confidence in the signal (data completeness & pattern strength).</p>
            </TooltipContent>
          </Tooltip>
          <Tooltip>
            <TooltipTrigger asChild>
              <Badge variant="outline" className="font-mono cursor-help">
                Empty: {signal.prob_emptyleg ? (signal.prob_emptyleg * 100).toFixed(0) : "—"}%
              </Badge>
            </TooltipTrigger>
            <TooltipContent>
              <p className="text-xs">Model estimate that next leg is empty.</p>
            </TooltipContent>
          </Tooltip>
        </div>

        {/* Empty-leg verdict — what this means for the broker */}
        <div
          className={
            verdict.tone === "strong"
              ? "rounded-md border p-2.5 bg-green-100 text-green-900 border-green-300 dark:bg-green-900/40 dark:text-green-100"
              : verdict.tone === "medium"
              ? "rounded-md border p-2.5 bg-amber-100 text-amber-900 border-amber-300 dark:bg-amber-900/40 dark:text-amber-100"
              : verdict.tone === "unknown"
              ? "rounded-md border border-dashed p-2.5 bg-muted/50 text-muted-foreground"
              : "rounded-md border p-2.5 bg-muted text-muted-foreground"
          }
        >
          <div className="flex items-center gap-2">
            {verdict.tone === "strong" || verdict.tone === "medium" ? (
              <Home className="h-4 w-4 flex-shrink-0" />
            ) : (
              <Plane className="h-4 w-4 flex-shrink-0" />
            )}
            <span className="text-sm font-semibold">{verdict.label}</span>
          </div>
          <p className="text-xs mt-1 opacity-90">{verdict.detail}</p>
        </div>

        {/* Timing details */}
        <div className="text-xs text-muted-foreground border-t pt-2 space-y-1">
          <Tooltip>
            <TooltipTrigger asChild>
              <div className="cursor-help">ETD: {etdFormatted}</div>
            </TooltipTrigger>
            <TooltipContent>
              <p className="text-xs">UTC times; subject to change.</p>
            </TooltipContent>
          </Tooltip>
          {etaFormatted && (
            <Tooltip>
              <TooltipTrigger asChild>
                <div className="cursor-help">ETA: {etaFormatted}</div>
              </TooltipTrigger>
              <TooltipContent>
                <p className="text-xs">UTC times; subject to change.</p>
              </TooltipContent>
            </Tooltip>
          )}
        </div>
      </CardContent>

      <CardFooter className="pt-3 border-t">
        <Button 
          variant="outline" 
          size="sm" 
          onClick={handleCopyPitch}
          className="w-full"
        >
          <Copy className="h-4 w-4 mr-2" />
          Copy Pitch
        </Button>
      </CardFooter>

      <OperatorInfoDrawer
        nNumber={signal.n_number}
        operatorName={signal.operator_primary}
        open={showOperatorInfo}
        onOpenChange={setShowOperatorInfo}
      />
    </Card>
  );
}
