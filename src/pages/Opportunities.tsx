import { AppLayout } from "@/components/layouts/AppLayout";
import { OpportunityCard } from "@/components/opportunities/OpportunityCard";
import { useBrokerFeed } from "@/hooks/supabase/useBrokerFeed";
import { Loader2, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { TooltipProvider } from "@/components/ui/tooltip";

export default function Opportunities() {
  const { data: opportunities, isLoading, error, refetch } = useBrokerFeed();

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
          <Button 
            variant="outline" 
            size="sm" 
            onClick={() => refetch()}
            disabled={isLoading}
          >
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh
          </Button>
        </div>

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
          <div className="text-center py-12 text-muted-foreground">
            No certified flights for your filters.
          </div>
        )}

        {!isLoading && opportunities && opportunities.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {opportunities.map((opp) => (
              <OpportunityCard key={opp.id} opportunity={opp} />
            ))}
          </div>
        )}

        {!isLoading && opportunities && opportunities.length > 0 && (
          <div className="mt-6 text-center text-sm text-muted-foreground">
            Showing {opportunities.length} charter-eligible flight{opportunities.length !== 1 ? 's' : ''}
          </div>
        )}
        </div>
      </TooltipProvider>
    </AppLayout>
  );
}
