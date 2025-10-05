import { AppLayout } from "@/components/layouts/AppLayout";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { useState } from "react";
import { toast } from "sonner";

export default function Settings() {
  const [slackWebhook, setSlackWebhook] = useState("");
  const [email, setEmail] = useState("");

  const handleSave = () => {
    toast.success("Settings saved");
  };

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
            </div>
          </Card>

          <Card className="p-6">
            <h2 className="text-lg font-medium">Followed Airports</h2>
            <p className="mt-1 text-sm text-muted-foreground">
              Select airports to monitor for empty legs
            </p>

            <div className="mt-6">
              <p className="text-sm text-muted-foreground">
                Airport selection coming soon...
              </p>
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
