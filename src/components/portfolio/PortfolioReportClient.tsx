"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { api, type PortfolioReportEnvelope } from "@/lib/api";
import PortfolioInteractiveReportView from "@/components/portfolio/PortfolioInteractiveReportView";

export default function PortfolioReportClient() {
  const router = useRouter();
  const [report, setReport] = useState<PortfolioReportEnvelope | null>(null);
  const [error, setError] = useState("");

  useEffect(() => {
    api.portfolioReport()
      .then((result) => {
        if (!result.report) {
          router.replace("/");
          return;
        }
        setReport(result.report);
      })
      .catch((err) => setError(err instanceof Error ? err.message : "报告读取失败"));
  }, [router]);

  if (error) return <div className="p-6 text-red-700">{error}</div>;
  if (!report) return <div className="p-6 text-stone-500">正在读取报告...</div>;
  return <PortfolioInteractiveReportView data={report.data} />;
}
