import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import { AppShell } from "@/components/AppShell";
import { useAuth } from "@/lib/auth";
import { api } from "@/lib/api";
import type { StudentDashboard } from "@/lib/types";
import { SegmentBadge } from "@/components/SegmentBadge";
import { StatusBadge } from "@/components/StatusBadge";
import { CardsSkeleton, TableSkeleton } from "@/components/Skeletons";
import { EmptyState } from "@/components/EmptyState";
import { Button } from "@/components/ui/button";
import { Briefcase, FileText, CheckCircle2, Clock, Award, ArrowRight, User, Bell } from "lucide-react";
import { calcSegment } from "@/lib/segment";

export const Route = createFileRoute("/dashboard/student")({
  component: () => (
    <ProtectedRoute roles={["student"]}>
      <AppShell><StudentDashboardPage /></AppShell>
    </ProtectedRoute>
  ),
});

function StatCard({ icon: Icon, label, value, tone }: any) {
  return (
    <div className="rounded-xl border border-border bg-card p-5 shadow-[var(--shadow-card)]">
      <div className="flex items-center justify-between">
        <p className="text-sm font-medium text-muted-foreground">{label}</p>
        <div className={`flex h-9 w-9 items-center justify-center rounded-lg ${tone}`}>
          <Icon className="h-4 w-4" />
        </div>
      </div>
      <p className="mt-3 text-3xl font-bold tracking-tight">{value ?? 0}</p>
    </div>
  );
}

function StudentDashboardPage() {
  const { user } = useAuth();
  const id = user!.id;

  const { data, isLoading } = useQuery({
    queryKey: ["dashboard-student", id],
    queryFn: () => api<StudentDashboard>(`/dashboard/student/${id}`),
  });

  const segment = data?.profile?.segment || (data?.profile && calcSegment(data.profile));

  return (
    <div className="mx-auto max-w-7xl space-y-8">
      {/* Welcome */}
      <div className="rounded-2xl border border-border p-6 lg:p-8 text-primary-foreground" style={{ background: "var(--gradient-hero)" }}>
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <p className="text-sm/relaxed text-white/80">Welcome back,</p>
            <h1 className="mt-1 text-3xl font-bold">{user!.name}</h1>
            <p className="mt-2 max-w-xl text-sm text-white/80">
              Keep your profile sharp and stay on top of your applications.
            </p>
          </div>
          <SegmentBadge segment={segment} />
        </div>
      </div>

      {/* Stats */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard icon={FileText} label="Applied" value={data?.applied} tone="bg-info/15 text-info" />
        <StatCard icon={Clock} label="Shortlisted" value={data?.shortlisted} tone="bg-warning/15 text-warning" />
        <StatCard icon={Award} label="Interviews" value={data?.interviewed} tone="bg-purple/15 text-purple" />
        <StatCard icon={CheckCircle2} label="Placed" value={data?.placed} tone="bg-success/15 text-success" />
      </div>

      {/* Quick links */}
      <div className="grid gap-3 sm:grid-cols-3">
        <Link to="/profile" className="group flex items-center justify-between rounded-xl border border-border bg-card p-4 hover:bg-accent">
          <div className="flex items-center gap-3"><User className="h-5 w-5 text-primary" /><span className="font-medium">Edit profile</span></div>
          <ArrowRight className="h-4 w-4 text-muted-foreground group-hover:translate-x-0.5 transition-transform" />
        </Link>
        <Link to="/jobs" className="group flex items-center justify-between rounded-xl border border-border bg-card p-4 hover:bg-accent">
          <div className="flex items-center gap-3"><Briefcase className="h-5 w-5 text-primary" /><span className="font-medium">Browse jobs</span></div>
          <ArrowRight className="h-4 w-4 text-muted-foreground group-hover:translate-x-0.5 transition-transform" />
        </Link>
        <Link to="/notifications" className="group flex items-center justify-between rounded-xl border border-border bg-card p-4 hover:bg-accent">
          <div className="flex items-center gap-3"><Bell className="h-5 w-5 text-primary" /><span className="font-medium">Notifications</span></div>
          <ArrowRight className="h-4 w-4 text-muted-foreground group-hover:translate-x-0.5 transition-transform" />
        </Link>
      </div>

      {/* Recommended jobs */}
      <section>
        <div className="mb-4 flex items-end justify-between">
          <div>
            <h2 className="text-xl font-bold">Recommended for you</h2>
            <p className="text-sm text-muted-foreground">Matched to your skills.</p>
          </div>
          <Link to="/jobs" className="text-sm font-medium text-primary hover:underline">See all</Link>
        </div>
        {isLoading ? (
          <CardsSkeleton />
        ) : (data?.recommended_jobs?.length ?? 0) === 0 ? (
          <EmptyState
            icon={<Briefcase className="h-6 w-6" />}
            title="No recommendations yet"
            description="Add more skills to your profile to unlock personalized matches."
            action={<Button asChild><Link to="/profile">Update profile</Link></Button>}
          />
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {data!.recommended_jobs.map((j) => (
              <Link key={j.id} to="/jobs/$id" params={{ id: String(j.id) }} className="group rounded-xl border border-border bg-card p-5 transition-all hover:shadow-[var(--shadow-elegant)]">
                <div className="flex items-center justify-between">
                  <span className="rounded-full bg-primary/10 px-2 py-0.5 text-[10px] font-semibold uppercase text-primary">{j.job_type}</span>
                  {j.match_count != null && <span className="text-xs text-muted-foreground">{j.match_count} skill match</span>}
                </div>
                <h3 className="mt-2 font-semibold group-hover:text-primary">{j.title}</h3>
                <p className="text-sm text-muted-foreground">{j.company}{j.location ? ` · ${j.location}` : ""}</p>
                <div className="mt-3 flex flex-wrap gap-1">
                  {(j.required_skills || []).slice(0, 4).map((s) => (
                    <span key={s} className="rounded-md bg-muted px-2 py-0.5 text-xs">{s}</span>
                  ))}
                </div>
              </Link>
            ))}
          </div>
        )}
      </section>

      {/* Recent applications */}
      <section>
        <h2 className="mb-4 text-xl font-bold">Recent applications</h2>
        {isLoading ? (
          <TableSkeleton />
        ) : (data?.recent_applications?.length ?? 0) === 0 ? (
          <EmptyState title="No applications yet" description="Apply to jobs from the job board to see them here." />
        ) : (
          <div className="overflow-hidden rounded-xl border border-border bg-card">
            <table className="w-full text-sm">
              <thead className="bg-muted/50 text-left text-xs uppercase tracking-wide text-muted-foreground">
                <tr><th className="px-4 py-3">Job</th><th className="px-4 py-3">Company</th><th className="px-4 py-3">Applied</th><th className="px-4 py-3">Status</th></tr>
              </thead>
              <tbody>
                {data!.recent_applications.map((a) => (
                  <tr key={a.id} className="border-t border-border">
                    <td className="px-4 py-3 font-medium">{a.job?.title ?? `Job #${a.job_id}`}</td>
                    <td className="px-4 py-3 text-muted-foreground">{a.job?.company ?? "—"}</td>
                    <td className="px-4 py-3 text-muted-foreground">{new Date(a.applied_at).toLocaleDateString()}</td>
                    <td className="px-4 py-3"><StatusBadge status={a.status} /></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </div>
  );
}
