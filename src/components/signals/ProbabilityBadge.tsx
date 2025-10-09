import { Badge } from "@/components/ui/badge";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { formatProbability } from "@/lib/signal-utils";
import { EmptylegSignal } from "@/types/database";

interface ProbabilityBadgeProps {
  signal: EmptylegSignal;
}

export function ProbabilityBadge({ signal }: ProbabilityBadgeProps) {
  const displayValue = formatProbability(signal.prob_final);
  
  const tooltipContent = (
    <div className="text-xs space-y-1">
      <div>Baseline: {signal.prob_baseline ? (signal.prob_baseline * 100).toFixed(0) : "—"}%</div>
      {signal.is_ml_augmented && (
        <div>ML: {signal.prob_ml ? (signal.prob_ml * 100).toFixed(0) : "—"}%</div>
      )}
      <div className="font-medium">Final: {signal.prob_final ? (signal.prob_final * 100).toFixed(0) : "—"}%</div>
    </div>
  );
  
  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <Badge variant="secondary" className="font-mono cursor-help">
          {displayValue}
        </Badge>
      </TooltipTrigger>
      <TooltipContent>
        {tooltipContent}
      </TooltipContent>
    </Tooltip>
  );
}
