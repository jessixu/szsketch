"use client";

import { useEffect, useState } from "react";
import { api, type PortfolioReportEnvelope } from "@/lib/api";
import PortfolioReportView from "@/components/portfolio/PortfolioReportView";

export default function PublicReportClient({ token }: { token: string }) {
  const [report, setReport] = useState<PortfolioReportEnvelope | null>(null);
  const [error, setError] = useState("");

  useEffect(() => {
    api.publicReport(token)
      .then((result) => setReport(result.report))
      .catch((err) => setError(err instanceof Error ? err.message : "报告不存在"));
  }, [token]);

  if (error) return <div className="p-6 text-red-700">{error}</div>;
  if (!report) return <div className="p-6 text-stone-500">正在读取报告...</div>;
  return <PortfolioReportView data={report.data} shareToken={report.shareToken} readonly />;
}
