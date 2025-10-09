import { BrokerFeed } from "@/types/database";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Plane, Calendar, Building2 } from "lucide-react";
import { format } from "date-fns";

interface OpportunityCardProps {
  opportunity: BrokerFeed;
}

export function OpportunityCard({ opportunity }: OpportunityCardProps) {
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
          <Badge variant="secondary" className="bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-100">
            Part 135
          </Badge>
        </div>
      </CardHeader>
      
      <CardContent className="space-y-2">
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Calendar className="h-4 w-4" />
          <span>ETD: {etdFormatted}</span>
        </div>
        
        <div className="flex items-center gap-2 text-sm">
          <Plane className="h-4 w-4 text-muted-foreground" />
          <span className="font-medium">{opportunity.aircraft_model || "Unknown model"}</span>
          <span className="text-muted-foreground">• {opportunity.n_number || "N/A"}</span>
        </div>
        
        {opportunity.operator_primary && (
          <div className="flex items-center gap-2 text-sm">
            <Building2 className="h-4 w-4 text-muted-foreground" />
            <span>{opportunity.operator_primary}</span>
          </div>
        )}
        
        {(opportunity.flight_number || opportunity.call_sign) && (
          <div className="text-xs text-muted-foreground pt-1 border-t">
            {opportunity.flight_number && <span>Flight: {opportunity.flight_number}</span>}
            {opportunity.flight_number && opportunity.call_sign && <span> • </span>}
            {opportunity.call_sign && <span>Callsign: {opportunity.call_sign}</span>}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
