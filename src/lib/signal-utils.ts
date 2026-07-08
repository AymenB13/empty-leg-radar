import { EmptylegSignal } from "@/types/database";

export function calculateTimeToDepart(etd_next: string | null): string {
  if (!etd_next) return "—";
  
  const now = new Date().getTime();
  const etd = new Date(etd_next).getTime();
  const diffMinutes = Math.ceil((etd - now) / 60000);
  
  if (diffMinutes < 0) return "Departed";
  return `T-${diffMinutes}m`;
}

export function formatProbability(prob_final: number | null): string {
  if (prob_final === null || prob_final === undefined) return "—";
  return `${(prob_final * 10).toFixed(1)}/10`;
}

export function buildPitchCopy(signal: EmptylegSignal): string {
  const timeStr = calculateTimeToDepart(signal.etd_next);
  const probStr = signal.prob_final ? signal.prob_final.toFixed(2) : "—";
  
  return `N${signal.reg} at ${signal.airport_icao} → ${signal.to_icao} in ${timeStr}. Empty-leg prob ${probStr}. Reasons: ${signal.reason || "—"}.`;
}

export type SignalVerdict = {
  key: string;
  label: string;
  detail: string;
  tone: "strong" | "medium" | "weak" | "neutral" | "unknown";
};

// Translate the raw scorer reason tokens into a plain-language verdict for brokers.
// The base-direction token is the primary driver of empty-leg likelihood.
export function getSignalVerdict(
  reason: string | null | undefined,
  toIcao?: string | null
): SignalVerdict {
  const tokens = (reason || "").split("|").map((t) => t.trim()).filter(Boolean);
  const has = (t: string) => tokens.some((x) => x === t || x.startsWith(`${t}(`));

  if (has("return_to_base") || has("to_base")) {
    return {
      key: "return_to_base",
      label: "Returning to base",
      detail: toIcao
        ? `Deadheading home to ${toIcao} — likely flying empty. Call the operator first.`
        : "Deadheading home — likely flying empty. Call the operator first.",
      tone: "strong",
    };
  }
  if (has("heading_home")) {
    return {
      key: "heading_home",
      label: "Heading toward base",
      detail: "Repositioning closer to home — possible empty leg.",
      tone: "medium",
    };
  }
  if (has("leaving_base") || has("from_base") || has("base_departure")) {
    return {
      key: "leaving_base",
      label: "Leaving base",
      detail: "Outbound from home base — likely a passenger leg, not empty.",
      tone: "weak",
    };
  }
  if (has("heading_away")) {
    return {
      key: "heading_away",
      label: "Heading away from base",
      detail: "Moving away from home — unlikely to be empty.",
      tone: "weak",
    };
  }
  if (has("base_unknown")) {
    return {
      key: "base_unknown",
      label: "Base not yet learned",
      detail: "No home base on file for this tail — direction can't be qualified yet.",
      tone: "unknown",
    };
  }
  if (has("lateral")) {
    return {
      key: "lateral",
      label: "Lateral trip",
      detail: "Neither toward nor away from its base.",
      tone: "neutral",
    };
  }
  return {
    key: "other",
    label: "Fast turnaround",
    detail: "Short ground time flagged this aircraft.",
    tone: "neutral",
  };
}

export async function sendToSlack(webhook: string, message: string): Promise<void> {
  const response = await fetch(webhook, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ text: message }),
  });
  
  if (!response.ok) {
    throw new Error("Failed to send to Slack");
  }
}

export function exportToCSV(data: any[], filename: string): void {
  if (!data || data.length === 0) return;
  
  const headers = Object.keys(data[0]);
  const csvContent = [
    headers.join(","),
    ...data.map(row => 
      headers.map(header => {
        const value = row[header];
        if (value === null || value === undefined) return "";
        if (typeof value === "string" && value.includes(",")) return `"${value}"`;
        return value;
      }).join(",")
    )
  ].join("\n");
  
  const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
  const link = document.createElement("a");
  const url = URL.createObjectURL(blob);
  link.setAttribute("href", url);
  link.setAttribute("download", filename);
  link.style.visibility = "hidden";
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}
