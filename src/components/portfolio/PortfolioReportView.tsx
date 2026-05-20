"use client";

import { useMemo, useState } from "react";
import BrandMark from "@/components/BrandMark";
import { Button } from "@/components/ui/button";
import type { PortfolioReportData } from "@/lib/api";

export default function PortfolioReportView({
  data,
  shareToken,
  readonly = false,
}: {
  data: PortfolioReportData;
  shareToken: string;
  readonly?: boolean;
}) {
  const [message, setMessage] = useState("");
  const completedDate = new Date(data.completedDate).toLocaleDateString("zh-CN");

  const stages = useMemo(
    () =>
      data.uploads.map((upload) => ({
        upload,
        summary: data.stageSummaries.find((item) => item.courseKey === upload.courseKey)?.summary || "",
      })),
    [data],
  );

  const share = async () => {
    const url = `${window.location.origin}/reports/${shareToken}`;
    await navigator.clipboard?.writeText(url);
    setMessage("分享链接已复制");
  };

  const saveImage = async () => {
    setMessage("正在生成长图");
    try {
      await downloadLongImage(data);
      setMessage("长图已生成");
    } catch {
      setMessage("长图生成失败，请直接截图保存");
    }
  };

  return (
    <main className="min-h-screen bg-[#1a1410] p-4 text-[#17223b] md:p-10">
      <div className="mx-auto max-w-[420px] overflow-hidden rounded-[22px] bg-[#fdfaf5] shadow-2xl">
        <section className="relative overflow-hidden bg-[#0f1a2e] px-9 pb-12 pt-12 text-[#f8edcc]">
          <div className="absolute inset-x-0 top-0 h-2 bg-[#c9a84c]" />
          <div className="flex justify-center"><BrandMark size="md" /></div>
          <p className="mt-9 text-center text-[10px] font-semibold tracking-[0.35em] text-[#7a9ac4]">印刻奇旅完成纪念</p>
          <h1 className="mt-4 text-center font-heading text-5xl font-bold leading-tight text-[#f0e8d0]">{data.studentName}</h1>
          <p className="mt-3 text-center text-xs text-[#4a6a8a]">{completedDate}</p>
          <div className="mx-auto my-8 h-px w-12 bg-[#c9a84c]" />
          <p className="text-center text-sm leading-9 text-[#8aaccf]">
            四件作品&nbsp;&nbsp;一段旅程<br />属于你的印迹
          </p>
        </section>

        <section className="px-7 pt-7">
          <div className="mb-1 flex items-center gap-3">
            <div className="h-px flex-1 bg-[#e0d8c8]" />
            <p className="text-[10px] tracking-[0.28em] text-[#9a8a7a]">创作旅程</p>
            <div className="h-px flex-1 bg-[#e0d8c8]" />
          </div>
        </section>

        <section>
          {stages.map(({ upload, summary }, index) => (
            <article key={upload.courseKey} className="border-b border-[#ede5d8] px-7 py-6 last:border-b-0">
              <div className="mb-4 flex items-center gap-3">
                <span className="min-w-8 text-sm font-bold text-[#c9a84c]">{String(index + 1).padStart(2, "0")}</span>
                <span className={`rounded-full px-3 py-1 text-[10px] tracking-[0.12em] ${stageTagClass(index)}`}>
                  {upload.stage.split("·")[0].trim()}
                </span>
              </div>
              <h2 className="mb-4 font-heading text-lg font-semibold text-[#1a1208]">{upload.title}</h2>
              <div className="mb-4 aspect-[4/3] overflow-hidden rounded-xl border border-[#e0d8c8] bg-[#f0ebe0]">
                {upload.imageUrl && <img src={upload.imageUrl} alt={upload.title} className="h-full w-full object-cover" />}
              </div>
              <p className="text-sm leading-8 text-[#5a4a3a]">{summary}</p>
            </article>
          ))}
        </section>

        <section className="bg-[#1c2b4a] px-7 py-9">
          <p className="mb-5 text-center text-[10px] tracking-[0.35em] text-[#7a9ac4]">AI 专属点评</p>
          <div className="font-serif text-6xl leading-none text-[#c9a84c]">“</div>
          <p className="text-sm leading-8 text-[#c8d8e8]">{data.overallComment}</p>
        </section>

        <section className="bg-[#0f1a2e] px-7 py-11 text-center">
          <p className="text-[10px] tracking-[0.35em] text-[#7a9ac4]">你的专属称号</p>
          <div className="mx-auto mt-6 flex h-24 w-24 items-center justify-center rounded-full border border-[#c9a84c] text-4xl text-[#c9a84c]">印</div>
          <h2 className="mt-6 font-heading text-5xl font-bold leading-tight text-[#f0e0a0]">{data.title}</h2>
          <p className="mt-5 text-sm leading-8 text-[#9abbd4]">{data.titleReason}</p>
        </section>

        <section className="px-7 py-10 text-center">
          <p className="text-base leading-10 text-[#2a1a0a]">每一刀都是你留下的印记<br />带走这份作品，也带走这段时光</p>
          <div className="mx-auto my-5 h-px w-10 bg-[#c9a84c]" />
          <p className="text-[10px] tracking-[0.28em] text-[#9a8a7a]">印刻奇旅 · 版画创意智造工坊</p>
        </section>

        {!readonly && (
          <div className="sticky bottom-0 flex flex-wrap justify-center gap-3 border-t border-[#d7c58f] bg-[#fdfaf5]/95 px-4 py-4 backdrop-blur">
            <a className="inline-flex h-11 items-center justify-center rounded-xl border border-[#d7c58f] bg-white px-5 text-sm font-medium text-[#2c3e6b]" href="/portfolio/report">
              返回互动报告
            </a>
            <Button className="h-11 rounded-xl bg-[#2c3e6b] px-5 text-[#f8edcc] hover:bg-[#364b7c]" onClick={share}>
              分享给朋友
            </Button>
            <Button variant="outline" className="h-11 rounded-xl border-[#d7c58f] bg-white px-5 text-[#2c3e6b]" onClick={saveImage}>
              保存长图
            </Button>
          </div>
        )}
        {message && <div className="fixed bottom-20 left-1/2 z-50 max-w-[88vw] -translate-x-1/2 rounded-full bg-stone-900 px-4 py-2 text-center text-sm text-white shadow-lg">{message}</div>}
      </div>
    </main>
  );
}

async function downloadLongImage(data: PortfolioReportData) {
  const width = 1080;
  const margin = 72;
  const images = await Promise.all(data.uploads.map((upload) => loadImage(upload.imageUrl)));
  const measureCanvas = document.createElement("canvas");
  const measure = measureCanvas.getContext("2d");
  if (!measure) throw new Error("canvas unavailable");

  let estimatedHeight = 760 + data.uploads.length * 620 + 900;
  measure.font = "30px sans-serif";
  estimatedHeight += estimateWrappedHeight(measure, data.overallComment, width - margin * 2, 42);

  const canvas = document.createElement("canvas");
  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("canvas unavailable");
  canvas.width = width;
  canvas.height = estimatedHeight;

  ctx.fillStyle = "#f8f2e6";
  ctx.fillRect(0, 0, width, canvas.height);
  ctx.fillStyle = "#17223b";
  ctx.fillRect(0, 0, width, 720);
  ctx.fillStyle = "#c9a84c";
  ctx.fillRect(0, 0, width, 10);
  ctx.fillStyle = "#c9a84c";
  ctx.font = "700 28px sans-serif";
  ctx.fillText("印刻奇旅完成纪念", margin, 104);
  ctx.fillStyle = "#f8edcc";
  ctx.font = "700 72px serif";
  ctx.fillText(data.studentName, margin, 198);
  ctx.font = "30px sans-serif";
  ctx.fillStyle = "#efe3c2";
  ctx.fillText(new Date(data.completedDate).toLocaleDateString("zh-CN"), margin, 252);

  images.forEach((img, index) => {
    const x = margin + (index % 2) * 470;
    const y = 330 + Math.floor(index / 2) * 190;
    ctx.fillStyle = "#f7f4ec";
    roundRect(ctx, x, y, 420, 160, 24, true);
    if (img) drawCover(ctx, img, x + 12, y + 12, 396, 136);
  });

  let y = 800;
  data.uploads.forEach((upload, index) => {
    const img = images[index];
    const summary = data.stageSummaries.find((item) => item.courseKey === upload.courseKey)?.summary || "";
    const analysis = data.stageAnalyses?.find((item) => item.courseKey === upload.courseKey);
    ctx.fillStyle = "#ffffff";
    roundRect(ctx, margin, y, width - margin * 2, 560, 34, true);
    ctx.fillStyle = "#2c3e6b";
    ctx.font = "700 40px serif";
    ctx.fillText(`${index + 1}. ${upload.title}`, margin + 34, y + 64);
    ctx.fillStyle = "#9c7b2f";
    ctx.font = "700 24px sans-serif";
    ctx.fillText(upload.stage, margin + 34, y + 104);
    if (img) drawCover(ctx, img, margin + 34, y + 135, 430, 320);
    ctx.fillStyle = "#57534e";
    ctx.font = "28px sans-serif";
    let textY = wrapText(ctx, summary, margin + 500, y + 152, 400, 40);
    if (analysis) {
      ctx.font = "24px sans-serif";
      textY = wrapText(ctx, `构图：${analysis.composition}`, margin + 500, textY + 22, 400, 34);
      textY = wrapText(ctx, `线条：${analysis.line}`, margin + 500, textY + 12, 400, 34);
      wrapText(ctx, `色调：${analysis.toneOrColor}`, margin + 500, textY + 12, 400, 34);
    }
    y += 620;
  });

  ctx.fillStyle = "#fbf6ea";
  roundRect(ctx, margin, y, width - margin * 2, 120, 28, true);
  ctx.fillStyle = "#2c3e6b";
  ctx.font = "700 46px serif";
  ctx.fillText("AI专属点评", margin + 34, y + 76);
  y += 165;
  ctx.font = "30px sans-serif";
  ctx.fillStyle = "#44403c";
  y = wrapText(ctx, data.overallComment, margin, y, width - margin * 2, 44) + 70;

  ctx.fillStyle = "#2c3e6b";
  roundRect(ctx, margin, y, width - margin * 2, 250, 34, true);
  ctx.fillStyle = "#c9a84c";
  ctx.font = "700 26px sans-serif";
  ctx.fillText("你的专属称号", margin + 42, y + 64);
  ctx.fillStyle = "#f8edcc";
  ctx.font = "700 64px serif";
  ctx.fillText(data.title, margin + 42, y + 142);
  ctx.font = "28px sans-serif";
  wrapText(ctx, data.titleReason, margin + 42, y + 190, width - margin * 2 - 84, 38);
  y += 320;

  ctx.fillStyle = "#2c3e6b";
  ctx.font = "30px sans-serif";
  wrapText(ctx, data.closing, margin, y, width - margin * 2, 44);

  const cropped = document.createElement("canvas");
  cropped.width = width;
  cropped.height = Math.min(canvas.height, y + 160);
  const croppedCtx = cropped.getContext("2d");
  if (!croppedCtx) throw new Error("canvas unavailable");
  croppedCtx.drawImage(canvas, 0, 0);

  const link = document.createElement("a");
  link.href = cropped.toDataURL("image/png");
  link.download = "印刻奇旅-学习成果报告.png";
  link.click();
}

function loadImage(src: string | null) {
  return new Promise<HTMLImageElement | null>((resolve) => {
    if (!src) return resolve(null);
    const image = new Image();
    image.crossOrigin = "anonymous";
    image.onload = () => resolve(image);
    image.onerror = () => resolve(null);
    image.src = src;
  });
}

function drawCover(ctx: CanvasRenderingContext2D, image: HTMLImageElement, x: number, y: number, w: number, h: number) {
  const scale = Math.max(w / image.width, h / image.height);
  const sw = w / scale;
  const sh = h / scale;
  ctx.drawImage(image, (image.width - sw) / 2, (image.height - sh) / 2, sw, sh, x, y, w, h);
}

function estimateWrappedHeight(ctx: CanvasRenderingContext2D, text: string, maxWidth: number, lineHeight: number) {
  let lines = 1;
  let line = "";
  for (const char of text) {
    const test = line + char;
    if (ctx.measureText(test).width > maxWidth && line) {
      lines += 1;
      line = char;
    } else {
      line = test;
    }
  }
  return lines * lineHeight;
}

function wrapText(ctx: CanvasRenderingContext2D, text: string, x: number, y: number, maxWidth: number, lineHeight: number) {
  let line = "";
  for (const char of text) {
    const test = line + char;
    if (ctx.measureText(test).width > maxWidth && line) {
      ctx.fillText(line, x, y);
      line = char;
      y += lineHeight;
    } else {
      line = test;
    }
  }
  if (line) ctx.fillText(line, x, y);
  return y + lineHeight;
}

function roundRect(ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number, r: number, fill: boolean) {
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.arcTo(x + w, y, x + w, y + h, r);
  ctx.arcTo(x + w, y + h, x, y + h, r);
  ctx.arcTo(x, y + h, x, y, r);
  ctx.arcTo(x, y, x + r, y, r);
  ctx.closePath();
  if (fill) ctx.fill();
}

function stageTagClass(index: number) {
  if (index === 0) return "bg-[#eef2fa] text-[#4a6a9a]";
  if (index === 1) return "bg-[#eef7ee] text-[#3a7a3a]";
  if (index === 2) return "bg-[#faf0e8] text-[#9a5a2a]";
  return "bg-[#f5eef8] text-[#7a4a9a]";
}
