import { cn } from "@/lib/utils";
import type { ApplicationStatus } from "@/lib/types";

const map: Record<ApplicationStatus, { label: string; cls: string }> = {
  applied: { label: "Applied", cls: "bg-info/15 text-info border-info/30" },
  shortlisted: { label: "Shortlisted", cls: "bg-warning/15 text-warning border-warning/30" },
  interviewed: { label: "Interviewed", cls: "bg-purple/15 text-purple border-purple/30" },
  placed: { label: "Placed", cls: "bg-success/15 text-success border-success/30" },
  rejected: { label: "Rejected", cls: "bg-destructive/15 text-destructive border-destructive/30" },
};

export function StatusBadge({ status }: { status: ApplicationStatus }) {
  const m = map[status] ?? { label: status, cls: "bg-muted text-muted-foreground border-border" };
  return (
    <span className={cn("inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-medium", m.cls)}>
      {m.label}
    </span>
  );
}
