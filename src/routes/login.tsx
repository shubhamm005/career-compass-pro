import { createFileRoute, useNavigate, Link, Navigate } from "@tanstack/react-router";
import { useState } from "react";
import { useAuth, dashboardPathFor } from "@/lib/auth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { GraduationCap, Loader2 } from "lucide-react";

export const Route = createFileRoute("/login")({ component: LoginPage });

function LoginPage() {
  const { login, user } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  if (user) return <Navigate to={dashboardPathFor(user.role) as any} />;

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const u = await login(email, password);
      toast.success(`Welcome back, ${u.name}`);
      navigate({ to: dashboardPathFor(u.role) as any });
    } catch (err: any) {
      toast.error(err.message || "Login failed");
    } finally { setLoading(false); }
  };

  return (
    <div className="grid min-h-screen lg:grid-cols-2">
      <div className="hidden lg:flex flex-col justify-between p-10 text-sidebar-foreground" style={{ background: "var(--gradient-hero)" }}>
        <Link to="/" className="flex items-center gap-2 font-bold">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-white/10">
            <GraduationCap className="h-5 w-5" />
          </div>
          CareerCRM
        </Link>
        <div>
          <h2 className="text-3xl font-bold">Your career, intelligently managed.</h2>
          <p className="mt-3 max-w-md text-white/80">Track applications, get matched to jobs, and grow into a placement-ready candidate.</p>
        </div>
        <p className="text-xs text-white/60">© CareerCRM</p>
      </div>

      <div className="flex items-center justify-center p-6">
        <form onSubmit={submit} className="w-full max-w-sm space-y-5">
          <div>
            <h1 className="text-2xl font-bold tracking-tight">Sign in</h1>
            <p className="mt-1 text-sm text-muted-foreground">Welcome back. Enter your credentials.</p>
          </div>
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input id="email" type="email" required value={email} onChange={(e) => setEmail(e.target.value)} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="password">Password</Label>
            <Input id="password" type="password" required value={password} onChange={(e) => setPassword(e.target.value)} />
          </div>
          <Button type="submit" className="w-full" disabled={loading}>
            {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}Sign in
          </Button>
          <p className="text-center text-sm text-muted-foreground">
            Don't have an account?{" "}
            <Link to="/register" className="font-medium text-primary hover:underline">Register</Link>
          </p>
        </form>
      </div>
    </div>
  );
}
