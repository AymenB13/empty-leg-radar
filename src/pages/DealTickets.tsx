import { useDealTickets, useUpdateDealTicketStatus } from "@/hooks/supabase/useDealTickets";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";

import { AppLayout } from "@/components/layouts/AppLayout";
import { Loader2, Copy } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

export default function DealTickets() {
  const { data: tickets, isLoading } = useDealTickets();
  const { mutate: updateStatus } = useUpdateDealTicketStatus();
  const [editingNotes, setEditingNotes] = useState<{[key: string]: string}>({});

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
                      {/* Operators Section */}
                      {ticket.shortlist.operators.length > 0 && (
                        <div className="space-y-3">
                          <h4 className="font-semibold text-sm">Operators ({ticket.shortlist.operators.length})</h4>
                          {ticket.shortlist.operators.map((op, idx) => (
                            <Card key={idx} className="bg-muted/30">
                              <CardContent className="p-4 space-y-2">
                                <div className="flex justify-between items-start">
                                  <div>
                                    <p className="font-semibold">{op.name}</p>
                                    <p className="text-xs text-muted-foreground">{op.reason}</p>
                                  </div>
                                  <Badge variant="outline">Score: {op.score.toFixed(1)}</Badge>
                                </div>
                                
                                {op.contact && (
                                  <div className="flex gap-3 text-xs flex-wrap">
                                    {op.contact.phone && (
                                      <a href={`tel:${op.contact.phone}`} className="text-primary hover:underline">
                                        📞 {op.contact.phone}
                                      </a>
                                    )}
                                    {op.contact.email && (
                                      <a href={`mailto:${op.contact.email}`} className="text-primary hover:underline">
                                        ✉️ {op.contact.email}
                                      </a>
                                    )}
                                    {op.contact.website && (
                                      <a href={op.contact.website} target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">
                                        🌐 Website
                                      </a>
                                    )}
                                  </div>
                                )}
                              </CardContent>
                            </Card>
                          ))}
                        </div>
                      )}

                      {/* Tails Section */}
                      {ticket.shortlist.tails.length > 0 && (
                        <div className="space-y-3">
                          <h4 className="font-semibold text-sm">Tails ({ticket.shortlist.tails.length})</h4>
                          {ticket.shortlist.tails.map((tail, idx) => (
                            <Card key={idx} className="bg-muted/30">
                              <CardContent className="p-4 space-y-1 text-sm">
                                <div className="flex justify-between items-center">
                                  <p className="font-semibold">{tail.n_number}</p>
                                  <Button
                                    size="sm"
                                    variant="ghost"
                                    onClick={() => {
                                      navigator.clipboard.writeText(tail.n_number);
                                      toast.success("N-number copied!");
                                    }}
                                  >
                                    <Copy className="h-3 w-3" />
                                  </Button>
                                </div>
                                <p className="text-xs text-muted-foreground">
                                  {tail.model} • {tail.operator}
                                </p>
                                <p className="text-xs text-muted-foreground">
                                  Base: {tail.base} • Last seen: {new Date(tail.last_seen).toLocaleDateString()}
                                </p>
                                <p className="text-xs text-muted-foreground italic">{tail.reason}</p>
                                {tail.habits && (
                                  <div className="flex gap-3 text-xs text-muted-foreground pt-1">
                                    <span>RTB: {(tail.habits.rtb_rate * 100).toFixed(0)}%</span>
                                    <span>Short turns: {(tail.habits.short_turn_rate * 100).toFixed(0)}%</span>
                                  </div>
                                )}
                              </CardContent>
                            </Card>
                          ))}
                        </div>
                      )}

                      {/* Notes Section */}
                      <div className="space-y-2">
                        <label className="text-sm font-semibold">Notes</label>
                        <Textarea
                          value={editingNotes[ticket.id] ?? ticket.notes ?? ''}
                          onChange={(e) => setEditingNotes({...editingNotes, [ticket.id]: e.target.value})}
                          placeholder="Add notes about this deal..."
                          rows={3}
                        />
                        {(editingNotes[ticket.id] !== undefined || ticket.notes) && (
                          <Button
                            size="sm"
                            onClick={() => {
                              updateStatus({ 
                                id: ticket.id, 
                                status: ticket.status, 
                                notes: editingNotes[ticket.id] ?? ticket.notes ?? ''
                              });
                              const newEditingNotes = {...editingNotes};
                              delete newEditingNotes[ticket.id];
                              setEditingNotes(newEditingNotes);
                            }}
                          >
                            Save Notes
                          </Button>
                        )}
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
