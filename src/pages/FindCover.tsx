import { useState } from "react";
import { AppLayout } from "@/components/layouts/AppLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { supabase } from "@/integrations/supabase/client";
import { Loader2, Search, Copy, Phone, Save } from "lucide-react";
import { toast } from "sonner";
import { FindCoverOperator, FindCoverTail } from "@/types/database";
import { useCreateDealTicket } from "@/hooks/supabase/useDealTickets";

interface FindCoverResults {
  operators: FindCoverOperator[];
  tails: FindCoverTail[];
  message?: string;
}

export default function FindCover() {
  const [dep, setDep] = useState("");
  const [arr, setArr] = useState("");
  const [date, setDate] = useState("");
  const [time, setTime] = useState("");
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState<FindCoverResults | null>(null);

  const { mutate: createDealTicket, isPending: savingTicket } = useCreateDealTicket();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!dep) return;

    setLoading(true);
    setResults(null);

    try {
      const { data, error } = await supabase.functions.invoke('find-cover', {
        body: {
          dep_icao: dep.toUpperCase(),
          arr_icao: arr ? arr.toUpperCase() : undefined,
          request_date: date || undefined,
          request_time_utc: time || undefined,
        },
      });

      if (error) throw error;
      setResults(data);
    } catch (error: any) {
      console.error('Error finding cover:', error);
      toast.error(`Failed to find cover: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  const copyPitch = (text: string, variant: string) => {
    navigator.clipboard.writeText(text);
    toast.success(`${variant} pitch copied to clipboard!`);
  };

  const handleSaveDealTicket = () => {
    if (!results || !dep) return;

    createDealTicket({
      dep_icao: dep.toUpperCase(),
      arr_icao: arr ? arr.toUpperCase() : undefined,
      req_date: date || undefined,
      req_time_utc: time || undefined,
      shortlist: {
        operators: results.operators,
        tails: results.tails,
      },
    });
  };

  return (
    <AppLayout>
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header + Form inline */}
        <div className="flex flex-col lg:flex-row items-start justify-between gap-6">
          <div>
            <h1 className="text-3xl font-bold">Instant Cover</h1>
            <p className="text-muted-foreground mt-1">
              Find operators & tails for any corridor in seconds
            </p>
          </div>

          {/* Compact form */}
          <form onSubmit={handleSubmit} className="flex flex-wrap gap-2 items-end">
            <div>
              <label className="text-xs font-medium">DEP</label>
              <Input
                value={dep}
                onChange={(e) => setDep(e.target.value)}
                className="w-20 uppercase"
                maxLength={4}
                required
                placeholder="ICAO"
              />
            </div>
            <div>
              <label className="text-xs font-medium">ARR</label>
              <Input
                value={arr}
                onChange={(e) => setArr(e.target.value)}
                className="w-20 uppercase"
                maxLength={4}
                placeholder="Any"
              />
            </div>
            <div>
              <label className="text-xs font-medium">Date</label>
              <Input
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="w-36"
              />
            </div>
            <div>
              <label className="text-xs font-medium">Time (UTC)</label>
              <Input
                type="time"
                value={time}
                onChange={(e) => setTime(e.target.value)}
                className="w-28"
              />
            </div>
            <Button type="submit" disabled={loading}>
              {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Search className="h-4 w-4" />}
              <span className="ml-2">Search</span>
            </Button>
          </form>
        </div>

        {/* Results */}
        {results && (
          <>
            {results.message && (
              <Card className="border-dashed">
                <CardContent className="py-8 text-center text-muted-foreground">
                  <p>{results.message}</p>
                </CardContent>
              </Card>
            )}

            {/* Operators Section */}
            {results.operators.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center justify-between">
                    <span>Operators ({results.operators.length})</span>
                    <Badge variant="outline">Top {results.operators.length}</Badge>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {results.operators.map((op, idx) => (
                      <div key={idx} className="border-b pb-4 last:border-0">
                        {/* Header with score */}
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <div className="flex items-center gap-2">
                              <span className="font-medium">{op.name}</span>
                              <Badge variant="secondary">Score: {(op.score * 100).toFixed(0)}</Badge>
                            </div>
                            <p className="text-sm text-muted-foreground mt-1">{op.reason}</p>
                          </div>
                        </div>

                        {/* Stats row */}
                        <div className="flex gap-4 mt-2 text-xs text-muted-foreground">
                          <span>✈️ {op.flights_90d} flights/90d</span>
                          {op.median_block_mins > 0 && (
                            <span>⏱️ {op.median_block_mins}m median</span>
                          )}
                        </div>

                        {/* Contact info */}
                        {op.contact && (
                          <div className="flex gap-4 mt-2 text-sm flex-wrap">
                            {op.contact.phone && (
                              <a href={`tel:${op.contact.phone}`} className="text-primary hover:underline">
                                📞 {op.contact.phone}
                              </a>
                            )}
                            {op.contact.email && (
                              <a href={`mailto:${op.contact.email}`} className="text-primary hover:underline">
                                📧 {op.contact.email}
                              </a>
                            )}
                            {op.contact.website && (
                              <a href={op.contact.website} target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">
                                🌐 Website
                              </a>
                            )}
                          </div>
                        )}

                        {/* Actions */}
                        <div className="flex gap-2 mt-3 flex-wrap">
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button size="sm" variant="outline">
                                <Copy className="h-4 w-4 mr-1" />
                                Copy Pitch
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent>
                              <DropdownMenuItem onClick={() => copyPitch(op.pitches.short, 'Short')}>
                                Short (WhatsApp)
                              </DropdownMenuItem>
                              <DropdownMenuItem onClick={() => copyPitch(op.pitches.neutral, 'Neutral')}>
                                Neutral (Email)
                              </DropdownMenuItem>
                              <DropdownMenuItem onClick={() => copyPitch(op.pitches.urgent, 'Urgent')}>
                                Urgent
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>

                          {op.contact?.phone && (
                            <Button size="sm" variant="ghost" asChild>
                              <a href={`tel:${op.contact.phone}`}>
                                <Phone className="h-4 w-4 mr-1" />
                                Call
                              </a>
                            </Button>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Tails Section */}
            {results.tails.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle>Aircraft Tails ({results.tails.length})</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {results.tails.map((tail, idx) => (
                      <div key={idx} className="border-b pb-3 last:border-0">
                        <div className="flex items-start justify-between gap-4">
                          <div className="flex-1">
                            <div className="font-medium font-mono">{tail.n_number}</div>
                            <div className="text-sm text-muted-foreground">
                              {tail.model} • {tail.operator}
                            </div>
                            <div className="text-xs text-muted-foreground mt-1">
                              {tail.reason}
                            </div>
                            <div className="text-xs text-muted-foreground">
                              Last seen: {new Date(tail.last_seen).toLocaleDateString()}
                              {tail.habits && (
                                <span className="ml-2">
                                  • RTB rate: {(tail.habits.rtb_rate * 100).toFixed(0)}%
                                  • Short-turn: {(tail.habits.short_turn_rate * 100).toFixed(0)}%
                                </span>
                              )}
                            </div>
                          </div>
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => {
                              navigator.clipboard.writeText(tail.n_number);
                              toast.success(`Copied ${tail.n_number}`);
                            }}
                          >
                            <Copy className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Save Deal Ticket CTA */}
            {results.operators.length > 0 && (
              <div className="sticky bottom-6 flex justify-center">
                <Button size="lg" onClick={handleSaveDealTicket} disabled={savingTicket} className="shadow-lg">
                  {savingTicket ? <Loader2 className="mr-2 h-5 w-5 animate-spin" /> : <Save className="mr-2 h-5 w-5" />}
                  Save Deal Ticket
                </Button>
              </div>
            )}
          </>
        )}
      </div>
    </AppLayout>
  );
}
