import { useState } from "react";
import { BrokerFeed } from "@/types/database";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Plane, Calendar, Building2, ExternalLink, Shield } from "lucide-react";
import { format } from "date-fns";
import { OperatorInfoDrawer } from "@/components/operators/OperatorInfoDrawer";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";

interface OpportunityCardProps {
  opportunity: BrokerFeed;
}

export function OpportunityCard({ opportunity }: OpportunityCardProps) {
  const [showOperatorInfo, setShowOperatorInfo] = useState(false);
  
  const etdFormatted = opportunity.etd_utc 
    ? format(new Date(opportunity.etd_utc), "MMM dd, HH:mm 'UTC'")
    : "N/A";

  return (
    <Card className="hover:shadow-md transition-shadow">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 text-lg font-semibold">
            <span>{opportunity.airport_dep_icao || "???"}</span>
            <Plane className="h-4 w-4 text-muted-foreground" />
            <span>{opportunity.airport_arr_icao || "???"}</span>
          </div>
          {opportunity.operator_primary && (
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
          )}
        </div>
      </CardHeader>
      
      <CardContent className="space-y-2">
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Calendar className="h-4 w-4" />
          <Tooltip>
            <TooltipTrigger asChild>
              <span className="cursor-help">ETD: {etdFormatted}</span>
            </TooltipTrigger>
            <TooltipContent>
              <p className="text-xs">UTC times; subject to change.</p>
            </TooltipContent>
          </Tooltip>
        </div>
        
        <div className="flex items-center gap-2 text-sm">
          <Plane className="h-4 w-4 text-muted-foreground" />
          <Tooltip>
            <TooltipTrigger asChild>
              <span className="font-medium cursor-help">{opportunity.aircraft_model || "Unknown model"}</span>
            </TooltipTrigger>
            <TooltipContent>
              <p className="text-xs">As reported by the data source.</p>
            </TooltipContent>
          </Tooltip>
          <span className="text-muted-foreground">• </span>
          <Tooltip>
            <TooltipTrigger asChild>
              <span className="text-muted-foreground cursor-help">{opportunity.n_number || "N/A"}</span>
            </TooltipTrigger>
            <TooltipContent>
              <p className="text-xs">US registration used to match Part 135.</p>
            </TooltipContent>
          </Tooltip>
        </div>
        
        {opportunity.operator_primary && (
          <Tooltip>
            <TooltipTrigger asChild>
              <button
                onClick={() => setShowOperatorInfo(true)}
                className="flex items-center gap-2 text-sm w-full text-left hover:bg-muted/50 p-2 -m-2 rounded transition-colors group cursor-help"
              >
                <Building2 className="h-4 w-4 text-muted-foreground group-hover:text-primary transition-colors" />
                <span className="truncate group-hover:text-primary transition-colors">
                  {opportunity.operator_primary}
                </span>
                <ExternalLink className="h-3 w-3 ml-auto opacity-0 group-hover:opacity-100 transition-opacity" />
              </button>
            </TooltipTrigger>
            <TooltipContent>
              <p className="text-xs">Holder of the Part 135 certificate for this tail.</p>
            </TooltipContent>
          </Tooltip>
        )}
        
        {(opportunity.flight_number || opportunity.call_sign) && (
          <div className="text-xs text-muted-foreground pt-1 border-t">
            {opportunity.flight_number && <span>Flight: {opportunity.flight_number}</span>}
            {opportunity.flight_number && opportunity.call_sign && <span> • </span>}
            {opportunity.call_sign && <span>Callsign: {opportunity.call_sign}</span>}
          </div>
        )}
      </CardContent>

      <OperatorInfoDrawer
        nNumber={opportunity.n_number}
        operatorName={opportunity.operator_primary}
        open={showOperatorInfo}
        onOpenChange={setShowOperatorInfo}
      />
    </Card>
  );
}
