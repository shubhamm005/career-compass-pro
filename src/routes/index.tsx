import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useAuth, dashboardPathFor } from "@/lib/auth";
import { ArrowRight, Briefcase, GraduationCap, LineChart, ShieldCheck } from "lucide-react";
import { Button } from "@/components/ui/button";

export const Route = createFileRoute("/")({ component: Landing });

function Landing() {
  const { user } = useAuth();
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-background">
      <header className="sticky top-0 z-30 border-b border-border bg-background/80 backdrop-blur">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-6">
          <Link to="/" className="flex items-center gap-2 font-bold tracking-tight">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-primary-foreground">
              <GraduationCap className="h-5 w-5" />
            </div>
            CareerCRM
          </Link>
          <div className="flex items-center gap-2">
            {user ? (
              <Button onClick={() => navigate({ to: dashboardPathFor(user.role) as any })}>
                Go to dashboard
              </Button>
            ) : (
              <>
                <Link to="/login" className="px-3 py-2 text-sm font-medium text-muted-foreground hover:text-foreground">
                  Login
                </Link>
                <Button onClick={() => navigate({ to: "/register" })}>Get started</Button>
              </>
            )}
          </div>
        </div>
      </header>

      <section className="relative overflow-hidden">
        <div className="absolute inset-0 -z-10 opacity-30" style={{ background: "var(--gradient-hero)" }} />
        <div className="mx-auto max-w-7xl px-6 py-24 lg:py-32">
          <div className="mx-auto max-w-3xl text-center">
            <span className="inline-flex items-center rounded-full border border-border bg-card px-3 py-1 text-xs font-medium text-muted-foreground">
              Smart Career Guidance & Placement Platform
            </span>
            <h1 className="mt-6 text-4xl font-bold tracking-tight text-foreground sm:text-6xl">
              Where students meet <span className="bg-clip-text text-transparent" style={{ backgroundImage: "var(--gradient-primary)" }}>their dream career</span>
            </h1>
            <p className="mt-6 text-lg text-muted-foreground">
              A unified CRM for students, placement officers, and admins. Smart segmentation, skill-based job recommendations, and end-to-end application tracking.
            </p>
            <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
              <Button size="lg" onClick={() => navigate({ to: "/register" })} className="gap-2">
                Create your profile <ArrowRight className="h-4 w-4" />
              </Button>
              <Button size="lg" variant="outline" onClick={() => navigate({ to: "/login" })}>
                Sign in
              </Button>
            </div>
          </div>

          <div className="mx-auto mt-20 grid max-w-5xl gap-6 sm:grid-cols-3">
            {[
              { icon: GraduationCap, title: "Smart Segmentation", desc: "Auto-segment students into Fresher, Skilled, or Placement Ready based on profile data." },
              { icon: Briefcase, title: "Job Recommendations", desc: "Personalized job matches based on skills, with deadline-aware ranking." },
              { icon: LineChart, title: "Placement Insights", desc: "Real-time dashboards for placement officers and administrators." },
            ].map((f) => (
              <div key={f.title} className="rounded-2xl border border-border bg-card p-6 shadow-[var(--shadow-card)]">
                <div className="mb-4 flex h-11 w-11 items-center justify-center rounded-xl bg-primary/10 text-primary">
                  <f.icon className="h-5 w-5" />
                </div>
                <h3 className="font-semibold text-foreground">{f.title}</h3>
                <p className="mt-2 text-sm text-muted-foreground">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <footer className="border-t border-border py-8 text-center text-sm text-muted-foreground">
        <div className="mx-auto flex max-w-7xl items-center justify-center gap-2 px-6">
          <ShieldCheck className="h-4 w-4" /> Role-based access · JWT secured · Built for placement teams
        </div>
      </footer>
    </div>
  );
}
