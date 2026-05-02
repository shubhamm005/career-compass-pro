import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import { AppShell } from "@/components/AppShell";
import { api } from "@/lib/api";
import type { Application, ApplicationStatus, Job } from "@/lib/types";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Plus, Briefcase } from "lucide-react";
import { TableSkeleton } from "@/components/Skeletons";
import { EmptyState } from "@/components/EmptyState";
import { StatusBadge } from "@/components/StatusBadge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";

export const Route = createFileRoute("/dashboard/officer")({
  component: () => (
    <ProtectedRoute roles={["placement_officer", "admin"]}>
      <AppShell><OfficerPage /></AppShell>
    </ProtectedRoute>
  ),
});

const STATUSES: ApplicationStatus[] = ["applied", "shortlisted", "interviewed", "placed", "rejected"];

function OfficerPage() {
  const [jobFilter, setJobFilter] = useState<string>("all");
  const qc = useQueryClient();

  const jobsQ = useQuery({ queryKey: ["jobs", "all"], queryFn: () => api<{ jobs: Job[] } | Job[]>("/jobs") });
  const apps = useQuery({
    queryKey: ["applications", jobFilter],
    queryFn: () => api<{ applications: Application[] } | Application[]>("/applications", {
      query: jobFilter !== "all" ? { job_id: jobFilter } : undefined,
    }),
  });

  const list: Application[] = Array.isArray(apps.data) ? apps.data : (apps.data as any)?.applications ?? [];
  const jobs: Job[] = Array.isArray(jobsQ.data) ? jobsQ.data : (jobsQ.data as any)?.jobs ?? [];

  const updateStatus = useMutation({
    mutationFn: ({ id, status }: { id: number; status: ApplicationStatus }) =>
      api(`/applications/${id}/status`, { method: "PUT", body: { status } }),
    onSuccess: () => {
      toast.success("Status updated");
      qc.invalidateQueries({ queryKey: ["applications"] });
    },
    onError: (e: any) => toast.error(e.message || "Update failed"),
  });

  return (
    <div className="mx-auto max-w-7xl space-y-8">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Officer panel</h1>
          <p className="text-sm text-muted-foreground">Manage jobs and applications.</p>
        </div>
        <div className="flex gap-2">
          <Button asChild><Link to="/officer/post-job"><Plus className="mr-1 h-4 w-4" />Post new job</Link></Button>
          <Button asChild variant="outline"><Link to="/officer/students">Students</Link></Button>
        </div>
      </div>

      <div className="rounded-xl border border-border bg-card">
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-border p-5">
          <h2 className="text-lg font-bold">Applications</h2>
          <div className="w-64">
            <Select value={jobFilter} onValueChange={setJobFilter}>
              <SelectTrigger><SelectValue placeholder="Filter by job" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All jobs</SelectItem>
                {jobs.map((j) => (
                  <SelectItem key={j.id} value={String(j.id)}>{j.title} · {j.company}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
        <div className="p-5">
          {apps.isLoading ? <TableSkeleton /> : list.length === 0 ? (
            <EmptyState
              icon={<Briefcase className="h-6 w-6" />}
              title="No applications"
              description="When students apply to jobs, they will show up here."
            />
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="text-left text-xs uppercase tracking-wide text-muted-foreground">
                  <tr><th className="py-2">Student</th><th>Job</th><th>Applied</th><th>Status</th><th>Update</th></tr>
                </thead>
                <tbody>
                  {list.map((a) => (
                    <tr key={a.id} className="border-t border-border">
                      <td className="py-3 font-medium">{a.student?.name ?? `#${a.student_id}`}</td>
                      <td className="py-3 text-muted-foreground">{a.job?.title ?? `Job #${a.job_id}`}</td>
                      <td className="py-3 text-muted-foreground">{new Date(a.applied_at).toLocaleDateString()}</td>
                      <td className="py-3"><StatusBadge status={a.status} /></td>
                      <td className="py-3">
                        <Select value={a.status} onValueChange={(v) => updateStatus.mutate({ id: a.id, status: v as ApplicationStatus })}>
                          <SelectTrigger className="h-8 w-36"><SelectValue /></SelectTrigger>
                          <SelectContent>
                            {STATUSES.map((s) => <SelectItem key={s} value={s}>{s}</SelectItem>)}
                          </SelectContent>
                        </Select>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
