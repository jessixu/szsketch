const BASE = "";

async function request<T>(path: string, options?: RequestInit): Promise<T> {
  const res = await fetch(`${BASE}${path}`, {
    headers: { "Content-Type": "application/json" },
    ...options,
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || "请求失败");
  return data;
}

export const api = {
  login: (username: string, password: string) =>
    request<{ id: string; displayName: string }>("/api/auth/login", {
      method: "POST",
      body: JSON.stringify({ username, password }),
    }),

  logout: () =>
    request<{ ok: boolean }>("/api/auth/logout", { method: "POST" }),

  me: () => request<{ id: string; username: string; displayName: string }>("/api/auth/me"),

  generate: (origin: string, mood: string, notes?: string) =>
    request<{ id: string; imageUrl: string | null; prompt: string; description: string; aiAvailable: boolean }>(
      "/api/generate",
      { method: "POST", body: JSON.stringify({ origin, mood, notes }) }
    ),

  history: (page = 1, limit = 20) =>
    request<{ items: HistoryItem[]; total: number; page: number; limit: number }>(
      `/api/history?page=${page}&limit=${limit}`
    ),

  status: () => request<{ aiAvailable: boolean; version: string }>("/api/status"),
};

export interface HistoryItem {
  id: string;
  origin: string;
  mood: string;
  patterns: string;
  notes: string;
  prompt: string;
  imageUrl: string | null;
  description: string | null;
  aiAvailable: boolean;
  createdAt: string;
}
