import { AppLayout } from "@/components/layouts/AppLayout";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { Tooltip, TooltipContent, TooltipTrigger, TooltipProvider } from "@/components/ui/tooltip";
import { Download, RefreshCw, Mail, UserPlus } from "lucide-react";
import { useState, useMemo } from "react";
import { useProspectByAirport } from "@/hooks/supabase/useProspectByAirport";
import { useProspectByCorridor } from "@/hooks/supabase/useProspectByCorridor";
import { useOperatorContacts } from "@/hooks/supabase/useOperatorContacts";
import { ContactDrawer } from "@/components/prospect/ContactDrawer";
import { ContactModal } from "@/components/prospect/ContactModal";
import { EmailTemplateDrawer } from "@/components/prospect/EmailTemplateDrawer";
import { exportToCSV } from "@/lib/signal-utils";
import { formatDistanceToNow } from "date-fns";

export default function Prospect() {
  const [selectedAirport, setSelectedAirport] = useState("");
  const [minDeps, setMinDeps] = useState(3);
  const [depIcao, setDepIcao] = useState("");
  const [arrIcao, setArrIcao] = useState("");
  const [minFlights, setMinFlights] = useState(2);
  const [contactDrawerOpen, setContactDrawerOpen] = useState(false);
  const [contactModalOpen, setContactModalOpen] = useState(false);
  const [emailDrawerOpen, setEmailDrawerOpen] = useState(false);
  const [selectedOperator, setSelectedOperator] = useState<any>(null);
  const [emailTemplate, setEmailTemplate] = useState("");

  const { data: airportData, isLoading: loadingAirport, refetch: refetchAirport } = 
    useProspectByAirport(selectedAirport, minDeps);
  const { data: corridorData, isLoading: loadingCorridor, refetch: refetchCorridor } = 
    useProspectByCorridor(depIcao, arrIcao, minFlights);
  const { data: contacts } = useOperatorContacts();

  const availableAirports = useMemo(() => {
    return ["KTEB", "KVNY", "KASE", "KDAL", "KOPF", "KSDL"].sort();
  }, []);

  const formatPercent = (value: number | null) => {
    if (value === null) return "—";
    return `${(value * 100).toFixed(0)}%`;
  };

  const formatNumber = (value: number | null) => {
    if (value === null) return "—";
    return value.toLocaleString();
  };

  const formatRelativeTime = (timestamp: string | null) => {
    if (!timestamp) return "—";
    return formatDistanceToNow(new Date(timestamp), { addSuffix: true });
  };

  const getContact = (operatorName: string) => {
    return contacts?.find(c => c.operator_name === operatorName);
  };

  const generateAirportEmailTemplate = (row: any) => {
    return `Subject: Filling short-notice gaps at ${selectedAirport}

Hi ${row.operator_primary},

I work with public flight patterns to spot short turns and likely RTB windows at ${selectedAirport}.

Over the last 30 days, you departed ${row.dep_pairs_30d} time(s) from ${selectedAirport}, with a ${formatPercent(row.short_turn_rate)} short-turn rate (P95 turn ${Math.round(row.p95_turn_mins || 0)} min).

I can pre-qualify requests on ${selectedAirport} when the window appears (typically 20–120 min before ETD) and only send relevant leads.

Interested in a 2-week free trial on ${selectedAirport}? Who's the best ops/sales contact to sync a simple workflow?

Thanks,
[Your name]`;
  };

  const generateCorridorEmailTemplate = (row: any) => {
    return `Subject: Filling ${row.dep_icao} → ${row.arr_icao} on short notice

Hi ${row.operator_primary},

Based on public patterns, ${row.operator_primary} flew ${row.flights_30d} time(s) on ${row.dep_icao}→${row.arr_icao} in the last 30 days (short-turn rate ${formatPercent(row.short_turn_rate)}, fill score ${(row.fill_score || 0).toFixed(2)}).

I can surface qualified last-minute requests for that corridor when the window appears, so you're not chasing noise.

Open to a quick 10-min chat and a 2-week free trial on ${row.dep_icao}/${row.arr_icao}?

Thanks,
[Your name]`;
  };

  return (
    <AppLayout>
      <TooltipProvider>
        <div className="space-y-6">
          <div>
            <h1 className="text-2xl font-medium">Prospect</h1>
            <p className="text-sm text-muted-foreground mt-1">
              Prioritize which operators to call, by airport or corridor.
            </p>
          </div>

          <Tabs defaultValue="airport" className="space-y-6">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="airport">By Airport</TabsTrigger>
              <TabsTrigger value="corridor">By Corridor</TabsTrigger>
            </TabsList>

            <TabsContent value="airport" className="space-y-4">
              <Card className="p-4">
                <div className="flex flex-wrap gap-4 items-end">
                  <div className="flex-1 min-w-[200px] space-y-2">
                    <label className="text-xs font-medium text-muted-foreground">Airport (ICAO)</label>
                    <Select value={selectedAirport} onValueChange={setSelectedAirport}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select airport" />
                      </SelectTrigger>
                      <SelectContent>
                        {availableAirports.map(icao => (
                          <SelectItem key={icao} value={icao}>{icao}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="flex-1 min-w-[150px] space-y-2">
                    <label className="text-xs font-medium text-muted-foreground">Min departures (30d)</label>
                    <Input
                      type="number"
                      value={minDeps}
                      onChange={(e) => setMinDeps(parseInt(e.target.value) || 3)}
                      min={1}
                    />
                  </div>

                  <Button variant="outline" onClick={() => refetchAirport()} disabled={!selectedAirport}>
                    <RefreshCw className="h-4 w-4 mr-2" />
                    Refresh
                  </Button>

                  <Button
                    variant="outline"
                    onClick={() => airportData && exportToCSV(airportData, `prospect-airport-${selectedAirport}.csv`)}
                    disabled={!airportData || airportData.length === 0}
                  >
                    <Download className="h-4 w-4 mr-2" />
                    Export CSV
                  </Button>
                </div>
              </Card>

              {loadingAirport ? (
                <Card className="p-6">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <Skeleton key={i} className="h-12 mb-2" />
                  ))}
                </Card>
              ) : !selectedAirport ? (
                <Card className="p-12 text-center">
                  <p className="text-lg font-medium text-muted-foreground mb-2">
                    Select an airport to begin
                  </p>
                  <p className="text-sm text-muted-foreground mb-4">
                    Common starter airports:
                  </p>
                  <div className="flex gap-2 justify-center flex-wrap">
                    {["KTEB", "KVNY", "KDAL", "KOPF", "KSDL"].map(icao => (
                      <Badge
                        key={icao}
                        variant="outline"
                        className="cursor-pointer hover:bg-secondary"
                        onClick={() => setSelectedAirport(icao)}
                      >
                        {icao}
                      </Badge>
                    ))}
                  </div>
                </Card>
              ) : airportData?.length === 0 ? (
                <Card className="p-12 text-center">
                  <p className="text-lg font-medium text-muted-foreground mb-2">
                    No operator activity found
                  </p>
                  <p className="text-sm text-muted-foreground">
                    Try another airport or reduce the minimum departures filter.
                  </p>
                </Card>
              ) : (
                <Card className="overflow-hidden">
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead className="border-b bg-muted/30">
                        <tr>
                          <th className="px-4 py-3 text-left text-sm font-medium">Operator</th>
                          <th className="px-4 py-3 text-left text-sm font-medium">Departures (30d)</th>
                          <th className="px-4 py-3 text-left text-sm font-medium">Short-turn rate</th>
                          <th className="px-4 py-3 text-left text-sm font-medium">P95 turn</th>
                          <th className="px-4 py-3 text-left text-sm font-medium">Last seen</th>
                          <th className="px-4 py-3 text-left text-sm font-medium">Actions</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y">
                        {airportData?.map((row, idx) => {
                          const contact = getContact(row.operator_primary!);
                          return (
                            <tr key={idx} className="hover:bg-muted/20">
                              <td className="px-4 py-3">
                                <button
                                  className="font-medium hover:underline text-left"
                                  onClick={() => {
                                    if (contact) {
                                      setSelectedOperator(contact);
                                      setContactDrawerOpen(true);
                                    } else {
                                      setSelectedOperator({ operator_name: row.operator_primary });
                                      setContactModalOpen(true);
                                    }
                                  }}
                                >
                                  {row.operator_primary}
                                </button>
                              </td>
                              <td className="px-4 py-3">{formatNumber(row.dep_pairs_30d)}</td>
                              <td className="px-4 py-3">
                                <Badge variant="secondary">{formatPercent(row.short_turn_rate)}</Badge>
                              </td>
                              <td className="px-4 py-3">{Math.round(row.p95_turn_mins || 0)} min</td>
                              <td className="px-4 py-3 text-xs text-muted-foreground">
                                <Tooltip>
                                  <TooltipTrigger>{formatRelativeTime(row.last_seen)}</TooltipTrigger>
                                  <TooltipContent>{row.last_seen}</TooltipContent>
                                </Tooltip>
                              </td>
                              <td className="px-4 py-3">
                                <div className="flex gap-2">
                                  <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => {
                                      setEmailTemplate(generateAirportEmailTemplate(row));
                                      setEmailDrawerOpen(true);
                                    }}
                                  >
                                    <Mail className="h-4 w-4 mr-1" />
                                    Email
                                  </Button>
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => {
                                      setSelectedOperator(contact || { operator_name: row.operator_primary });
                                      setContactModalOpen(true);
                                    }}
                                  >
                                    <UserPlus className="h-4 w-4" />
                                  </Button>
                                </div>
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                </Card>
              )}
            </TabsContent>

            <TabsContent value="corridor" className="space-y-4">
              <Card className="p-4">
                <div className="flex flex-wrap gap-4 items-end">
                  <div className="flex-1 min-w-[150px] space-y-2">
                    <label className="text-xs font-medium text-muted-foreground">DEP (ICAO)</label>
                    <Input
                      value={depIcao}
                      onChange={(e) => setDepIcao(e.target.value.toUpperCase())}
                      placeholder="KVNY"
                      maxLength={4}
                    />
                  </div>

                  <div className="flex-1 min-w-[150px] space-y-2">
                    <label className="text-xs font-medium text-muted-foreground">ARR (ICAO) – optional</label>
                    <Input
                      value={arrIcao}
                      onChange={(e) => setArrIcao(e.target.value.toUpperCase())}
                      placeholder="KTEB"
                      maxLength={4}
                    />
                  </div>

                  <div className="flex-1 min-w-[150px] space-y-2">
                    <label className="text-xs font-medium text-muted-foreground">Min flights (30d)</label>
                    <Input
                      type="number"
                      value={minFlights}
                      onChange={(e) => setMinFlights(parseInt(e.target.value) || 2)}
                      min={1}
                    />
                  </div>

                  <Button variant="outline" onClick={() => refetchCorridor()} disabled={!depIcao}>
                    <RefreshCw className="h-4 w-4 mr-2" />
                    Refresh
                  </Button>

                  <Button
                    variant="outline"
                    onClick={() => corridorData && exportToCSV(corridorData, `prospect-corridor-${depIcao}-${arrIcao || "all"}.csv`)}
                    disabled={!corridorData || corridorData.length === 0}
                  >
                    <Download className="h-4 w-4 mr-2" />
                    Export CSV
                  </Button>
                </div>
              </Card>

              {loadingCorridor ? (
                <Card className="p-6">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <Skeleton key={i} className="h-12 mb-2" />
                  ))}
                </Card>
              ) : !depIcao ? (
                <Card className="p-12 text-center">
                  <p className="text-lg font-medium text-muted-foreground">
                    Enter a departure airport to begin
                  </p>
                </Card>
              ) : corridorData?.length === 0 ? (
                <Card className="p-12 text-center">
                  <p className="text-lg font-medium text-muted-foreground mb-2">
                    No corridor activity found
                  </p>
                  <p className="text-sm text-muted-foreground">
                    Try removing ARR or lowering the minimum flights filter.
                  </p>
                </Card>
              ) : (
                <Card className="overflow-hidden">
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead className="border-b bg-muted/30">
                        <tr>
                          <th className="px-4 py-3 text-left text-sm font-medium">Operator</th>
                          <th className="px-4 py-3 text-left text-sm font-medium">Corridor</th>
                          <th className="px-4 py-3 text-left text-sm font-medium">Flights (30d)</th>
                          <th className="px-4 py-3 text-left text-sm font-medium">Short-turn rate</th>
                          <th className="px-4 py-3 text-left text-sm font-medium">Fill score</th>
                          <th className="px-4 py-3 text-left text-sm font-medium">Last seen</th>
                          <th className="px-4 py-3 text-left text-sm font-medium">Actions</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y">
                        {corridorData?.map((row, idx) => {
                          const contact = getContact(row.operator_primary!);
                          return (
                            <tr key={idx} className="hover:bg-muted/20">
                              <td className="px-4 py-3">
                                <button
                                  className="font-medium hover:underline text-left"
                                  onClick={() => {
                                    if (contact) {
                                      setSelectedOperator(contact);
                                      setContactDrawerOpen(true);
                                    } else {
                                      setSelectedOperator({ operator_name: row.operator_primary });
                                      setContactModalOpen(true);
                                    }
                                  }}
                                >
                                  {row.operator_primary}
                                </button>
                              </td>
                              <td className="px-4 py-3">
                                <code className="text-xs">{row.dep_icao} → {row.arr_icao}</code>
                              </td>
                              <td className="px-4 py-3">{formatNumber(row.flights_30d)}</td>
                              <td className="px-4 py-3">
                                <Badge variant="secondary">{formatPercent(row.short_turn_rate)}</Badge>
                              </td>
                              <td className="px-4 py-3">
                                <Tooltip>
                                  <TooltipTrigger>
                                    {(row.fill_score || 0).toFixed(2)}
                                  </TooltipTrigger>
                                  <TooltipContent>freq × short-turn × recency</TooltipContent>
                                </Tooltip>
                              </td>
                              <td className="px-4 py-3 text-xs text-muted-foreground">
                                <Tooltip>
                                  <TooltipTrigger>{formatRelativeTime(row.last_seen)}</TooltipTrigger>
                                  <TooltipContent>{row.last_seen}</TooltipContent>
                                </Tooltip>
                              </td>
                              <td className="px-4 py-3">
                                <div className="flex gap-2">
                                  <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => {
                                      setEmailTemplate(generateCorridorEmailTemplate(row));
                                      setEmailDrawerOpen(true);
                                    }}
                                  >
                                    <Mail className="h-4 w-4 mr-1" />
                                    Email
                                  </Button>
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => {
                                      setSelectedOperator(contact || { operator_name: row.operator_primary });
                                      setContactModalOpen(true);
                                    }}
                                  >
                                    <UserPlus className="h-4 w-4" />
                                  </Button>
                                </div>
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                </Card>
              )}
            </TabsContent>
          </Tabs>

          <ContactDrawer
            open={contactDrawerOpen}
            onOpenChange={setContactDrawerOpen}
            contact={selectedOperator}
            onEdit={() => {
              setContactDrawerOpen(false);
              setContactModalOpen(true);
            }}
          />

          <ContactModal
            open={contactModalOpen}
            onOpenChange={setContactModalOpen}
            contact={selectedOperator?.id ? selectedOperator : null}
            prefillOperatorName={selectedOperator?.operator_name}
          />

          <EmailTemplateDrawer
            open={emailDrawerOpen}
            onOpenChange={setEmailDrawerOpen}
            template={emailTemplate}
          />
        </div>
      </TooltipProvider>
    </AppLayout>
  );
}
