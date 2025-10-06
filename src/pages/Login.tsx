import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { Plane, Eye, EyeOff } from "lucide-react";

export default function Login() {
  const [mode, setMode] = useState<"login" | "register">("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session) {
        navigate("/signals");
      }
    });
  }, [navigate]);

  const validateForm = () => {
    if (!email || !password) {
      toast.error("Email and password required");
      return false;
    }
    
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      toast.error("Invalid email format");
      return false;
    }

    if (password.length < 8) {
      toast.error("Password must be at least 8 characters");
      return false;
    }

    if (mode === "register" && password !== confirmPassword) {
      toast.error("Passwords do not match");
      return false;
    }

    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) return;

    setLoading(true);

    try {
      if (mode === "login") {
        const { error } = await supabase.auth.signInWithPassword({
          email,
          password,
        });

        if (error) {
          if (error.message.includes("Invalid login credentials")) {
            toast.error("Invalid email or password");
          } else {
            toast.error(error.message);
          }
        } else {
          toast.success("Successfully logged in!");
          navigate("/signals");
        }
      } else {
        const { error } = await supabase.auth.signUp({
          email,
          password,
          options: {
            emailRedirectTo: `${window.location.origin}/signals`,
          },
        });

        if (error) {
          if (error.message.includes("already registered")) {
            toast.error("This email is already registered");
          } else {
            toast.error(error.message);
          }
        } else {
          toast.success("Account created successfully!");
          navigate("/signals");
        }
      }
    } catch (error: any) {
      toast.error("An error occurred");
    } finally {
      setLoading(false);
    }
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
            {mode === "login" ? "Sign in to your account" : "Create your account"}
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Input
              type="email"
              placeholder="Email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="h-12"
            />
          </div>

          <div className="relative">
            <Input
              type={showPassword ? "text" : "password"}
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="h-12 pr-10"
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
            >
              {showPassword ? (
                <EyeOff className="h-4 w-4" />
              ) : (
                <Eye className="h-4 w-4" />
              )}
            </button>
          </div>

          {mode === "register" && (
            <div>
              <Input
                type="password"
                placeholder="Confirm password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
                className="h-12"
              />
            </div>
          )}

          <Button type="submit" className="h-12 w-full" disabled={loading}>
            {loading
              ? mode === "login"
                ? "Signing in..."
                : "Creating account..."
              : mode === "login"
              ? "Sign in"
              : "Create account"}
          </Button>
        </form>

        <div className="text-center">
          <button
            type="button"
            onClick={() => {
              setMode(mode === "login" ? "register" : "login");
              setPassword("");
              setConfirmPassword("");
            }}
            className="text-sm text-muted-foreground hover:text-foreground"
          >
            {mode === "login" ? (
              <>
                No account?{" "}
                <span className="font-medium text-primary">Sign up</span>
              </>
            ) : (
              <>
                Already have an account?{" "}
                <span className="font-medium text-primary">Sign in</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
