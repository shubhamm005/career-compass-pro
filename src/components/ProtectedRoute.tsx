import { Navigate } from "@tanstack/react-router";
import { type ReactNode } from "react";
import { useAuth, dashboardPathFor } from "@/lib/auth";

export function ProtectedRoute({
  children,
  roles,
}: {
  children: ReactNode;
  roles?: Array<"student" | "placement_officer" | "admin">;
}) {
  const { user, loading } = useAuth();
  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-primary border-t-transparent" />
      </div>
    );
  }
  if (!user) return <Navigate to="/login" />;
  if (roles && !roles.includes(user.role)) {
    return <Navigate to={dashboardPathFor(user.role)} />;
  }
  return <>{children}</>;
}
