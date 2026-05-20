"use client";

import type React from "react";
import { useMemo, useState } from "react";
import Link from "next/link";
import BrandMark from "@/components/BrandMark";
import { Button } from "@/components/ui/button";
import { api, type PortfolioReportData } from "@/lib/api";

export default function PortfolioInteractiveReportView({
  data,
}: {
  data: PortfolioReportData;
}) {
  const [screen, setScreen] = useState(0);
  const [message, setMessage] = useState("");
  const [regenerating, setRegenerating] = useState(false);
  const completedDate = new Date(data.completedDate).toLocaleDateString("zh-CN");
  const stages = useMemo(
    () =>
      data.uploads.map((upload) => ({
        upload,
        summary: data.stageSummaries.find((item) => item.courseKey === upload.courseKey)?.summary || "",
      })),
    [data],
  );
  const total = 8;
  const progress = `${((screen + 1) / total) * 100}%`;

  const regenerate = async () => {
    setRegenerating(true);
    setMessage("正在重新分析四件作品");
    try {
      await api.generatePortfolioReport();
      window.location.reload();
    } catch (err) {
      setMessage(err instanceof Error ? err.message : "重新生成失败");
      setRegenerating(false);
    }
  };

  const next = () => setScreen((value) => Math.min(total - 1, value + 1));

  return (
    <main className="flex min-h-screen items-center justify-center bg-[#0a0f1a] p-4 text-[#17223b]">
      <div className="w-full max-w-[520px] overflow-hidden rounded-[24px] bg-[#fdfaf5] shadow-2xl">
        <div className="relative min-h-[min(680px,calc(100vh-220px))] overflow-hidden">
          <div className="absolute inset-x-0 bottom-0 z-20 h-0.5 bg-[#1b2436]">
            <div className="h-full bg-gradient-to-r from-[#c9a84c] to-[#f0e0a0] transition-all duration-500" style={{ width: progress }} />
          </div>
          {screen === 0 && (
            <Screen tone="dark">
              <StarField />
              <BrandMark size="md" />
              <Fade delay="d1" className="mt-10 text-[10px] font-semibold tracking-[0.35em] text-[#7a9ac4]">印刻奇旅完成纪念</Fade>
              <Fade delay="d2" className="mt-4 text-center font-heading text-5xl font-bold leading-tight text-[#f0e8d0]">{data.studentName}</Fade>
              <Fade delay="d3" className="mt-3 text-sm text-[#4a6a8a]">{completedDate}</Fade>
              <Fade delay="d4" className="my-8 h-px w-12 bg-[#c9a84c]" />
              <Fade delay="d5" className="text-center text-sm leading-9 text-[#8aaccf]">
                四件作品<br />一段旅程<br />属于你的印迹
              </Fade>
              <NavButton onClick={next}>开始回顾 →</NavButton>
            </Screen>
          )}

          {stages.map(({ upload, summary }, index) => (
            screen === index + 1 && (
              <Screen key={upload.courseKey} tone="light">
                <div className="absolute right-5 top-3 text-[88px] font-bold leading-none text-black/[0.04]">{String(index + 1).padStart(2, "0")}</div>
                <Fade delay="d1" className={`rounded-full px-3 py-1 text-[10px] font-semibold tracking-[0.18em] ${stageTagClass(index)}`}>
                  {upload.stage.split("·")[0].trim()}
                </Fade>
                <Fade delay="d2" className="mt-4 text-center font-heading text-2xl font-bold text-[#1a1208]">{upload.title}</Fade>
                <Fade delay="d3" className="mt-6 w-full overflow-hidden rounded-xl border border-[#e0d8c8] bg-[#f0ebe0]">
                  <div className="aspect-[4/3]">
                    {upload.imageUrl && <img src={upload.imageUrl} alt={upload.title} className="h-full w-full object-cover" />}
                  </div>
                </Fade>
                <Fade delay="d4" className="mt-6 text-center text-sm leading-8 text-[#5a4a3a]">{summary}</Fade>
                <NavButton onClick={index === stages.length - 1 ? next : next}>{index === stages.length - 1 ? "查看点评 →" : "继续 →"}</NavButton>
              </Screen>
            )
          ))}

          {screen === 5 && (
            <Screen tone="review">
              <Fade delay="d1" className="text-[10px] font-semibold tracking-[0.35em] text-[#7a9ac4]">AI 专属点评</Fade>
              <Fade delay="d2" className="mt-4 font-serif text-6xl leading-none text-[#c9a84c]">“</Fade>
              <Fade delay="d3" className="mt-2 text-center text-sm leading-8 text-[#c8d8e8]">{data.overallComment}</Fade>
              <NavButton onClick={next}>领取称号 →</NavButton>
            </Screen>
          )}

          {screen === 6 && (
            <Screen tone="dark">
              <StarField />
              <Fade delay="d1" className="text-[10px] font-semibold tracking-[0.35em] text-[#7a9ac4]">你的专属称号</Fade>
              <Fade delay="d2" className="mt-7 flex h-24 w-24 items-center justify-center rounded-full border border-[#c9a84c] text-4xl text-[#c9a84c]">印</Fade>
              <Fade delay="d3" className="mt-7 text-center font-heading text-5xl font-bold leading-tight text-[#f0e0a0]">{data.title}</Fade>
              <Fade delay="d4" className="mt-5 max-w-xs text-center text-sm leading-8 text-[#9abbd4]">{data.titleReason}</Fade>
              <NavButton onClick={next}>查看结尾 →</NavButton>
            </Screen>
          )}

          {screen === 7 && (
            <Screen tone="light">
              <Fade delay="d1" className="text-4xl text-[#8a7a6a]">✦</Fade>
              <Fade delay="d2" className="mt-6 text-center text-lg leading-10 text-[#2a1a0a]">
                每一刀都是你留下的印记<br />带走这份作品<br />也带走这段时光
              </Fade>
              <Fade delay="d3" className="mt-8 text-[10px] tracking-[0.28em] text-[#9a8a7a]">印刻奇旅 · 版画创意智造工坊</Fade>
            </Screen>
          )}
        </div>

        <div className="flex justify-center gap-2 bg-[#0a0f1a] px-4 py-4">
          {Array.from({ length: total }).map((_, index) => (
            <button
              key={index}
              type="button"
              aria-label={`第${index + 1}屏`}
              onClick={() => setScreen(index)}
              className={`h-1.5 rounded-full transition-all ${index === screen ? "w-6 bg-[#c9a84c]" : "w-1.5 bg-[#c9a84c]/25"}`}
            />
          ))}
        </div>

        <div className="grid gap-2 bg-[#fdfaf5] p-4">
          <div className="grid grid-cols-2 gap-2">
            <Link className="inline-flex h-10 items-center justify-center rounded-xl border border-[#d7c58f] bg-white text-sm font-medium text-[#2c3e6b]" href="/">
              返回工具选择
            </Link>
            <a className="inline-flex h-10 items-center justify-center rounded-xl bg-[#2c3e6b] text-sm font-medium text-[#f8edcc]" href="/portfolio/report/longimage">
              查看长图
            </a>
          </div>
          <details className="rounded-xl border border-[#d7c58f] bg-white px-3 py-2 text-sm text-[#2c3e6b]">
            <summary className="cursor-pointer font-medium">修改作品照片</summary>
            <div className="mt-3 grid grid-cols-2 gap-2">
              {data.uploads.map((upload, index) => (
                <a key={upload.courseKey} className="rounded-lg bg-[#fbf6ea] px-3 py-2 text-center text-xs" href={`/portfolio/upload/${upload.courseKey}`}>
                  修改第{index + 1}阶段
                </a>
              ))}
            </div>
          </details>
          <Button className="h-10 rounded-xl bg-[#2c3e6b] text-[#f8edcc]" onClick={regenerate} disabled={regenerating}>
            {regenerating ? "正在重新生成" : "重新生成报告"}
          </Button>
        </div>
      </div>
      {message && <div className="fixed bottom-5 left-1/2 max-w-[88vw] -translate-x-1/2 rounded-full bg-stone-900 px-4 py-2 text-center text-sm text-white">{message}</div>}
    </main>
  );
}

function Screen({ tone, children }: { tone: "dark" | "light" | "review"; children: React.ReactNode }) {
  const bg = tone === "dark" ? "bg-[#0f1a2e]" : tone === "review" ? "bg-[#1c2b4a]" : "bg-[#fdfaf5]";
  return <section className={`relative flex min-h-[min(680px,calc(100vh-220px))] flex-col items-center justify-center overflow-hidden px-10 py-14 ${bg}`}>{children}</section>;
}

function Fade({ delay, className = "", children }: { delay: string; className?: string; children?: React.ReactNode }) {
  const delayClass = delay === "d1" ? "delay-75" : delay === "d2" ? "delay-200" : delay === "d3" ? "delay-300" : delay === "d4" ? "delay-500" : "delay-700";
  return <div className={`animate-in fade-in slide-in-from-bottom-6 duration-700 ${delayClass} ${className}`}>{children}</div>;
}

function NavButton({ onClick, children }: { onClick: () => void; children: React.ReactNode }) {
  return (
    <button type="button" onClick={onClick} className="absolute bottom-6 right-7 rounded-full bg-[#c9a84c] px-5 py-2.5 text-xs font-bold tracking-[0.12em] text-[#0f1a2e] transition hover:-translate-y-0.5 hover:opacity-90">
      {children}
    </button>
  );
}

function StarField() {
  return (
    <div className="pointer-events-none absolute inset-0">
      {Array.from({ length: 34 }).map((_, index) => (
        <span
          key={index}
          className="absolute rounded-full bg-[#c9a84c] opacity-25 animate-pulse"
          style={{
            left: `${(index * 37) % 100}%`,
            top: `${(index * 23) % 100}%`,
            width: `${(index % 3) + 1}px`,
            height: `${(index % 3) + 1}px`,
            animationDelay: `${(index % 7) * 0.3}s`,
          }}
        />
      ))}
    </div>
  );
}

function stageTagClass(index: number) {
  if (index === 0) return "bg-[#eef2fa] text-[#4a6a9a]";
  if (index === 1) return "bg-[#eef7ee] text-[#3a7a3a]";
  if (index === 2) return "bg-[#faf0e8] text-[#9a5a2a]";
  return "bg-[#f5eef8] text-[#7a4a9a]";
}
