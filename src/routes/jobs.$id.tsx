import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import { AppShell } from "@/components/AppShell";
import { api } from "@/lib/api";
import type { Job } from "@/lib/types";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Calendar, MapPin, Building2, Loader2, ArrowLeft, Users } from "lucide-react";
import { toast } from "sonner";
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { useAuth } from "@/lib/auth";

export const Route = createFileRoute("/jobs/$id")({
  component: () => (
    <ProtectedRoute>
      <AppShell><JobDetail /></AppShell>
    </ProtectedRoute>
  ),
});

function JobDetail() {
  const { id } = Route.useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const qc = useQueryClient();

  const { data, isLoading } = useQuery({
    queryKey: ["job", id],
    queryFn: () => api<{ job: Job } | Job>(`/jobs/${id}`).catch(async () => {
      // fallback: fetch all and find
      const all = await api<{ jobs: Job[] } | Job[]>("/jobs");
      const list = Array.isArray(all) ? all : (all as any).jobs;
      return list.find((j: Job) => String(j.id) === id) as Job;
    }),
  });
  const job: Job | undefined = (data as any)?.job ?? (data as any);

  const apply = useMutation({
    mutationFn: () => api(`/applications`, { method: "POST", body: { job_id: Number(id) } }),
    onSuccess: () => {
      toast.success("Application submitted!");
      qc.invalidateQueries({ queryKey: ["job", id] });
      qc.invalidateQueries({ queryKey: ["jobs"] });
    },
    onError: (e: any) => toast.error(e.message || "Could not apply"),
  });

  if (isLoading || !job) {
    return (
      <div className="mx-auto max-w-4xl space-y-4">
        <Skeleton className="h-8 w-1/3" />
        <Skeleton className="h-64 w-full" />
      </div>
    );
  }

  const canApply = user?.role === "student";

  return (
    <div className="mx-auto max-w-4xl space-y-6">
      <button onClick={() => navigate({ to: "/jobs" })} className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground">
        <ArrowLeft className="h-4 w-4" /> Back to jobs
      </button>

      <div className="rounded-2xl border border-border bg-card p-6 lg:p-8">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <span className="rounded-full bg-primary/10 px-2.5 py-0.5 text-xs font-semibold uppercase text-primary">{job.job_type}</span>
            <h1 className="mt-3 text-3xl font-bold tracking-tight">{job.title}</h1>
            <p className="mt-1 text-lg text-muted-foreground">{job.company}</p>
            <div className="mt-3 flex flex-wrap gap-4 text-sm text-muted-foreground">
              {job.location && <span className="inline-flex items-center gap-1"><MapPin className="h-4 w-4" />{job.location}</span>}
              {job.industry && <span className="inline-flex items-center gap-1"><Building2 className="h-4 w-4" />{job.industry}</span>}
              {job.deadline && <span className="inline-flex items-center gap-1"><Calendar className="h-4 w-4" />Apply by {new Date(job.deadline).toLocaleDateString()}</span>}
              {job.openings != null && <span className="inline-flex items-center gap-1"><Users className="h-4 w-4" />{job.openings} openings</span>}
            </div>
          </div>
          {canApply && (
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button size="lg" disabled={job.applied || apply.isPending}>
                  {apply.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  {job.applied ? "Already applied" : "Apply now"}
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Confirm application</AlertDialogTitle>
                  <AlertDialogDescription>
                    Submit your profile for <b>{job.title}</b> at <b>{job.company}</b>? You can track its status under My Applications.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                  <AlertDialogAction onClick={() => apply.mutate()}>Submit application</AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          )}
        </div>

        <div className="mt-8 grid gap-8 lg:grid-cols-3">
          <div className="lg:col-span-2 space-y-6">
            <section>
              <h2 className="text-lg font-bold">Job description</h2>
              <p className="mt-2 whitespace-pre-line text-sm leading-relaxed text-muted-foreground">
                {job.description || "No description provided."}
              </p>
            </section>
            <section>
              <h2 className="text-lg font-bold">Required skills</h2>
              <div className="mt-2 flex flex-wrap gap-1.5">
                {(job.required_skills || []).length === 0 && <p className="text-sm text-muted-foreground">No specific skills listed.</p>}
                {(job.required_skills || []).map((s) => (
                  <span key={s} className="rounded-md bg-primary/10 px-2.5 py-1 text-xs font-medium text-primary">{s}</span>
                ))}
              </div>
            </section>
          </div>
          <aside className="rounded-xl border border-border bg-muted/40 p-5">
            <h3 className="font-semibold">About {job.company}</h3>
            <p className="mt-2 text-sm text-muted-foreground">
              {job.industry ? `${job.industry} company.` : "Company information will appear here."}
            </p>
          </aside>
        </div>
      </div>
    </div>
  );
}
