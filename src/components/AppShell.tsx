import { Link, useRouterState, useNavigate } from "@tanstack/react-router";
import {
  LayoutDashboard, Briefcase, FileText, Bell, User, Users, PlusSquare,
  LogOut, Menu, GraduationCap, X,
} from "lucide-react";
import { useState, type ReactNode } from "react";
import { cn } from "@/lib/utils";
import { useAuth } from "@/lib/auth";
import { Button } from "@/components/ui/button";

type NavItem = { to: string; label: string; icon: any };

const studentNav: NavItem[] = [
  { to: "/dashboard/student", label: "Dashboard", icon: LayoutDashboard },
  { to: "/jobs", label: "Browse Jobs", icon: Briefcase },
  { to: "/applications", label: "My Applications", icon: FileText },
  { to: "/profile", label: "My Profile", icon: User },
  { to: "/notifications", label: "Notifications", icon: Bell },
];

const officerNav: NavItem[] = [
  { to: "/dashboard/officer", label: "Dashboard", icon: LayoutDashboard },
  { to: "/jobs", label: "All Jobs", icon: Briefcase },
  { to: "/officer/post-job", label: "Post Job", icon: PlusSquare },
  { to: "/officer/students", label: "Students", icon: Users },
  { to: "/notifications", label: "Notifications", icon: Bell },
];

const adminNav: NavItem[] = [
  { to: "/dashboard/admin", label: "Dashboard", icon: LayoutDashboard },
  { to: "/jobs", label: "Jobs", icon: Briefcase },
  { to: "/officer/post-job", label: "Post Job", icon: PlusSquare },
  { to: "/officer/students", label: "Students", icon: Users },
  { to: "/notifications", label: "Notifications", icon: Bell },
];

function navFor(role?: string) {
  if (role === "admin") return adminNav;
  if (role === "placement_officer") return officerNav;
  return studentNav;
}

export function AppShell({ children }: { children: ReactNode }) {
  const { user, logout } = useAuth();
  const path = useRouterState({ select: (s) => s.location.pathname });
  const [open, setOpen] = useState(false);
  const navigate = useNavigate();
  const items = navFor(user?.role);

  if (!user) return <>{children}</>;

  return (
    <div className="flex min-h-screen w-full bg-background">
      {/* Sidebar */}
      <aside
        className={cn(
          "fixed inset-y-0 left-0 z-40 flex w-64 flex-col bg-sidebar text-sidebar-foreground transition-transform lg:static lg:translate-x-0",
          open ? "translate-x-0" : "-translate-x-full",
        )}
      >
        <div className="flex h-16 items-center justify-between gap-2 px-5 border-b border-sidebar-border">
          <button
            onClick={() => navigate({ to: "/" })}
            className="flex items-center gap-2 font-bold tracking-tight"
          >
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-sidebar-primary text-sidebar-primary-foreground">
              <GraduationCap className="h-5 w-5" />
            </div>
            <span>CareerCRM</span>
          </button>
          <button onClick={() => setOpen(false)} className="lg:hidden">
            <X className="h-5 w-5" />
          </button>
        </div>
        <nav className="flex-1 space-y-1 overflow-y-auto p-3">
          {items.map((it) => {
            const active = path === it.to || (it.to !== "/" && path.startsWith(it.to));
            return (
              <Link
                key={it.to}
                to={it.to}
                onClick={() => setOpen(false)}
                className={cn(
                  "flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors",
                  active
                    ? "bg-sidebar-primary text-sidebar-primary-foreground"
                    : "text-sidebar-foreground/80 hover:bg-sidebar-accent hover:text-sidebar-accent-foreground",
                )}
              >
                <it.icon className="h-4 w-4" />
                {it.label}
              </Link>
            );
          })}
        </nav>
        <div className="border-t border-sidebar-border p-3">
          <div className="mb-2 rounded-lg bg-sidebar-accent px-3 py-2">
            <p className="truncate text-sm font-semibold">{user.name}</p>
            <p className="truncate text-xs text-sidebar-foreground/70">{user.email}</p>
            <p className="mt-1 inline-block rounded-full bg-sidebar-primary/20 px-2 py-0.5 text-[10px] uppercase tracking-wide text-sidebar-primary-foreground/90">
              {user.role.replace("_", " ")}
            </p>
          </div>
          <button
            onClick={logout}
            className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-sm text-sidebar-foreground/80 hover:bg-sidebar-accent"
          >
            <LogOut className="h-4 w-4" /> Logout
          </button>
        </div>
      </aside>

      {open && (
        <div
          className="fixed inset-0 z-30 bg-black/50 lg:hidden"
          onClick={() => setOpen(false)}
        />
      )}

      <div className="flex min-h-screen flex-1 flex-col lg:ml-0">
        <header className="sticky top-0 z-20 flex h-16 items-center gap-3 border-b border-border bg-background/80 px-4 backdrop-blur lg:px-8">
          <Button variant="ghost" size="icon" className="lg:hidden" onClick={() => setOpen(true)}>
            <Menu className="h-5 w-5" />
          </Button>
          <div className="flex-1" />
        </header>
        <main className="flex-1 p-4 lg:p-8">{children}</main>
      </div>
    </div>
  );
}
