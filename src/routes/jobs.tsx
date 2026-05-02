import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useState, useMemo } from "react";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import { AppShell } from "@/components/AppShell";
import { api } from "@/lib/api";
import type { Job } from "@/lib/types";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Search, MapPin, Briefcase, Calendar } from "lucide-react";
import { CardsSkeleton } from "@/components/Skeletons";
import { EmptyState } from "@/components/EmptyState";

export const Route = createFileRoute("/jobs")({
  component: () => (
    <ProtectedRoute>
      <AppShell><JobsPage /></AppShell>
    </ProtectedRoute>
  ),
});

const PAGE_SIZE = 10;

function JobsPage() {
  const [keyword, setKeyword] = useState("");
  const [type, setType] = useState<string>("all");
  const [industry, setIndustry] = useState("");
  const [location, setLocation] = useState("");
  const [page, setPage] = useState(1);

  const { data, isLoading } = useQuery({
    queryKey: ["jobs", { keyword, type, industry, location }],
    queryFn: () => api<{ jobs: Job[] } | Job[]>("/jobs", {
      query: {
        keyword: keyword || undefined,
        job_type: type !== "all" ? type : undefined,
        industry: industry || undefined,
        location: location || undefined,
      },
    }),
  });

  const jobs: Job[] = Array.isArray(data) ? data : (data as any)?.jobs ?? [];

  const paged = useMemo(() => jobs.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE), [jobs, page]);
  const totalPages = Math.max(1, Math.ceil(jobs.length / PAGE_SIZE));

  return (
    <div className="mx-auto max-w-7xl space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Job board</h1>
        <p className="text-sm text-muted-foreground">{jobs.length} opportunities open right now.</p>
      </div>

      <div className="rounded-xl border border-border bg-card p-4">
        <div className="grid gap-3 md:grid-cols-4">
          <div className="relative md:col-span-2">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input className="pl-9" placeholder="Search title, company, skill..." value={keyword} onChange={(e) => { setKeyword(e.target.value); setPage(1); }} />
          </div>
          <Select value={type} onValueChange={(v) => { setType(v); setPage(1); }}>
            <SelectTrigger><SelectValue placeholder="Type" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All types</SelectItem>
              <SelectItem value="fulltime">Full-time</SelectItem>
              <SelectItem value="internship">Internship</SelectItem>
              <SelectItem value="parttime">Part-time</SelectItem>
            </SelectContent>
          </Select>
          <Input placeholder="Location" value={location} onChange={(e) => { setLocation(e.target.value); setPage(1); }} />
          <Input placeholder="Industry" value={industry} onChange={(e) => { setIndustry(e.target.value); setPage(1); }} className="md:col-span-4" />
        </div>
      </div>

      {isLoading ? (
        <CardsSkeleton count={6} />
      ) : jobs.length === 0 ? (
        <EmptyState icon={<Briefcase className="h-6 w-6" />} title="No jobs match your filters" description="Try clearing filters or broaden your search." />
      ) : (
        <>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {paged.map((j) => (
              <Link key={j.id} to="/jobs/$id" params={{ id: String(j.id) }} className="group flex flex-col rounded-xl border border-border bg-card p-5 transition-all hover:shadow-[var(--shadow-elegant)]">
                <div className="flex items-center justify-between">
                  <span className="rounded-full bg-primary/10 px-2 py-0.5 text-[10px] font-semibold uppercase text-primary">{j.job_type}</span>
                  {j.deadline && (
                    <span className="inline-flex items-center gap-1 text-xs text-muted-foreground">
                      <Calendar className="h-3 w-3" /> {new Date(j.deadline).toLocaleDateString()}
                    </span>
                  )}
                </div>
                <h3 className="mt-2 text-lg font-semibold group-hover:text-primary">{j.title}</h3>
                <p className="text-sm font-medium text-muted-foreground">{j.company}</p>
                {j.location && <p className="mt-1 inline-flex items-center gap-1 text-xs text-muted-foreground"><MapPin className="h-3 w-3" />{j.location}</p>}
                <div className="mt-3 flex flex-wrap gap-1">
                  {(j.required_skills || []).slice(0, 5).map((s) => (
                    <span key={s} className="rounded-md bg-muted px-2 py-0.5 text-xs">{s}</span>
                  ))}
                </div>
                <div className="mt-4 flex-1" />
                <Button size="sm" disabled={j.applied} variant={j.applied ? "secondary" : "default"} className="w-fit">
                  {j.applied ? "Applied" : "View & apply"}
                </Button>
              </Link>
            ))}
          </div>
          {totalPages > 1 && (
            <div className="flex items-center justify-between">
              <p className="text-sm text-muted-foreground">Page {page} of {totalPages}</p>
              <div className="flex gap-2">
                <Button variant="outline" size="sm" disabled={page <= 1} onClick={() => setPage(page - 1)}>Previous</Button>
                <Button variant="outline" size="sm" disabled={page >= totalPages} onClick={() => setPage(page + 1)}>Next</Button>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}
