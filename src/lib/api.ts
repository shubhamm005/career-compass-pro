// Configurable API client for the Express + MySQL backend.
// Set VITE_API_BASE_URL in your environment (e.g. http://localhost:5000/api).

const DEFAULT_BASE = "http://localhost:5000/api";

export const API_BASE_URL: string =
  (typeof import.meta !== "undefined" && (import.meta as any).env?.VITE_API_BASE_URL) ||
  DEFAULT_BASE;

const TOKEN_KEY = "scgp_token";

export const tokenStore = {
  get: () => (typeof window !== "undefined" ? localStorage.getItem(TOKEN_KEY) : null),
  set: (t: string) => localStorage.setItem(TOKEN_KEY, t),
  clear: () => localStorage.removeItem(TOKEN_KEY),
};

export class ApiError extends Error {
  status: number;
  data: any;
  constructor(message: string, status: number, data?: any) {
    super(message);
    this.status = status;
    this.data = data;
  }
}

type Options = {
  method?: string;
  body?: any;
  query?: Record<string, any>;
  auth?: boolean;
};

export async function api<T = any>(path: string, opts: Options = {}): Promise<T> {
  const { method = "GET", body, query, auth = true } = opts;
  const url = new URL(`${API_BASE_URL}${path}`);
  if (query) {
    Object.entries(query).forEach(([k, v]) => {
      if (v !== undefined && v !== null && v !== "") url.searchParams.set(k, String(v));
    });
  }

  const headers: Record<string, string> = { "Content-Type": "application/json" };
  if (auth) {
    const t = tokenStore.get();
    if (t) headers["Authorization"] = `Bearer ${t}`;
  }

  let res: Response;
  try {
    res = await fetch(url.toString(), {
      method,
      headers,
      body: body ? JSON.stringify(body) : undefined,
    });
  } catch (e: any) {
    throw new ApiError(
      `Cannot reach API at ${API_BASE_URL}. Is your backend running?`,
      0,
    );
  }

  const text = await res.text();
  const data = text ? safeJson(text) : null;

  if (!res.ok) {
    if (res.status === 401) {
      tokenStore.clear();
    }
    const msg = (data && (data.message || data.error)) || res.statusText || "Request failed";
    throw new ApiError(msg, res.status, data);
  }
  return data as T;
}

function safeJson(s: string) {
  try { return JSON.parse(s); } catch { return s; }
}
