import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useMutation } from "@tanstack/react-query";
import { useState } from "react";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import { AppShell } from "@/components/AppShell";
import { api } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";
import { Loader2, X } from "lucide-react";

export const Route = createFileRoute("/officer/post-job")({
  component: () => (
    <ProtectedRoute roles={["placement_officer", "admin"]}>
      <AppShell><PostJob /></AppShell>
    </ProtectedRoute>
  ),
});

function PostJob() {
  const navigate = useNavigate();
  const [form, setForm] = useState({
    title: "", company: "", description: "", location: "",
    job_type: "fulltime", industry: "", openings: 1, deadline: "",
  });
  const [skills, setSkills] = useState<string[]>([]);
  const [draft, setDraft] = useState("");

  const create = useMutation({
    mutationFn: () => api("/jobs", { method: "POST", body: { ...form, required_skills: skills } }),
    onSuccess: () => { toast.success("Job posted"); navigate({ to: "/jobs" }); },
    onError: (e: any) => toast.error(e.message || "Failed to post"),
  });

  const addSkill = () => {
    const t = draft.trim();
    if (t && !skills.includes(t)) setSkills([...skills, t]);
    setDraft("");
  };

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Post a new job</h1>
        <p className="text-sm text-muted-foreground">Fill in details to publish to the job board.</p>
      </div>

      <form onSubmit={(e) => { e.preventDefault(); create.mutate(); }} className="space-y-5 rounded-2xl border border-border bg-card p-6">
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-1.5 sm:col-span-2"><Label>Job title</Label><Input required value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} /></div>
          <div className="space-y-1.5"><Label>Company</Label><Input required value={form.company} onChange={(e) => setForm({ ...form, company: e.target.value })} /></div>
          <div className="space-y-1.5"><Label>Industry</Label><Input value={form.industry} onChange={(e) => setForm({ ...form, industry: e.target.value })} /></div>
          <div className="space-y-1.5"><Label>Location</Label><Input value={form.location} onChange={(e) => setForm({ ...form, location: e.target.value })} /></div>
          <div className="space-y-1.5">
            <Label>Type</Label>
            <Select value={form.job_type} onValueChange={(v) => setForm({ ...form, job_type: v })}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="fulltime">Full-time</SelectItem>
                <SelectItem value="internship">Internship</SelectItem>
                <SelectItem value="parttime">Part-time</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-1.5"><Label>Openings</Label><Input type="number" min={1} value={form.openings} onChange={(e) => setForm({ ...form, openings: Number(e.target.value) })} /></div>
          <div className="space-y-1.5"><Label>Deadline</Label><Input type="date" value={form.deadline} onChange={(e) => setForm({ ...form, deadline: e.target.value })} /></div>
        </div>

        <div className="space-y-1.5">
          <Label>Description</Label>
          <Textarea rows={5} required value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} />
        </div>

        <div className="space-y-1.5">
          <Label>Required skills</Label>
          <div className="rounded-md border border-input bg-background p-2">
            <div className="flex flex-wrap gap-1.5">
              {skills.map((s) => (
                <span key={s} className="inline-flex items-center gap-1 rounded-md bg-primary/10 px-2 py-0.5 text-xs text-primary">
                  {s}<button type="button" onClick={() => setSkills(skills.filter((x) => x !== s))}><X className="h-3 w-3" /></button>
                </span>
              ))}
              <input
                value={draft}
                onChange={(e) => setDraft(e.target.value)}
                onKeyDown={(e) => { if (e.key === "Enter" || e.key === ",") { e.preventDefault(); addSkill(); } }}
                onBlur={addSkill}
                placeholder="Add skill, press Enter"
                className="flex-1 min-w-[140px] bg-transparent px-1 py-0.5 text-sm outline-none"
              />
            </div>
          </div>
        </div>

        <div className="flex justify-end gap-2 border-t border-border pt-4">
          <Button type="button" variant="outline" onClick={() => navigate({ to: "/jobs" })}>Cancel</Button>
          <Button type="submit" disabled={create.isPending}>
            {create.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}Publish job
          </Button>
        </div>
      </form>
    </div>
  );
}
