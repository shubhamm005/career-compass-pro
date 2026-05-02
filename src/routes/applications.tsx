import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import { AppShell } from "@/components/AppShell";
import { useAuth } from "@/lib/auth";
import { api } from "@/lib/api";
import type { Application } from "@/lib/types";
import { TableSkeleton } from "@/components/Skeletons";
import { EmptyState } from "@/components/EmptyState";
import { StatusBadge } from "@/components/StatusBadge";
import { Button } from "@/components/ui/button";
import { useState, useMemo } from "react";

export const Route = createFileRoute("/applications")({
  component: () => (
    <ProtectedRoute roles={["student"]}>
      <AppShell><MyApplications /></AppShell>
    </ProtectedRoute>
  ),
});

function MyApplications() {
  const { user } = useAuth();
  const [page, setPage] = useState(1);

  const { data, isLoading } = useQuery({
    queryKey: ["my-applications", user!.id],
    queryFn: () => api<{ applications: Application[] } | Application[]>(`/students/${user!.id}/applications`),
  });

  const list: Application[] = Array.isArray(data) ? data : (data as any)?.applications ?? [];
  const PAGE = 10;
  const paged = useMemo(() => list.slice((page - 1) * PAGE, page * PAGE), [list, page]);
  const totalPages = Math.max(1, Math.ceil(list.length / PAGE));

  return (
    <div className="mx-auto max-w-6xl space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">My applications</h1>
        <p className="text-sm text-muted-foreground">{list.length} total</p>
      </div>

      {isLoading ? <TableSkeleton /> : list.length === 0 ? (
        <EmptyState
          title="No applications yet"
          description="Browse the job board and apply to jobs that fit your profile."
          action={<Button asChild><Link to="/jobs">Browse jobs</Link></Button>}
        />
      ) : (
        <div className="overflow-hidden rounded-xl border border-border bg-card">
          <table className="w-full text-sm">
            <thead className="bg-muted/50 text-left text-xs uppercase tracking-wide text-muted-foreground">
              <tr><th className="px-4 py-3">Job title</th><th className="px-4 py-3">Company</th><th className="px-4 py-3">Applied</th><th className="px-4 py-3">Status</th></tr>
            </thead>
            <tbody>
              {paged.map((a) => (
                <tr key={a.id} className="border-t border-border hover:bg-muted/30">
                  <td className="px-4 py-3 font-medium">{a.job?.title ?? `Job #${a.job_id}`}</td>
                  <td className="px-4 py-3 text-muted-foreground">{a.job?.company ?? "—"}</td>
                  <td className="px-4 py-3 text-muted-foreground">{new Date(a.applied_at).toLocaleDateString()}</td>
                  <td className="px-4 py-3"><StatusBadge status={a.status} /></td>
                </tr>
              ))}
            </tbody>
          </table>
          {totalPages > 1 && (
            <div className="flex items-center justify-between border-t border-border px-4 py-3">
              <p className="text-xs text-muted-foreground">Page {page} of {totalPages}</p>
              <div className="flex gap-2">
                <Button variant="outline" size="sm" disabled={page <= 1} onClick={() => setPage(page - 1)}>Previous</Button>
                <Button variant="outline" size="sm" disabled={page >= totalPages} onClick={() => setPage(page + 1)}>Next</Button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
