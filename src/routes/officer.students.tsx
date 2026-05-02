import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useMemo, useState } from "react";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import { AppShell } from "@/components/AppShell";
import { api } from "@/lib/api";
import type { StudentProfile, Segment } from "@/lib/types";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { TableSkeleton } from "@/components/Skeletons";
import { EmptyState } from "@/components/EmptyState";
import { SegmentBadge } from "@/components/SegmentBadge";
import { Search, Users } from "lucide-react";
import { Button } from "@/components/ui/button";

export const Route = createFileRoute("/officer/students")({
  component: () => (
    <ProtectedRoute roles={["placement_officer", "admin"]}>
      <AppShell><StudentsPage /></AppShell>
    </ProtectedRoute>
  ),
});

function StudentsPage() {
  const [search, setSearch] = useState("");
  const [seg, setSeg] = useState<string>("all");
  const [page, setPage] = useState(1);
  const PAGE = 10;

  const { data, isLoading } = useQuery({
    queryKey: ["students"],
    queryFn: () => api<{ students: StudentProfile[] } | StudentProfile[]>("/students"),
  });

  const all: StudentProfile[] = Array.isArray(data) ? data : (data as any)?.students ?? [];

  const filtered = useMemo(() => {
    const q = search.toLowerCase().trim();
    return all.filter((s) => {
      if (seg !== "all" && s.segment !== seg) return false;
      if (!q) return true;
      const inSkills = (s.skills || []).some((k) => k.toLowerCase().includes(q));
      return (s.name || "").toLowerCase().includes(q) ||
        (s.email || "").toLowerCase().includes(q) ||
        (s.degree || "").toLowerCase().includes(q) ||
        inSkills;
    });
  }, [all, search, seg]);

  const paged = filtered.slice((page - 1) * PAGE, page * PAGE);
  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE));

  return (
    <div className="mx-auto max-w-7xl space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Students</h1>
        <p className="text-sm text-muted-foreground">{filtered.length} of {all.length} students</p>
      </div>

      <div className="flex flex-wrap gap-3">
        <div className="relative flex-1 min-w-[260px]">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input className="pl-9" placeholder="Search name, email, skill..." value={search} onChange={(e) => { setSearch(e.target.value); setPage(1); }} />
        </div>
        <Select value={seg} onValueChange={(v) => { setSeg(v); setPage(1); }}>
          <SelectTrigger className="w-52"><SelectValue placeholder="Segment" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All segments</SelectItem>
            <SelectItem value="fresher">Fresher</SelectItem>
            <SelectItem value="skilled">Skilled</SelectItem>
            <SelectItem value="placement_ready">Placement Ready</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {isLoading ? <TableSkeleton /> : filtered.length === 0 ? (
        <EmptyState icon={<Users className="h-6 w-6" />} title="No students match" description="Try clearing filters." />
      ) : (
        <div className="overflow-hidden rounded-xl border border-border bg-card">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-muted/50 text-left text-xs uppercase tracking-wide text-muted-foreground">
                <tr><th className="px-4 py-3">Name</th><th className="px-4 py-3">Email</th><th className="px-4 py-3">Degree</th><th className="px-4 py-3">CGPA</th><th className="px-4 py-3">Skills</th><th className="px-4 py-3">Segment</th></tr>
              </thead>
              <tbody>
                {paged.map((s) => (
                  <tr key={s.id} className="border-t border-border">
                    <td className="px-4 py-3 font-medium">{s.name ?? "—"}</td>
                    <td className="px-4 py-3 text-muted-foreground">{s.email ?? "—"}</td>
                    <td className="px-4 py-3 text-muted-foreground">{s.degree ?? "—"}</td>
                    <td className="px-4 py-3 text-muted-foreground">{s.cgpa ?? "—"}</td>
                    <td className="px-4 py-3">
                      <div className="flex flex-wrap gap-1">
                        {(s.skills || []).slice(0, 4).map((sk) => (
                          <span key={sk} className="rounded-md bg-muted px-2 py-0.5 text-xs">{sk}</span>
                        ))}
                      </div>
                    </td>
                    <td className="px-4 py-3"><SegmentBadge segment={(s.segment as Segment) || "fresher"} /></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
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
