import { useDealTickets, useUpdateDealTicketStatus } from "@/hooks/supabase/useDealTickets";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { AppLayout } from "@/components/layouts/AppLayout";
import { Loader2 } from "lucide-react";

export default function DealTickets() {
  const { data: tickets, isLoading } = useDealTickets();
  const { mutate: updateStatus } = useUpdateDealTicketStatus();

  const filterByStatus = (status: string) => 
    tickets?.filter(t => t.status === status) || [];

  if (isLoading) {
    return (
      <AppLayout>
        <div className="flex items-center justify-center min-h-[400px]">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </div>
      </AppLayout>
    );
  }

  return (
    <AppLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold">Deal Tickets</h1>
          <p className="text-muted-foreground mt-1">
            Track your coverage requests
          </p>
        </div>

        <Tabs defaultValue="open">
          <TabsList>
            <TabsTrigger value="open">
              Open ({filterByStatus('open').length})
            </TabsTrigger>
            <TabsTrigger value="contacted">
              Contacted ({filterByStatus('contacted').length})
            </TabsTrigger>
            <TabsTrigger value="won">
              Won ({filterByStatus('won').length})
            </TabsTrigger>
            <TabsTrigger value="lost">
              Lost ({filterByStatus('lost').length})
            </TabsTrigger>
          </TabsList>

          {(['open', 'contacted', 'won', 'lost'] as const).map(status => (
            <TabsContent key={status} value={status} className="space-y-4">
              {filterByStatus(status).length === 0 ? (
                <Card>
                  <CardContent className="py-8 text-center text-muted-foreground">
                    No {status} tickets
                  </CardContent>
                </Card>
              ) : (
                filterByStatus(status).map(ticket => (
                  <Card key={ticket.id}>
                    <CardHeader>
                      <div className="flex items-start justify-between">
                        <div>
                          <CardTitle className="text-xl font-semibold">
                            {ticket.dep_icao} → {ticket.arr_icao || 'Any'}
                          </CardTitle>
                          <p className="text-sm text-muted-foreground mt-1">
                            {ticket.req_date && new Date(ticket.req_date).toLocaleDateString()}
                            {ticket.req_time_utc && ` • ${ticket.req_time_utc} UTC`}
                            {ticket.aircraft_category && ` • ${ticket.aircraft_category}`}
                          </p>
                        </div>
                        <Badge variant={
                          status === 'won' ? 'default' :
                          status === 'lost' ? 'destructive' :
                          'secondary'
                        }>
                          {status}
                        </Badge>
                      </div>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="flex gap-4 text-sm text-muted-foreground">
                        <span>✈️ {ticket.shortlist.operators.length} operators</span>
                        <span>🛩️ {ticket.shortlist.tails.length} tails</span>
                      </div>

                      {status === 'open' && (
                        <div className="flex gap-2 flex-wrap">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => updateStatus({ id: ticket.id, status: 'contacted' })}
                          >
                            Mark Contacted
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => updateStatus({ id: ticket.id, status: 'won' })}
                          >
                            Mark Won
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => updateStatus({ id: ticket.id, status: 'lost' })}
                          >
                            Mark Lost
                          </Button>
                        </div>
                      )}

                      {ticket.notes && (
                        <p className="text-sm italic border-l-2 border-muted pl-3">
                          {ticket.notes}
                        </p>
                      )}
                    </CardContent>
                  </Card>
                ))
              )}
            </TabsContent>
          ))}
        </Tabs>
      </div>
    </AppLayout>
  );
}
