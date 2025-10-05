import { Button } from "@/components/ui/button";
import { Copy, Send, Check, X } from "lucide-react";
import { EmptylegSignal } from "@/types/database";
import { buildPitchCopy, sendToSlack } from "@/lib/signal-utils";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { useState } from "react";

interface SignalActionsProps {
  signal: EmptylegSignal;
  slackWebhook?: string | null;
  onUpdate: () => void;
}

export function SignalActions({ signal, slackWebhook, onUpdate }: SignalActionsProps) {
  const [isSending, setIsSending] = useState(false);
  
  const handleCopy = async () => {
    const pitch = buildPitchCopy(signal);
    await navigator.clipboard.writeText(pitch);
    toast.success("Copied to clipboard");
  };
  
  const handleSendToSlack = async () => {
    if (!slackWebhook) {
      toast.error("No Slack webhook configured");
      return;
    }
    
    setIsSending(true);
    try {
      const pitch = buildPitchCopy(signal);
      await sendToSlack(slackWebhook, pitch);
      toast.success("Sent to Slack");
      await handleMarkAsSent();
    } catch (error) {
      toast.error("Failed to send to Slack");
    } finally {
      setIsSending(false);
    }
  };
  
  const handleMarkAsSent = async () => {
    try {
      await supabase
        .from("emptyleg_signals")
        .update({ status: "sent" })
        .eq("id", signal.id);
      toast.success("Marked as sent");
      onUpdate();
    } catch (error) {
      toast.error("Failed to update status");
    }
  };
  
  const handleDismiss = async () => {
    try {
      await supabase
        .from("emptyleg_signals")
        .update({ status: "dismissed" })
        .eq("id", signal.id);
      toast.success("Dismissed");
      onUpdate();
    } catch (error) {
      toast.error("Failed to dismiss");
    }
  };
  
  return (
    <div className="flex items-center gap-1">
      <Button
        variant="ghost"
        size="sm"
        onClick={handleCopy}
        title="Copy pitch"
      >
        <Copy className="h-4 w-4" />
      </Button>
      <Button
        variant="ghost"
        size="sm"
        onClick={handleSendToSlack}
        disabled={!slackWebhook || isSending}
        title="Send to Slack"
      >
        <Send className="h-4 w-4" />
      </Button>
      {signal.status === "pending" && (
        <>
          <Button
            variant="ghost"
            size="sm"
            onClick={handleMarkAsSent}
            title="Mark as sent"
          >
            <Check className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={handleDismiss}
            title="Dismiss"
          >
            <X className="h-4 w-4" />
          </Button>
        </>
      )}
    </div>
  );
}
