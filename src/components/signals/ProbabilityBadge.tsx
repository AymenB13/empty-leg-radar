import { Badge } from "@/components/ui/badge";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { formatProbability } from "@/lib/signal-utils";
import { EmptylegSignal } from "@/types/database";

interface ProbabilityBadgeProps {
  signal: EmptylegSignal;
}

export function ProbabilityBadge({ signal }: ProbabilityBadgeProps) {
  const displayValue = formatProbability(signal.prob_final);

  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <Badge variant="secondary" className="font-mono cursor-help">
          {displayValue}
        </Badge>
      </TooltipTrigger>
      <TooltipContent>
        <div className="text-xs">
          Score empty-leg&nbsp;: {signal.prob_final ? (signal.prob_final * 100).toFixed(0) : "—"}% (heuristique)
        </div>
      </TooltipContent>
    </Tooltip>
  );
}
