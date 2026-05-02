import { createFileRoute } from "@tanstack/react-router";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import { AppShell } from "@/components/AppShell";
import { api } from "@/lib/api";
import type { Notification } from "@/lib/types";
import { TableSkeleton } from "@/components/Skeletons";
import { EmptyState } from "@/components/EmptyState";
import { Button } from "@/components/ui/button";
import { Bell, BellRing, CheckCheck } from "lucide-react";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

export const Route = createFileRoute("/notifications")({
  component: () => (
    <ProtectedRoute>
      <AppShell><NotificationsPage /></AppShell>
    </ProtectedRoute>
  ),
});

const typeIcon: Record<string, string> = {
  job_alert: "bg-info/15 text-info",
  interview: "bg-purple/15 text-purple",
  deadline: "bg-warning/15 text-warning",
  general: "bg-muted text-muted-foreground",
};

function NotificationsPage() {
  const qc = useQueryClient();
  const { data, isLoading } = useQuery({
    queryKey: ["notifications"],
    queryFn: () => api<{ notifications: Notification[] } | Notification[]>("/notifications"),
  });
  const list: Notification[] = Array.isArray(data) ? data : (data as any)?.notifications ?? [];

  const markRead = useMutation({
    mutationFn: (id: number) => api(`/notifications/${id}/read`, { method: "PUT" }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["notifications"] }),
  });

  const markAll = useMutation({
    mutationFn: () => api(`/notifications/read-all`, { method: "PUT" }),
    onSuccess: () => { toast.success("All marked as read"); qc.invalidateQueries({ queryKey: ["notifications"] }); },
    onError: (e: any) => toast.error(e.message || "Failed"),
  });

  const unread = list.filter((n) => !n.is_read).length;

  return (
    <div className="mx-auto max-w-4xl space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Notifications</h1>
          <p className="text-sm text-muted-foreground">{unread} unread of {list.length}</p>
        </div>
        {unread > 0 && (
          <Button variant="outline" onClick={() => markAll.mutate()}>
            <CheckCheck className="mr-2 h-4 w-4" /> Mark all as read
          </Button>
        )}
      </div>

      {isLoading ? <TableSkeleton /> : list.length === 0 ? (
        <EmptyState icon={<Bell className="h-6 w-6" />} title="You're all caught up" description="New job alerts and updates will appear here." />
      ) : (
        <div className="space-y-2">
          {list.map((n) => (
            <button
              key={n.id}
              onClick={() => !n.is_read && markRead.mutate(n.id)}
              className={cn(
                "flex w-full items-start gap-3 rounded-xl border p-4 text-left transition-colors",
                n.is_read ? "border-border bg-card" : "border-primary/30 bg-primary/5 hover:bg-primary/10",
              )}
            >
              <div className={cn("flex h-9 w-9 shrink-0 items-center justify-center rounded-lg", typeIcon[n.type] ?? typeIcon.general)}>
                <BellRing className="h-4 w-4" />
              </div>
              <div className="flex-1">
                <p className={cn("text-sm", !n.is_read && "font-semibold")}>{n.message}</p>
                <p className="mt-1 text-xs text-muted-foreground">{new Date(n.created_at).toLocaleString()} · {n.type.replace("_", " ")}</p>
              </div>
              {!n.is_read && <span className="mt-1 h-2 w-2 shrink-0 rounded-full bg-primary" />}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
