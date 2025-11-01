import { useNavigate } from "react-router-dom";
import { useMemo } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { DailyBriefing } from "@/types/database";
import { toast } from "sonner";
import { ExternalLink, Mail, Clock } from "lucide-react";

interface BriefingAssistantProps {
  briefs: DailyBriefing[];
}

export default function BriefingAssistant({ briefs }: BriefingAssistantProps) {
  const navigate = useNavigate();
  const todayISO = new Date().toISOString().split("T")[0];

  // 1) Top corridor (agrège tous les probable_routes)
  const topCorridor = useMemo(() => {
    const allRoutes = briefs.flatMap((b) =>
      (b.probable_routes || []).map((r: any) => ({
        ...r,
        from: b.airport_icao,
      }))
    );

    if (allRoutes.length === 0) return null;

    // Dédupliquer par dep->arr et garder la plus haute probabilité
    const dedup = new Map<string, { from: string; dep: string; arr: string; prob: number }>();
    for (const r of allRoutes) {
      const key = `${r.dep}->${r.arr}`;
      const cur = dedup.get(key);
      if (!cur || r.prob > cur.prob) {
        dedup.set(key, { from: r.from, dep: r.dep, arr: r.arr, prob: r.prob });
      }
    }

    const sorted = Array.from(dedup.values()).sort((a, b) => b.prob - a.prob);
    return sorted[0];
  }, [briefs]);

  // 2) Call list (Top 3 opérateurs)
  const callList = useMemo(() => {
    const allOps = briefs.flatMap((b) => b.priority_operators || []);
    
    // Dédupliquer par nom
    const seen = new Set<string>();
    const unique = allOps.filter((op: any) => {
      if (!op.name || seen.has(op.name)) return false;
      seen.add(op.name);
      return true;
    });

    return unique.slice(0, 3);
  }, [briefs]);

  // 3) Best call time (meilleure heure globale)
  const bestHour = useMemo(() => {
    const bucket = new Array(24).fill(0);
    
    briefs.forEach((b) => {
      (b.hot_hours || []).forEach((h: any) => {
        bucket[h.hour] += h.score || 0;
      });
    });

    const maxScore = Math.max(...bucket);
    if (maxScore === 0) return null;
    
    const idx = bucket.indexOf(maxScore);
    return idx >= 0 ? idx : null;
  }, [briefs]);

  const openFindCover = (dep: string, arr: string) => {
    navigate(`/find-cover?dep=${dep}&arr=${arr}&date=${todayISO}`);
  };

  const copyPitch = (op: any) => {
    const txt = `Subject: ${op.name} — coordination ${todayISO}

Hi ${op.name} team,

We're seeing strong patterns today (${op.reason.toLowerCase()}).
Do you have short-notice cover? Quick call?

${op.contact?.email ? `Email: ${op.contact.email}\n` : ""}${op.contact?.phone ? `Phone: ${op.contact.phone}\n` : ""}Best,
[Your name]`;

    navigator.clipboard.writeText(txt);
    toast.success("Pitch copied to clipboard");
  };

  return (
    <Card className="sticky top-4">
      <CardContent className="p-6 space-y-6">
        {/* Header */}
        <div>
          <div className="text-xl font-medium">Briefing Assistant</div>
          <div className="text-sm text-muted-foreground">
            Actions prêtes à l'emploi
          </div>
        </div>

        {/* Top corridor */}
        <div className="space-y-2">
          <div className="flex items-center gap-2 text-sm font-medium">
            <ExternalLink className="h-4 w-4" />
            Top corridor
          </div>
          {topCorridor ? (
            <div className="flex items-center justify-between gap-2 p-3 bg-muted/50 rounded-lg">
              <div className="text-sm font-mono">
                {topCorridor.dep} → {topCorridor.arr}
              </div>
              <Button
                onClick={() => openFindCover(topCorridor.dep, topCorridor.arr)}
                size="sm"
              >
                Find Cover
              </Button>
            </div>
          ) : (
            <div className="text-sm text-muted-foreground p-3 bg-muted/30 rounded-lg">
              Aucun corridor saillant aujourd'hui
            </div>
          )}
        </div>

        {/* Call list */}
        <div className="space-y-2">
          <div className="flex items-center gap-2 text-sm font-medium">
            <Mail className="h-4 w-4" />
            Call list (Top 3)
          </div>
          {callList.length > 0 ? (
            <div className="space-y-2">
              {callList.map((op: any) => (
                <div
                  key={op.name}
                  className="flex items-center justify-between gap-2 p-3 bg-muted/50 rounded-lg"
                >
                  <div className="text-sm truncate flex-1">{op.name}</div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => copyPitch(op)}
                  >
                    Copy pitch
                  </Button>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-sm text-muted-foreground p-3 bg-muted/30 rounded-lg">
              Pas d'opérateurs priorisés
            </div>
          )}
        </div>

        {/* Best call time */}
        <div className="space-y-2">
          <div className="flex items-center gap-2 text-sm font-medium">
            <Clock className="h-4 w-4" />
            Best call time
          </div>
          <div className="p-3 bg-muted/50 rounded-lg">
            {bestHour !== null ? (
              <div className="text-sm font-mono">
                {bestHour.toString().padStart(2, "0")}:00–
                {((bestHour + 1) % 24).toString().padStart(2, "0")}:00 UTC
              </div>
            ) : (
              <div className="text-sm text-muted-foreground">—</div>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
