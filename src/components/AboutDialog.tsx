import { Info, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

export function AboutDialog() {
  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="ghost" size="sm" className="gap-2">
          <Info className="h-4 w-4" />
          <span className="text-sm">About</span>
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>About Empty Leg Radar</DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4 text-sm">
          {/* What this app does */}
          <div>
            <h3 className="font-medium mb-2">What This App Does</h3>
            <p className="text-muted-foreground">
              Surfaces charter-eligible flights (Part 135) and early empty-leg signals.
            </p>
          </div>

          {/* Disclaimer - highlighted */}
          <div className="bg-amber-50 dark:bg-amber-950 border border-amber-200 dark:border-amber-800 p-4 rounded-lg">
            <h3 className="font-medium mb-2 flex items-center gap-2">
              <AlertCircle className="h-4 w-4 text-amber-600 dark:text-amber-400" />
              Not an Offer
            </h3>
            <p className="text-muted-foreground">
              Informational signals only; availability/prices not guaranteed.
            </p>
          </div>

          {/* Data sources */}
          <div>
            <h3 className="font-medium mb-2">Data Sources</h3>
            <ul className="list-disc list-inside space-y-1 text-muted-foreground">
              <li>FAA registry</li>
              <li>Part 135 certificates</li>
              <li>ADS-B flight data</li>
            </ul>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
