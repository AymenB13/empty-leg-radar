import { SignalPublishEnriched } from "@/types/database";
import { Card, CardContent, CardHeader, CardFooter } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Plane, Clock, Building2, AlertCircle, Copy } from "lucide-react";
import { format, formatDistanceToNow } from "date-fns";
import { toast } from "sonner";

interface HeadsUpCardProps {
  signal: SignalPublishEnriched;
}

export function HeadsUpCard({ signal }: HeadsUpCardProps) {
  const etdFormatted = signal.etd_next 
    ? format(new Date(signal.etd_next), "MMM dd, HH:mm 'UTC'")
    : "N/A";
  
  const etaFormatted = signal.eta_arrival 
    ? format(new Date(signal.eta_arrival), "MMM dd, HH:mm 'UTC'")
    : null;
  
  const timeToDepart = signal.etd_next 
    ? formatDistanceToNow(new Date(signal.etd_next), { addSuffix: true })
    : "Unknown";

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
          </div>
          
          {/* Badge Part 135 */}
          <Badge className="bg-green-600 hover:bg-green-700 text-white">
            Part 135 ✓
          </Badge>
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
            <span className="font-semibold">{signal.aircraft_model || "Unknown"}</span>
          </div>
          <div className="text-sm text-muted-foreground pl-6">
            Tail: <span className="font-mono font-medium">{signal.n_number || "N/A"}</span>
          </div>
        </div>

        {/* Operator */}
        {signal.operator_primary && (
          <div className="flex items-center gap-2 text-sm">
            <Building2 className="h-4 w-4 text-muted-foreground" />
            <span className="truncate">{signal.operator_primary}</span>
          </div>
        )}

        {/* Probabilities */}
        <div className="flex gap-2">
          <Badge variant="secondary" className="font-mono">
            Heads-up: {signal.prob_headsup ? (signal.prob_headsup * 100).toFixed(0) : "—"}%
          </Badge>
          <Badge variant="outline" className="font-mono">
            Empty: {signal.prob_emptyleg ? (signal.prob_emptyleg * 100).toFixed(0) : "—"}%
          </Badge>
        </div>

        {/* Reason */}
        {signal.reason && (
          <div className="flex items-start gap-2 text-xs bg-muted/50 p-2 rounded">
            <AlertCircle className="h-3 w-3 text-muted-foreground mt-0.5 flex-shrink-0" />
            <span className="text-muted-foreground">{signal.reason}</span>
          </div>
        )}

        {/* Timing details */}
        <div className="text-xs text-muted-foreground border-t pt-2 space-y-1">
          <div>ETD: {etdFormatted}</div>
          {etaFormatted && <div>ETA: {etaFormatted}</div>}
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
    </Card>
  );
}
