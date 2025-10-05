import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { Plane } from "lucide-react";

export default function Login() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session) {
        navigate("/signals");
      }
    });
  }, [navigate]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    const { error } = await supabase.auth.signInWithOtp({
      email,
      options: {
        emailRedirectTo: `${window.location.origin}/signals`,
      },
    });

    if (error) {
      toast.error(error.message);
    } else {
      toast.success("Check your email for the magic link!");
      setEmail("");
    }

    setLoading(false);
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-background">
      <div className="w-full max-w-sm space-y-8">
        <div className="text-center">
          <div className="mb-4 flex justify-center">
            <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-accent">
              <Plane className="h-6 w-6 text-accent-foreground" />
            </div>
          </div>
          <h1 className="text-2xl font-medium">Empty Leg Radar</h1>
          <p className="mt-2 text-sm text-muted-foreground">
            Enter your email for a magic link.
          </p>
        </div>

        <form onSubmit={handleLogin} className="space-y-4">
          <div>
            <Input
              type="email"
              placeholder="you@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="h-12"
            />
          </div>

          <Button type="submit" className="h-12 w-full" disabled={loading}>
            {loading ? "Sending magic link..." : "Send magic link"}
          </Button>
        </form>

        <p className="text-center text-xs text-muted-foreground">
          No password needed. We'll send you a secure link to sign in.
        </p>
      </div>
    </div>
  );
}
