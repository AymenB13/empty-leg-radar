import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { Input } from "@/components/ui/input";
import { useUserSettings } from "@/hooks/supabase/useUserSettings";
import { toast } from "sonner";
import { sendToSlack } from "@/lib/signal-utils";

const DEFAULT_AIRPORTS = [
  { code: "KTEB", name: "Teterboro, NJ" },
  { code: "KVNY", name: "Van Nuys, CA" },
  { code: "LFPB", name: "Paris Le Bourget" },
  { code: "KASE", name: "Aspen, CO" },
  { code: "EGGW", name: "London Luton" },
];

export default function Onboarding() {
  const navigate = useNavigate();
  const { createSettings } = useUserSettings();
  const [step, setStep] = useState(1);
  
  const [selectedAirports, setSelectedAirports] = useState<string[]>(["KTEB", "KVNY"]);
  const [probThreshold, setProbThreshold] = useState(0.6);
  const [slackWebhook, setSlackWebhook] = useState("");
  const [testing, setTesting] = useState(false);

  const handleToggle = (code: string) => {
    if (selectedAirports.includes(code)) {
      setSelectedAirports(selectedAirports.filter((c) => c !== code));
    } else {
      setSelectedAirports([...selectedAirports, code]);
    }
  };

  const handleTestSlack = async () => {
    if (!slackWebhook.trim()) {
      toast.error("Enter a webhook URL first");
      return;
    }
    setTesting(true);
    try {
      await sendToSlack(slackWebhook, "🎯 Empty Leg Radar test — you're all set!");
      toast.success("Slack test successful");
    } catch (error) {
      toast.error("Slack test failed — check your webhook URL");
    } finally {
      setTesting(false);
    }
  };

  const handleFinish = () => {
    if (selectedAirports.length < 2) {
      toast.error("Select at least 2 airports");
      return;
    }

    createSettings({
      airports: selectedAirports,
      prob_threshold: probThreshold,
      notify_slack_webhook: slackWebhook.trim() || null,
    });

    navigate("/signals");
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <Card className="w-full max-w-2xl p-8">
        <div className="mb-6">
          <div className="text-sm text-muted-foreground mb-4">Step {step} of 3</div>
        </div>

        {step === 1 && (
          <div>
            <h1 className="text-2xl font-bold mb-2">Pick 2–3 airports to follow</h1>
            <p className="text-sm text-muted-foreground mb-6">
              You'll see signals when jets turn around at these bases.
            </p>

            <div className="space-y-3 mb-6">
              {DEFAULT_AIRPORTS.map((airport) => (
                <div key={airport.code} className="flex items-center space-x-3">
                  <Checkbox
                    id={airport.code}
                    checked={selectedAirports.includes(airport.code)}
                    onCheckedChange={() => handleToggle(airport.code)}
                  />
                  <Label htmlFor={airport.code} className="cursor-pointer flex-1">
                    <span className="font-medium">{airport.code}</span>
                    <span className="text-muted-foreground ml-2">{airport.name}</span>
                  </Label>
                </div>
              ))}
            </div>

            <div className="text-sm text-muted-foreground mb-4">
              Selected: {selectedAirports.length} airport{selectedAirports.length !== 1 ? "s" : ""}
            </div>

            <Button 
              onClick={() => setStep(2)} 
              className="w-full"
              disabled={selectedAirports.length < 2}
            >
              Next
            </Button>
          </div>
        )}

        {step === 2 && (
          <div>
            <h1 className="text-2xl font-bold mb-2">Set your signal threshold</h1>
            <p className="text-sm text-muted-foreground mb-6">
              Higher = fewer but stronger signals.
            </p>

            <div className="mb-6">
              <div className="flex items-center justify-between mb-4">
                <Label>Probability Threshold</Label>
                <span className="text-2xl font-bold">{(probThreshold * 100).toFixed(0)}%</span>
              </div>
              <Slider
                value={[probThreshold * 100]}
                onValueChange={(values) => setProbThreshold(values[0] / 100)}
                min={40}
                max={95}
                step={5}
                className="mb-2"
              />
              <div className="flex justify-between text-xs text-muted-foreground">
                <span>40%</span>
                <span className="text-foreground">Recommended: 60–80%</span>
                <span>95%</span>
              </div>
            </div>

            <div className="flex gap-3">
              <Button onClick={() => setStep(1)} variant="outline" className="flex-1">
                Back
              </Button>
              <Button onClick={() => setStep(3)} className="flex-1">
                Next
              </Button>
            </div>
          </div>
        )}

        {step === 3 && (
          <div>
            <h1 className="text-2xl font-bold mb-2">Get notified via Slack (optional)</h1>
            <p className="text-sm text-muted-foreground mb-6">
              Real-time alerts for high-probability signals.
            </p>

            <div className="mb-6">
              <Label htmlFor="webhook">Slack Incoming Webhook URL</Label>
              <div className="flex gap-2 mt-2">
                <Input
                  id="webhook"
                  type="url"
                  placeholder="https://hooks.slack.com/services/..."
                  value={slackWebhook}
                  onChange={(e) => setSlackWebhook(e.target.value)}
                  className="flex-1"
                />
                <Button 
                  onClick={handleTestSlack} 
                  variant="outline"
                  disabled={!slackWebhook.trim() || testing}
                >
                  {testing ? "Testing..." : "Test"}
                </Button>
              </div>
            </div>

            <div className="flex gap-3">
              <Button onClick={() => setStep(2)} variant="outline" className="flex-1">
                Back
              </Button>
              <Button onClick={handleFinish} variant="outline" className="flex-1">
                Skip
              </Button>
              <Button onClick={handleFinish} className="flex-1">
                Finish
              </Button>
            </div>
          </div>
        )}
      </Card>
    </div>
  );
}
