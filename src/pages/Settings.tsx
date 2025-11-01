import { AppLayout } from "@/components/layouts/AppLayout";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useUserSettings } from "@/hooks/supabase/useUserSettings";
import { useState, useEffect } from "react";
import { X, Send } from "lucide-react";
import { sendToSlack } from "@/lib/signal-utils";
import { toast } from "sonner";

const SUGGESTED_AIRPORTS = ["KTEB", "KVNY", "LFPB", "KASE", "EGGW"];
const TIMEZONES = ["UTC", "America/New_York", "America/Los_Angeles", "Europe/London", "Europe/Paris"];

export default function Settings() {
  const { settings, isLoading, updateSettings, createSettings } = useUserSettings();
  const [airports, setAirports] = useState<string[]>([]);
  const [newAirport, setNewAirport] = useState("");
  const [probThreshold, setProbThreshold] = useState(0.6);
  const [slackWebhook, setSlackWebhook] = useState("");
  const [email, setEmail] = useState("");
  const [timezone, setTimezone] = useState("UTC");
  const [isTestingSlack, setIsTestingSlack] = useState(false);

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

  const handleTestSlack = async () => {
    if (!slackWebhook) {
      toast.error("Please enter a Slack webhook URL");
      return;
    }
    
    setIsTestingSlack(true);
    try {
      await sendToSlack(slackWebhook, "Test message from Empty Leg Radar 🛩️");
      toast.success("Test message sent successfully!");
    } catch (error) {
      toast.error("Failed to send test message");
    } finally {
      setIsTestingSlack(false);
    }
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
  
  const handleAddSuggested = (airport: string) => {
    if (!airports.includes(airport)) {
      setAirports([...airports, airport]);
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
          <h1 className="text-2xl font-medium">Your feed & alerts</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Control which airports you track and how you get notified.
          </p>
        </div>

        <div className="grid gap-6">
          <Card className="p-6">
            <h2 className="text-lg font-medium">Followed Airports</h2>
            <p className="mt-1 text-sm text-muted-foreground">
              Select airports to monitor for empty legs
            </p>

            <div className="mt-6 space-y-4">
              <div className="flex flex-wrap gap-2">
                {SUGGESTED_AIRPORTS.map((airport) => (
                  <Button
                    key={airport}
                    variant="outline"
                    size="sm"
                    onClick={() => handleAddSuggested(airport)}
                    disabled={airports.includes(airport)}
                  >
                    {airport}
                  </Button>
                ))}
              </div>
              
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
              Minimum probability to show signals (5%-95%). Recommended: 60%-80%
            </p>

            <div className="mt-6 space-y-4">
              <div className="flex items-center gap-4">
                <Slider
                  value={[probThreshold * 100]}
                  onValueChange={(v) => setProbThreshold(v[0] / 100)}
                  min={5}
                  max={95}
                  step={5}
                  className="flex-1"
                />
                <div className="flex items-center gap-2">
                  <Input
                    type="number"
                    value={(probThreshold * 100).toFixed(0)}
                    onChange={(e) => {
                      const val = parseInt(e.target.value);
                      if (val >= 5 && val <= 95) {
                        setProbThreshold(val / 100);
                      }
                    }}
                    min={5}
                    max={95}
                    className="w-20 font-mono text-center"
                  />
                  <span className="text-sm">%</span>
                </div>
              </div>
            </div>
          </Card>

          <Card className="p-6 opacity-60">
            <div className="flex items-center gap-2">
              <h2 className="text-lg font-medium">Notifications</h2>
              <Badge variant="secondary" className="bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-100">
                Coming Soon
              </Badge>
            </div>
            <p className="mt-1 text-sm text-muted-foreground">
              Configure alert channels
            </p>

            <div className="mt-6 space-y-4">
              <div className="space-y-2">
                <Label htmlFor="slack">Slack Webhook URL</Label>
                <div className="flex gap-2">
                  <Input
                    id="slack"
                    type="url"
                    placeholder="https://hooks.slack.com/services/..."
                    value={slackWebhook}
                    onChange={(e) => setSlackWebhook(e.target.value)}
                    className="flex-1"
                    disabled={true}
                  />
                  <Button
                    variant="secondary"
                    onClick={handleTestSlack}
                    disabled={true}
                  >
                    <Send className="h-4 w-4 mr-2" />
                    Test
                  </Button>
                </div>
                <p className="text-xs text-muted-foreground">Get instant alerts in Slack</p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="you@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  disabled={true}
                />
                <p className="text-xs text-muted-foreground">Receive email notifications</p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="timezone">Timezone</Label>
                <Select value={timezone} onValueChange={setTimezone} disabled={true}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-popover z-50">
                    {TIMEZONES.map((tz) => (
                      <SelectItem key={tz} value={tz}>
                        {tz}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <p className="text-xs text-muted-foreground">For display only; backend stays UTC</p>
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
