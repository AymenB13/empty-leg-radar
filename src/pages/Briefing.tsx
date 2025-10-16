import { AppLayout } from "@/components/layouts/AppLayout";
import { useDailyBriefing } from "@/hooks/supabase/useDailyBriefing";
import { useUserSettings } from "@/hooks/supabase/useUserSettings";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { HeatStrip } from "@/components/patterns/HeatStrip";
import { RefreshCw, Mail, ExternalLink } from "lucide-react";
import { format } from "date-fns";
import { toast } from "sonner";

export default function Briefing() {
  const { settings } = useUserSettings();
  const airports = settings?.airports || [];
  const { data: briefings, isLoading, refetch } = useDailyBriefing(airports);

  const isHotNow = (hotHours: { hour: number; score: number }[]) => {
    const currentHour = new Date().getUTCHours();
    const currentScore = hotHours.find(h => h.hour === currentHour)?.score || 0;
    return currentScore > 0.5;
  };

  const getTopHours = (hotHours: { hour: number; score: number; sample_n: number }[], count: number = 3) => {
    return [...hotHours]
      .sort((a, b) => b.score - a.score)
      .slice(0, count);
  };

  const copyEmailScript = (operator: { name: string; reason: string }) => {
    const script = `Subject: Partnership opportunity - ${operator.name}

Hi ${operator.name} team,

We've observed ${operator.reason.toLowerCase()} in our market intelligence.

We work with clients who frequently need charter coverage on short notice. Would you be open to a quick conversation about collaboration opportunities?

Looking forward to hearing from you.

Best regards,
[Your name]`;

    navigator.clipboard.writeText(script);
    toast.success("Email script copied to clipboard");
  };

  const handleRefresh = () => {
    refetch();
    toast.success("Briefing refreshed");
  };

  if (isLoading) {
    return (
      <AppLayout>
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-sm text-muted-foreground">Loading briefing...</div>
        </div>
      </AppLayout>
    );
  }

  return (
    <AppLayout>
      <div className="space-y-8">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-medium">Daily Playbook</h1>
            <p className="text-sm text-muted-foreground mt-1">
              Your intel for {format(new Date(), 'EEEE, MMMM d')}
            </p>
          </div>
          <Button variant="outline" onClick={handleRefresh}>
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh
          </Button>
        </div>

        {/* Empty state */}
        {!briefings || briefings.length === 0 ? (
          <Card className="p-12 text-center">
            <p className="text-lg text-muted-foreground">
              No briefing available for today
            </p>
            <p className="text-sm text-muted-foreground mt-2">
              Briefings are generated nightly at 3h UTC
            </p>
            {airports.length === 0 && (
              <p className="text-sm text-muted-foreground mt-4">
                Add airports to your watchlist in <a href="/settings" className="text-primary hover:underline">Settings</a>
              </p>
            )}
          </Card>
        ) : (
          /* Cards par aéroport */
          briefings.map(briefing => (
            <Card key={briefing.airport_icao} className="p-6 space-y-6">
              {/* Header aéroport */}
              <div className="flex items-center gap-3">
                <h2 className="text-2xl font-medium">{briefing.airport_icao}</h2>
                {isHotNow(briefing.hot_hours) && (
                  <Badge variant="destructive">Live now</Badge>
                )}
              </div>

              {/* Section 1: Hot Hours */}
              {briefing.hot_hours && briefing.hot_hours.length > 0 && (
                <div>
                  <h3 className="text-sm font-medium mb-3">Hot Hours Today</h3>
                  <HeatStrip 
                    hourData={briefing.hot_hours.map(h => h.score)}
                    topHours={getTopHours(briefing.hot_hours, 3).map(h => h.hour)}
                  />
                  <div className="flex gap-2 mt-3 flex-wrap">
                    {getTopHours(briefing.hot_hours, 3).map(h => (
                      <Badge key={h.hour} variant="secondary">
                        {h.hour.toString().padStart(2, '0')}h UTC ({(h.score * 100).toFixed(0)}%)
                      </Badge>
                    ))}
                  </div>
                </div>
              )}

              {/* Section 2: Probable Routes */}
              {briefing.probable_routes && briefing.probable_routes.length > 0 && (
                <div>
                  <h3 className="text-sm font-medium mb-3">Probable Routes</h3>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Route</TableHead>
                        <TableHead>Probability</TableHead>
                        <TableHead>Action</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {briefing.probable_routes.slice(0, 5).map((route, i) => (
                        <TableRow key={i}>
                          <TableCell>
                            <code className="text-sm font-mono">{route.dep} → {route.arr}</code>
                          </TableCell>
                          <TableCell>
                            <Badge variant="outline">
                              {(route.prob * 100).toFixed(0)}%
                            </Badge>
                          </TableCell>
                          <TableCell>
                            <Button 
                              variant="outline" 
                              size="sm"
                              disabled
                              title="Find Cover coming soon"
                            >
                              Find Cover
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              )}

              {/* Section 3: Priority Operators */}
              {briefing.priority_operators && briefing.priority_operators.length > 0 && (
                <div>
                  <h3 className="text-sm font-medium mb-3">Priority Operators</h3>
                  <div className="space-y-3">
                    {briefing.priority_operators.slice(0, 3).map((op, i) => (
                      <div key={i} className="flex items-center justify-between p-3 border rounded-lg">
                        <div className="flex-1">
                          <p className="font-medium">{op.name}</p>
                          <p className="text-sm text-muted-foreground">{op.reason}</p>
                        </div>
                        <div className="flex gap-2">
                          <Button 
                            variant="outline" 
                            size="sm"
                            onClick={() => copyEmailScript(op)}
                          >
                            <Mail className="h-4 w-4 mr-2" />
                            Copy email
                          </Button>
                          <Button 
                            variant="ghost" 
                            size="sm"
                            disabled
                            title="Operator details coming soon"
                          >
                            <ExternalLink className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </Card>
          ))
        )}
      </div>
    </AppLayout>
  );
}
