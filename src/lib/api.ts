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
    request<{
      id: string;
      imageUrl: string | null;
      prompt: string;
      description: string;
      aiAvailable: boolean;
      imageError: string | null;
    }>(
      "/api/generate",
      { method: "POST", body: JSON.stringify({ origin, mood, notes }) }
    ),

  courseGenerate: (payload: CourseGeneratePayload) =>
    request<CourseGenerateResponse>("/api/course-generate", {
      method: "POST",
      body: JSON.stringify(payload),
    }),

  history: (page = 1, limit = 20) =>
    request<{ items: HistoryItem[]; total: number; page: number; limit: number }>(
      `/api/history?page=${page}&limit=${limit}`
    ),

  status: () => request<{ aiAvailable: boolean; version: string }>("/api/status"),

  portfolio: () => request<PortfolioState>("/api/portfolio"),

  uploadPortfolioWork: (payload: { courseKey: CourseGeneratePayload["courseKey"]; imageData: string; note: string }) =>
    request<PortfolioUploadItem>("/api/portfolio/uploads", {
      method: "PUT",
      body: JSON.stringify(payload),
    }),

  generatePortfolioReport: () =>
    request<{ report: PortfolioReportEnvelope }>("/api/portfolio/report", { method: "POST" }),

  portfolioReport: () => request<{ report: PortfolioReportEnvelope | null }>("/api/portfolio/report"),

  publicReport: (token: string) => request<{ report: PortfolioReportEnvelope }>(`/api/reports/${token}`),
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
  courseKey: string;
  actionKey: string;
  paramsJson: string | null;
  outputImages: string | null;
  createdAt: string;
}

export interface CourseGeneratePayload {
  courseKey: "black-white" | "shanhaijing" | "free" | "color";
  action: string;
  inputs: Record<string, unknown>;
}

export interface CourseGenerateResponse {
  id: string;
  courseKey: string;
  action: string;
  images: Array<{ label: string; url: string }>;
  description: string;
  prompt: string;
  palette: string[] | null;
  aiAvailable: boolean;
  imageError: string | null;
}

export interface PortfolioUploadItem {
  courseKey: CourseGeneratePayload["courseKey"];
  stage?: string;
  title?: string;
  imageUrl: string | null;
  note: string;
  uploadedAt: string | null;
}

export interface PortfolioState {
  uploads: PortfolioUploadItem[];
  completedCount: number;
  requiredCount: number;
  ready: boolean;
  report: null | {
    id: string;
    shareToken: string;
    status: string;
    updatedAt: string;
  };
}

export interface PortfolioReportData {
  studentName: string;
  completedDate: string;
  uploads: Required<Pick<PortfolioUploadItem, "courseKey" | "stage" | "title" | "imageUrl" | "note" | "uploadedAt">>[];
  stageSummaries: Array<{ courseKey: string; summary: string }>;
  stageAnalyses?: Array<{
    courseKey: string;
    composition: string;
    line: string;
    toneOrColor: string;
    feeling: string;
    highlight: string;
  }>;
  overallStyle?: string;
  overallComment: string;
  title: string;
  titleReason: string;
  closing: string;
}

export interface PortfolioReportEnvelope {
  id: string;
  shareToken: string;
  status: string;
  data: PortfolioReportData;
  updatedAt: string;
}
