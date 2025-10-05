import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

interface HeatStripProps {
  hourData: number[];
  topHours: number[];
}

export function HeatStrip({ hourData, topHours }: HeatStripProps) {
  const maxValue = Math.max(...hourData);
  
  return (
    <TooltipProvider>
      <div className="flex items-end gap-0.5 h-16">
        {hourData.map((value, hour) => {
          const heightPercent = maxValue > 0 ? (value / maxValue) * 100 : 0;
          const isTopHour = topHours.includes(hour);
          
          return (
            <Tooltip key={hour}>
              <TooltipTrigger asChild>
                <div
                  className={`flex-1 rounded-sm transition-all cursor-help ${
                    isTopHour
                      ? "bg-accent"
                      : "bg-muted hover:bg-muted/80"
                  }`}
                  style={{ height: `${heightPercent}%`, minHeight: "4px" }}
                />
              </TooltipTrigger>
              <TooltipContent>
                <div className="text-xs">
                  <div className="font-medium">{hour.toString().padStart(2, "0")}:00 UTC</div>
                  <div>Activity: {value.toFixed(2)}</div>
                  {isTopHour && <div className="text-accent-foreground">Top Hour</div>}
                </div>
              </TooltipContent>
            </Tooltip>
          );
        })}
      </div>
    </TooltipProvider>
  );
}
