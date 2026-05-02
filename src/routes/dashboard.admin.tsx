import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import { AppShell } from "@/components/AppShell";
import { api } from "@/lib/api";
import type { AdminDashboard } from "@/lib/types";
import { CardsSkeleton, TableSkeleton } from "@/components/Skeletons";
import { StatusBadge } from "@/components/StatusBadge";
import { EmptyState } from "@/components/EmptyState";
import { Button } from "@/components/ui/button";
import { Users, CheckCircle2, Briefcase, FileText, Plus } from "lucide-react";
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from "recharts";

export const Route = createFileRoute("/dashboard/admin")({
  component: () => (
    <ProtectedRoute roles={["admin"]}>
      <AppShell><AdminPage /></AppShell>
    </ProtectedRoute>
  ),
});

function StatCard({ icon: Icon, label, value, tone }: any) {
  return (
    <div className="rounded-xl border border-border bg-card p-5 shadow-[var(--shadow-card)]">
      <div className="flex items-center justify-between">
        <p className="text-sm font-medium text-muted-foreground">{label}</p>
        <div className={`flex h-9 w-9 items-center justify-center rounded-lg ${tone}`}><Icon className="h-4 w-4" /></div>
      </div>
      <p className="mt-3 text-3xl font-bold tracking-tight">{value ?? 0}</p>
    </div>
  );
}

function AdminPage() {
  const { data, isLoading } = useQuery({
    queryKey: ["dashboard-admin"],
    queryFn: () => api<AdminDashboard>("/dashboard/admin"),
  });

  const segData = [
    { name: "Fresher", value: data?.segments?.fresher ?? 0, color: "var(--color-info)" },
    { name: "Skilled", value: data?.segments?.skilled ?? 0, color: "var(--color-warning)" },
    { name: "Placement Ready", value: data?.segments?.placement_ready ?? 0, color: "var(--color-success)" },
  ];

  return (
    <div className="mx-auto max-w-7xl space-y-8">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Admin overview</h1>
          <p className="text-sm text-muted-foreground">Placement metrics across the institution.</p>
        </div>
        <div className="flex gap-2">
          <Button asChild variant="outline"><Link to="/officer/students">View students</Link></Button>
          <Button asChild><Link to="/officer/post-job"><Plus className="mr-1 h-4 w-4" />Post job</Link></Button>
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard icon={Users} label="Total students" value={data?.total_students} tone="bg-info/15 text-info" />
        <StatCard icon={CheckCircle2} label="Placed students" value={data?.placed_students} tone="bg-success/15 text-success" />
        <StatCard icon={Briefcase} label="Active jobs" value={data?.active_jobs} tone="bg-purple/15 text-purple" />
        <StatCard icon={FileText} label="Pending apps" value={data?.pending_applications} tone="bg-warning/15 text-warning" />
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="rounded-xl border border-border bg-card p-6 lg:col-span-1">
          <h2 className="text-lg font-bold">Student segmentation</h2>
          <p className="text-sm text-muted-foreground">Distribution by readiness.</p>
          <div className="mt-4 h-64">
            {isLoading ? (
              <div className="h-full w-full animate-pulse rounded-lg bg-muted" />
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie data={segData} dataKey="value" innerRadius={50} outerRadius={85} paddingAngle={3}>
                    {segData.map((s) => <Cell key={s.name} fill={s.color} />)}
                  </Pie>
                  <Tooltip />
                  <Legend verticalAlign="bottom" height={36} />
                </PieChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>

        <div className="rounded-xl border border-border bg-card lg:col-span-2">
          <div className="flex items-center justify-between border-b border-border p-5">
            <h2 className="text-lg font-bold">Recent applications</h2>
            <Button size="sm" variant="outline" onClick={() => exportCsv(data?.recent_applications ?? [])}>
              Export CSV
            </Button>
          </div>
          <div className="p-5">
            {isLoading ? <TableSkeleton /> : (data?.recent_applications?.length ?? 0) === 0 ? (
              <EmptyState title="No applications yet" />
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead className="text-left text-xs uppercase tracking-wide text-muted-foreground">
                    <tr><th className="py-2">Student</th><th>Job</th><th>Date</th><th>Status</th></tr>
                  </thead>
                  <tbody>
                    {data!.recent_applications.map((a) => (
                      <tr key={a.id} className="border-t border-border">
                        <td className="py-3 font-medium">{a.student?.name ?? `#${a.student_id}`}</td>
                        <td className="py-3 text-muted-foreground">{a.job?.title ?? `Job #${a.job_id}`}</td>
                        <td className="py-3 text-muted-foreground">{new Date(a.applied_at).toLocaleDateString()}</td>
                        <td className="py-3"><StatusBadge status={a.status} /></td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

function exportCsv(rows: any[]) {
  if (!rows.length) return;
  const header = ["id", "student", "job", "company", "status", "applied_at"];
  const csv = [
    header.join(","),
    ...rows.map((a) =>
      [a.id, a.student?.name ?? a.student_id, a.job?.title ?? a.job_id, a.job?.company ?? "", a.status, a.applied_at]
        .map((v) => `"${String(v ?? "").replace(/"/g, '""')}"`).join(","),
    ),
  ].join("\n");
  const blob = new Blob([csv], { type: "text/csv;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url; a.download = "applications.csv"; a.click();
  URL.revokeObjectURL(url);
}
