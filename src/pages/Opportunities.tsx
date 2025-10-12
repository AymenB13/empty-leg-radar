import { AppLayout } from "@/components/layouts/AppLayout";
import { OpportunityCard } from "@/components/opportunities/OpportunityCard";
import { useBrokerFeed } from "@/hooks/supabase/useBrokerFeed";
import { Loader2, HelpCircle, ChevronDown, Plane, Calendar, Building2, Shield, BookOpen, AlertCircle, Clock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { TooltipProvider } from "@/components/ui/tooltip";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { useState } from "react";

export default function Opportunities() {
  const { data: opportunities, isLoading, error } = useBrokerFeed();
  const [showHelp, setShowHelp] = useState(false);
  const [showGlossary, setShowGlossary] = useState(false);

  return (
    <AppLayout>
      <TooltipProvider>
        <div className="max-w-7xl mx-auto">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-3xl font-bold">Opportunities</h1>
            <p className="text-muted-foreground mt-1">
              Certified Part 135 flights (next 72h). Not necessarily empty.
            </p>
          </div>
          <Popover open={showGlossary} onOpenChange={setShowGlossary}>
            <PopoverTrigger asChild>
              <Button variant="ghost" size="sm">
                <BookOpen className="h-4 w-4 mr-2" />
                Glossary
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-80">
              <div className="space-y-3">
                <h4 className="font-semibold text-sm">Mini Glossary</h4>
                <div className="space-y-2 text-xs">
                  <div>
                    <p className="font-medium">Part 135</p>
                    <p className="text-muted-foreground">US certificate authorizing on-demand charter.</p>
                  </div>
                  <div>
                    <p className="font-medium">Empty leg</p>
                    <p className="text-muted-foreground">Repositioning/empty segment likely sellable.</p>
                  </div>
                  <div>
                    <p className="font-medium">Heads-up</p>
                    <p className="text-muted-foreground">Early signal triggered by operational patterns.</p>
                  </div>
                  <div>
                    <p className="font-medium">De-dup (tail×minute)</p>
                    <p className="text-muted-foreground">Prevent alert spam for the same aircraft/time.</p>
                  </div>
                </div>
              </div>
            </PopoverContent>
          </Popover>
        </div>

        <Collapsible open={showHelp} onOpenChange={setShowHelp} className="mb-6">
          <CollapsibleTrigger asChild>
            <Button variant="ghost" size="sm" className="w-full justify-center">
              <HelpCircle className="h-4 w-4 mr-2" />
              What am I looking at?
              <ChevronDown className={`h-4 w-4 ml-2 transition-transform ${showHelp ? 'rotate-180' : ''}`} />
            </Button>
          </CollapsibleTrigger>
          <CollapsibleContent>
            <Card className="bg-muted/50 mt-3">
              <CardContent className="pt-6 space-y-4 text-sm">
                
                {/* Section 1: What you're seeing */}
                <div>
                  <h4 className="font-medium mb-2">What You're Seeing</h4>
                  <ul className="space-y-1 text-muted-foreground">
                    <li>• Certified Part 135 flights in the next 72h.</li>
                    <li>• Not necessarily empty; this is your qualified hunting ground.</li>
                  </ul>
                </div>

                {/* Section 2: Each card shows */}
                <div>
                  <h4 className="font-medium mb-2">Each Card Shows</h4>
                  <ul className="space-y-2 text-muted-foreground">
                    <li className="flex items-start gap-2">
                      <Plane className="h-4 w-4 mt-0.5 flex-shrink-0" />
                      <span><strong>Route:</strong> DEP → ARR (airport ICAO)</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <Calendar className="h-4 w-4 mt-0.5 flex-shrink-0" />
                      <span><strong>ETD (UTC):</strong> estimated departure time</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <Plane className="h-4 w-4 mt-0.5 flex-shrink-0" />
                      <span><strong>Aircraft model:</strong> as reported in flight data</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <Building2 className="h-4 w-4 mt-0.5 flex-shrink-0" />
                      <span><strong>Tail (N-number) and Operator:</strong> Part 135 certificate holder</span>
                    </li>
                  </ul>
                </div>

                {/* Section 3: Badge Legend */}
                <div className="bg-blue-50 dark:bg-blue-950 border border-blue-200 dark:border-blue-800 p-3 rounded-lg">
                  <h4 className="font-medium mb-2 flex items-center gap-2">
                    <Shield className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                    Badge Legend
                  </h4>
                  <div className="space-y-2 text-muted-foreground">
                    <div className="flex items-center gap-2">
                      <Badge className="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-100 text-xs">
                        <Shield className="h-3 w-3 mr-1" />
                        Part 135
                      </Badge>
                      <span className="text-xs">US charter-eligible.</span>
                    </div>
                    <p className="text-xs">• <strong>Non-US (grey):</strong> (optional later) needs EASA/AOC module to qualify.</p>
                    <p className="text-xs">• <strong>Not eligible:</strong> No Part 135/AOC match.</p>
                  </div>
                </div>

                {/* Section 4: Common Edge Cases */}
                <Alert>
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>
                    <h4 className="font-medium mb-2 text-sm">Common Edge Cases</h4>
                    <ul className="space-y-1 text-xs text-muted-foreground">
                      <li>• <strong>Missing tail:</strong> We fallback via Mode-S (ICAO24) and timing.</li>
                      <li>• <strong>Different names:</strong> Owner (FAA) ≠ operator (Part 135) is normal.</li>
                      <li>• <strong>Cargo / Part 121:</strong> May appear in Opportunities but won't get a Part 135 badge.</li>
                    </ul>
                  </AlertDescription>
                </Alert>

              </CardContent>
            </Card>
          </CollapsibleContent>
        </Collapsible>

        {isLoading && (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
          </div>
        )}

        {error && (
          <div className="bg-destructive/10 text-destructive px-4 py-3 rounded-lg">
            Error loading opportunities: {error.message}
          </div>
        )}

        {!isLoading && !error && opportunities?.length === 0 && (
          <Card className="p-12">
            <div className="text-center">
              <p className="text-lg font-medium text-muted-foreground mb-2">
                No certified flights for your filters.
              </p>
              <p className="text-sm text-muted-foreground">
                Expand time window or airports in Settings.
              </p>
            </div>
          </Card>
        )}

        {!isLoading && opportunities && opportunities.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {opportunities.map((opp) => (
              <OpportunityCard key={opp.id} opportunity={opp} />
            ))}
          </div>
        )}

        {!isLoading && opportunities && opportunities.length > 0 && (
          <>
            <div className="mt-6 text-center text-sm text-muted-foreground">
              Showing {opportunities.length} charter-eligible flight{opportunities.length !== 1 ? 's' : ''}
            </div>
            
            {/* Data Freshness Footer */}
            <div className="mt-4 flex items-start gap-3 p-3 bg-muted/30 rounded-lg border">
              <Clock className="h-4 w-4 text-muted-foreground mt-0.5 flex-shrink-0" />
              <div className="space-y-1">
                <p className="text-xs text-muted-foreground">
                  <strong>Updated continuously;</strong> materialized views refresh server-side.
                </p>
                <p className="text-xs text-muted-foreground">
                  Flight status and routings can change without notice.
                </p>
              </div>
            </div>
          </>
        )}
        </div>
      </TooltipProvider>
    </AppLayout>
  );
}
