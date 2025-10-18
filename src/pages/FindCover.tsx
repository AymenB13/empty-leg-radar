import { useMemo, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "sonner";

export default function FindCover() {
  const [searchParams] = useSearchParams();

  const defaults = useMemo(() => {
    return {
      dep: (searchParams.get("dep") ?? "").toUpperCase(),
      arr: (searchParams.get("arr") ?? "").toUpperCase(),
      date: searchParams.get("date") ?? new Date().toISOString().slice(0, 10),
    };
  }, [searchParams]);

  const [dep, setDep] = useState(defaults.dep);
  const [arr, setArr] = useState(defaults.arr);
  const [date, setDate] = useState(defaults.date);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    toast.success(`Find Cover lancé: ${dep} → ${arr || "(any)"} le ${date}`);
  };

  return (
    <div className="max-w-3xl mx-auto p-6 space-y-6">
      <h1 className="text-2xl font-semibold">Find Cover</h1>
      <p className="text-sm text-muted-foreground">
        Entrez un corridor et une date. Cette page est un placeholder (la recherche réelle arrive au Sprint 3).
      </p>

      <Card>
        <CardHeader>
          <CardTitle>Paramètres</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="grid grid-cols-1 sm:grid-cols-4 gap-3">
            <div className="sm:col-span-1">
              <label className="text-sm">DEP (ICAO)</label>
              <Input
                value={dep}
                onChange={(e) => setDep(e.target.value.toUpperCase())}
                placeholder="KTEB"
                maxLength={4}
              />
            </div>
            <div className="sm:col-span-1">
              <label className="text-sm">ARR (ICAO)</label>
              <Input
                value={arr}
                onChange={(e) => setArr(e.target.value.toUpperCase())}
                placeholder="KVNY (optionnel)"
                maxLength={4}
              />
            </div>
            <div className="sm:col-span-1">
              <label className="text-sm">Date (UTC)</label>
              <Input
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
              />
            </div>
            <div className="sm:col-span-1 flex items-end">
              <Button type="submit" className="w-full">Find Cover</Button>
            </div>
          </form>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Statut</CardTitle>
        </CardHeader>
        <CardContent className="text-sm text-muted-foreground">
          Cette page existe pour éviter l'erreur 404 et valider le flux depuis le Briefing.
          L'appel à l'Edge Function <code>find-cover</code> sera branché ensuite.
        </CardContent>
      </Card>
    </div>
  );
}
