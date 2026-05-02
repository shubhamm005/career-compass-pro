import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useEffect, useState } from "react";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import { AppShell } from "@/components/AppShell";
import { useAuth } from "@/lib/auth";
import { api } from "@/lib/api";
import type { StudentProfile } from "@/lib/types";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { SegmentBadge } from "@/components/SegmentBadge";
import { calcSegment } from "@/lib/segment";
import { toast } from "sonner";
import { X, Loader2 } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";

export const Route = createFileRoute("/profile")({
  component: () => (
    <ProtectedRoute roles={["student"]}>
      <AppShell><ProfilePage /></AppShell>
    </ProtectedRoute>
  ),
});

function TagInput({ value, onChange, placeholder }: { value: string[]; onChange: (v: string[]) => void; placeholder: string }) {
  const [draft, setDraft] = useState("");
  const add = () => {
    const t = draft.trim();
    if (!t) return;
    if (!value.includes(t)) onChange([...value, t]);
    setDraft("");
  };
  return (
    <div className="rounded-md border border-input bg-background p-2">
      <div className="flex flex-wrap gap-1.5">
        {value.map((t) => (
          <span key={t} className="inline-flex items-center gap-1 rounded-md bg-primary/10 px-2 py-0.5 text-xs text-primary">
            {t}
            <button type="button" onClick={() => onChange(value.filter((x) => x !== t))}><X className="h-3 w-3" /></button>
          </span>
        ))}
        <input
          className="flex-1 min-w-[120px] bg-transparent px-1 py-0.5 text-sm outline-none"
          placeholder={placeholder}
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter" || e.key === ",") { e.preventDefault(); add(); }
            if (e.key === "Backspace" && !draft && value.length) onChange(value.slice(0, -1));
          }}
          onBlur={add}
        />
      </div>
    </div>
  );
}

function ProfilePage() {
  const { user } = useAuth();
  const id = user!.id;
  const qc = useQueryClient();
  const navigate = useNavigate();

  const { data, isLoading } = useQuery({
    queryKey: ["student", id],
    queryFn: () => api<{ student: StudentProfile } | StudentProfile>(`/students/${id}`),
  });
  const profile: StudentProfile | undefined = (data as any)?.student ?? (data as any);

  const [form, setForm] = useState<Partial<StudentProfile>>({
    phone: "", degree: "", branch: "", graduation_year: new Date().getFullYear() + 1,
    cgpa: 0, bio: "", skills: [], career_interests: [], resume_url: "",
  });

  useEffect(() => {
    if (profile) setForm({
      phone: profile.phone || "",
      degree: profile.degree || "",
      branch: profile.branch || "",
      graduation_year: profile.graduation_year || new Date().getFullYear() + 1,
      cgpa: profile.cgpa || 0,
      bio: profile.bio || "",
      skills: profile.skills || [],
      career_interests: profile.career_interests || [],
      resume_url: profile.resume_url || "",
    });
  }, [profile]);

  const segment = calcSegment(form);

  const save = useMutation({
    mutationFn: () => api(`/students/${id}`, { method: "PUT", body: { ...form, segment } }),
    onSuccess: () => {
      toast.success("Profile saved");
      qc.invalidateQueries({ queryKey: ["student", id] });
      qc.invalidateQueries({ queryKey: ["dashboard-student"] });
    },
    onError: (e: any) => toast.error(e.message || "Save failed"),
  });

  if (isLoading) {
    return (
      <div className="mx-auto max-w-3xl space-y-4">
        <Skeleton className="h-10 w-1/3" />
        <Skeleton className="h-64 w-full" />
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">My profile</h1>
          <p className="text-sm text-muted-foreground">Keep your details up to date — this powers your job recommendations.</p>
        </div>
        <SegmentBadge segment={segment} />
      </div>

      <form
        onSubmit={(e) => { e.preventDefault(); save.mutate(); }}
        className="space-y-6 rounded-2xl border border-border bg-card p-6"
      >
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Full name"><Input value={user!.name} disabled /></Field>
          <Field label="Email"><Input value={user!.email} disabled /></Field>
          <Field label="Phone"><Input value={form.phone || ""} onChange={(e) => setForm({ ...form, phone: e.target.value })} /></Field>
          <Field label="Degree"><Input value={form.degree || ""} onChange={(e) => setForm({ ...form, degree: e.target.value })} placeholder="B.Tech, M.Sc..." /></Field>
          <Field label="Branch"><Input value={form.branch || ""} onChange={(e) => setForm({ ...form, branch: e.target.value })} placeholder="Computer Science" /></Field>
          <Field label="Graduation year">
            <Select value={String(form.graduation_year ?? "")} onValueChange={(v) => setForm({ ...form, graduation_year: Number(v) })}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                {Array.from({ length: 8 }, (_, i) => new Date().getFullYear() - 2 + i).map((y) => (
                  <SelectItem key={y} value={String(y)}>{y}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </Field>
          <Field label="CGPA"><Input type="number" step="0.01" min={0} max={10} value={form.cgpa ?? 0} onChange={(e) => setForm({ ...form, cgpa: Number(e.target.value) })} /></Field>
          <Field label="Resume URL"><Input value={form.resume_url || ""} onChange={(e) => setForm({ ...form, resume_url: e.target.value })} placeholder="https://..." /></Field>
        </div>

        <Field label="Bio">
          <Textarea rows={3} value={form.bio || ""} onChange={(e) => setForm({ ...form, bio: e.target.value })} placeholder="Short summary about yourself..." />
        </Field>

        <Field label="Skills" hint="Press Enter or comma to add">
          <TagInput value={form.skills || []} onChange={(v) => setForm({ ...form, skills: v })} placeholder="React, SQL, Python..." />
        </Field>
        <Field label="Career interests">
          <TagInput value={form.career_interests || []} onChange={(v) => setForm({ ...form, career_interests: v })} placeholder="Frontend, Data Science..." />
        </Field>

        <div className="flex items-center justify-between border-t border-border pt-4">
          <p className="text-sm text-muted-foreground">Segment recalculates as you edit.</p>
          <div className="flex gap-2">
            <Button type="button" variant="outline" onClick={() => navigate({ to: "/dashboard/student" })}>Cancel</Button>
            <Button type="submit" disabled={save.isPending}>
              {save.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}Save profile
            </Button>
          </div>
        </div>
      </form>
    </div>
  );
}

function Field({ label, hint, children }: { label: string; hint?: string; children: React.ReactNode }) {
  return (
    <div className="space-y-1.5">
      <Label>{label}</Label>
      {children}
      {hint && <p className="text-xs text-muted-foreground">{hint}</p>}
    </div>
  );
}
