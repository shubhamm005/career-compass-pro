import { createContext, useContext, useEffect, useState, type ReactNode } from "react";
import { api, tokenStore } from "./api";
import type { User } from "./types";

type AuthCtx = {
  user: User | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<User>;
  register: (data: { name: string; email: string; password: string; role?: string }) => Promise<User>;
  logout: () => void;
};

const Ctx = createContext<AuthCtx | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const t = tokenStore.get();
    if (!t) { setLoading(false); return; }
    api<{ user: User } | User>("/auth/me")
      .then((res: any) => setUser(res.user ?? res))
      .catch(() => tokenStore.clear())
      .finally(() => setLoading(false));
  }, []);

  const login: AuthCtx["login"] = async (email, password) => {
    const res = await api<{ token: string; user: User }>("/auth/login", {
      method: "POST",
      body: { email, password },
      auth: false,
    });
    tokenStore.set(res.token);
    setUser(res.user);
    return res.user;
  };

  const register: AuthCtx["register"] = async (data) => {
    const res = await api<{ token: string; user: User }>("/auth/register", {
      method: "POST",
      body: { role: "student", ...data },
      auth: false,
    });
    tokenStore.set(res.token);
    setUser(res.user);
    return res.user;
  };

  const logout = () => {
    tokenStore.clear();
    setUser(null);
    window.location.href = "/login";
  };

  return <Ctx.Provider value={{ user, loading, login, register, logout }}>{children}</Ctx.Provider>;
}

export function useAuth() {
  const c = useContext(Ctx);
  if (!c) throw new Error("useAuth must be used inside AuthProvider");
  return c;
}

export function dashboardPathFor(role?: string) {
  if (role === "admin") return "/dashboard/admin";
  if (role === "placement_officer") return "/dashboard/officer";
  return "/dashboard/student";
}
