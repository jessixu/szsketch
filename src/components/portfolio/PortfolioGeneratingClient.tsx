"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { api, type PortfolioState } from "@/lib/api";

export default function PortfolioGeneratingClient() {
  const router = useRouter();
  const [portfolio, setPortfolio] = useState<PortfolioState | null>(null);
  const [error, setError] = useState("");

  useEffect(() => {
    let mounted = true;
    const started = Date.now();
    api.portfolio()
      .then((state) => {
        if (mounted) setPortfolio(state);
        return api.generatePortfolioReport();
      })
      .then(() => {
        const remain = Math.max(0, 6500 - (Date.now() - started));
        window.setTimeout(() => router.replace("/portfolio/report"), remain);
      })
      .catch((err) => setError(err instanceof Error ? err.message : "报告生成失败"));
    return () => {
      mounted = false;
    };
  }, [router]);

  return (
    <main className="flex min-h-screen items-center justify-center bg-black p-6 text-white">
      <div className="text-center">
        <div className="mx-auto grid w-72 grid-cols-2 gap-3">
          {(portfolio?.uploads || []).map((upload, index) => (
            <div
              key={upload.courseKey}
              className="aspect-square overflow-hidden rounded-2xl border border-white/20 bg-white/10 opacity-0 animate-in fade-in zoom-in duration-700"
              style={{ animationDelay: `${index * 550}ms`, animationFillMode: "forwards" }}
            >
              {upload.imageUrl && <img src={upload.imageUrl} alt={upload.title} className="h-full w-full object-cover" />}
            </div>
          ))}
        </div>
        <h1 className="mt-8 font-heading text-3xl font-bold">正在翻阅你的印迹……</h1>
        <p className="mt-3 text-sm text-white/60">四件作品正在被整理成你的学习成长报告</p>
        {error && <div className="mt-6 rounded-xl border border-red-400/40 bg-red-500/10 p-3 text-sm text-red-100">{error}</div>}
      </div>
    </main>
  );
}
