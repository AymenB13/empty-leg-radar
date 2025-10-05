import { AppLayout } from "@/components/layouts/AppLayout";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { Badge } from "@/components/ui/badge";
import { useUserSettings } from "@/hooks/supabase/useUserSettings";
import { useState, useEffect } from "react";
import { X } from "lucide-react";

export default function Settings() {
  const { settings, isLoading, updateSettings, createSettings } = useUserSettings();
  const [airports, setAirports] = useState<string[]>([]);
  const [newAirport, setNewAirport] = useState("");
  const [probThreshold, setProbThreshold] = useState(0.6);
  const [slackWebhook, setSlackWebhook] = useState("");
  const [email, setEmail] = useState("");
  const [timezone, setTimezone] = useState("UTC");

  useEffect(() => {
    if (settings) {
      setAirports(settings.airports || []);
      setProbThreshold(settings.prob_threshold || 0.6);
      setSlackWebhook(settings.notify_slack_webhook || "");
      setEmail(settings.notify_email || "");
      setTimezone(settings.timezone || "UTC");
    }
  }, [settings]);

  const handleAddAirport = () => {
    if (newAirport && !airports.includes(newAirport.toUpperCase())) {
      setAirports([...airports, newAirport.toUpperCase()]);
      setNewAirport("");
    }
  };

  const handleRemoveAirport = (airport: string) => {
    setAirports(airports.filter((a) => a !== airport));
  };

  const handleSave = () => {
    const data = {
      airports,
      prob_threshold: probThreshold,
      notify_slack_webhook: slackWebhook || null,
      notify_email: email || null,
      timezone,
    };

    if (settings) {
      updateSettings(data);
    } else {
      createSettings(data);
    }
  };

  if (isLoading) {
    return (
      <AppLayout>
        <div className="space-y-6">
          <h1 className="text-2xl font-medium">Loading...</h1>
        </div>
      </AppLayout>
    );
  }

  return (
    <AppLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-medium">Settings</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Configure notifications and preferences
          </p>
        </div>

        <div className="grid gap-6">
          <Card className="p-6">
            <h2 className="text-lg font-medium">Followed Airports</h2>
            <p className="mt-1 text-sm text-muted-foreground">
              Select airports to monitor for empty legs
            </p>

            <div className="mt-6 space-y-4">
              <div className="flex gap-2">
                <Input
                  placeholder="ICAO code (e.g., KTEB)"
                  value={newAirport}
                  onChange={(e) => setNewAirport(e.target.value.toUpperCase())}
                  onKeyDown={(e) => e.key === "Enter" && handleAddAirport()}
                  maxLength={4}
                />
                <Button onClick={handleAddAirport} variant="secondary">
                  Add
                </Button>
              </div>

              <div className="flex flex-wrap gap-2">
                {airports.map((airport) => (
                  <Badge key={airport} variant="secondary" className="gap-1 px-3 py-1">
                    {airport}
                    <button
                      onClick={() => handleRemoveAirport(airport)}
                      className="ml-1 hover:text-foreground"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </Badge>
                ))}
              </div>
            </div>
          </Card>

          <Card className="p-6">
            <h2 className="text-lg font-medium">Probability Threshold</h2>
            <p className="mt-1 text-sm text-muted-foreground">
              Minimum probability to show signals (0-100%)
            </p>

            <div className="mt-6 space-y-4">
              <div className="flex items-center gap-4">
                <Slider
                  value={[probThreshold * 100]}
                  onValueChange={(v) => setProbThreshold(v[0] / 100)}
                  max={100}
                  step={5}
                  className="flex-1"
                />
                <Badge variant="secondary" className="font-mono min-w-[60px] justify-center">
                  {(probThreshold * 100).toFixed(0)}%
                </Badge>
              </div>
            </div>
          </Card>

          <Card className="p-6">
            <h2 className="text-lg font-medium">Notifications</h2>
            <p className="mt-1 text-sm text-muted-foreground">
              Choose how you want to receive alerts
            </p>

            <div className="mt-6 space-y-4">
              <div className="space-y-2">
                <Label htmlFor="slack">Slack Webhook URL</Label>
                <Input
                  id="slack"
                  type="url"
                  placeholder="https://hooks.slack.com/services/..."
                  value={slackWebhook}
                  onChange={(e) => setSlackWebhook(e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="email">Email Notifications</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="you@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="timezone">Timezone</Label>
                <Input
                  id="timezone"
                  placeholder="UTC"
                  value={timezone}
                  onChange={(e) => setTimezone(e.target.value)}
                />
              </div>
            </div>
          </Card>

          <div className="flex justify-end">
            <Button onClick={handleSave}>Save Changes</Button>
          </div>
        </div>
      </div>
    </AppLayout>
  );
}
