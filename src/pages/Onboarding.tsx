import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Plane } from "lucide-react";
import { toast } from "sonner";

const DEFAULT_AIRPORTS = [
  { code: "KTEB", name: "Teterboro, NJ" },
  { code: "KVNY", name: "Van Nuys, CA" },
  { code: "LFPB", name: "Paris Le Bourget" },
  { code: "KASE", name: "Aspen, CO" },
  { code: "EGGW", name: "London Luton" },
];

export default function Onboarding() {
  const [selectedAirports, setSelectedAirports] = useState<string[]>([]);
  const navigate = useNavigate();

  const handleToggle = (code: string) => {
    setSelectedAirports((prev) =>
      prev.includes(code) ? prev.filter((c) => c !== code) : [...prev, code]
    );
  };

  const handleContinue = () => {
    if (selectedAirports.length === 0) {
      toast.error("Please select at least one airport");
      return;
    }
    toast.success("Setup complete!");
    navigate("/signals");
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-background">
      <div className="w-full max-w-2xl space-y-8 p-8">
        <div className="text-center">
          <div className="mb-4 flex justify-center">
            <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-accent">
              <Plane className="h-6 w-6 text-accent-foreground" />
            </div>
          </div>
          <h1 className="text-2xl font-medium">Welcome to Empty Leg Radar</h1>
          <p className="mt-2 text-sm text-muted-foreground">
            Select 2-3 airports to start monitoring
          </p>
        </div>

        <Card className="p-6">
          <div className="space-y-4">
            {DEFAULT_AIRPORTS.map((airport) => (
              <div
                key={airport.code}
                className="flex items-center space-x-3 rounded-lg border border-border p-4 transition-colors hover:bg-muted/30"
              >
                <Checkbox
                  id={airport.code}
                  checked={selectedAirports.includes(airport.code)}
                  onCheckedChange={() => handleToggle(airport.code)}
                />
                <label
                  htmlFor={airport.code}
                  className="flex-1 cursor-pointer text-sm"
                >
                  <span className="font-medium font-mono">{airport.code}</span>
                  <span className="ml-2 text-muted-foreground">
                    {airport.name}
                  </span>
                </label>
              </div>
            ))}
          </div>
        </Card>

        <div className="flex justify-center">
          <Button
            onClick={handleContinue}
            disabled={selectedAirports.length === 0}
            size="lg"
          >
            Continue to Dashboard
          </Button>
        </div>
      </div>
    </div>
  );
}
