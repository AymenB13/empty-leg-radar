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
