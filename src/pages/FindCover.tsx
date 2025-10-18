import { useMemo, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";

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
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState<any>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setResults(null);
    
    const { data, error } = await supabase.functions.invoke('find-cover', {
      body: {
        dep_icao: dep,
        arr_icao: arr || undefined,
        request_date: date,
      }
    });
    
    setLoading(false);
    
    if (error) {
      toast.error(`Error: ${error.message}`);
      return;
    }
    
    setResults(data);
    toast.success(`Found ${data.operators.length} operators, ${data.tails.length} tails`);
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
              <Button type="submit" className="w-full" disabled={loading}>
                {loading ? "Searching..." : "Find Cover"}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>

      {results && (
        <>
          <Card>
            <CardHeader>
              <CardTitle>Operators ({results.operators.length})</CardTitle>
            </CardHeader>
            <CardContent>
              {results.operators.length === 0 ? (
                <p className="text-sm text-muted-foreground">No operators found for this route.</p>
              ) : (
                <div className="space-y-4">
                  {results.operators.map((op: any) => (
                    <div key={op.name} className="border-b pb-4 last:border-0">
                      <p className="font-medium">{op.name}</p>
                      <p className="text-sm text-muted-foreground mt-1">{op.reason}</p>
                      {op.contact?.email && (
                        <p className="text-sm mt-1">📧 {op.contact.email}</p>
                      )}
                      {op.contact?.phone && (
                        <p className="text-sm">📞 {op.contact.phone}</p>
                      )}
                      <Button 
                        variant="outline" 
                        size="sm" 
                        className="mt-2"
                        onClick={() => {
                          navigator.clipboard.writeText(op.email_script);
                          toast.success("Email script copied to clipboard");
                        }}
                      >
                        Copy email script
                      </Button>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Tails ({results.tails.length})</CardTitle>
            </CardHeader>
            <CardContent>
              {results.tails.length === 0 ? (
                <p className="text-sm text-muted-foreground">No tails found for this route.</p>
              ) : (
                <div className="space-y-3">
                  {results.tails.map((tail: any) => (
                    <div key={tail.n_number} className="border-b pb-3 last:border-0">
                      <p className="font-medium">{tail.n_number} - {tail.model}</p>
                      <p className="text-sm text-muted-foreground mt-1">{tail.reason}</p>
                      <p className="text-sm">Operator: {tail.operator}</p>
                      {tail.last_seen && (
                        <p className="text-sm text-muted-foreground">
                          Last seen: {new Date(tail.last_seen).toLocaleDateString()}
                        </p>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </>
      )}
    </div>
  );
}
