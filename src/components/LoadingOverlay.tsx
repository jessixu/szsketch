"use client";

import { useEffect, useState } from "react";
import BrandMark from "@/components/BrandMark";

const statusTexts = [
  "正在构思版画构图…",
  "正在匹配传统纹样…",
  "正在调用AI生成…",
  "版画效果即将呈现…",
];

export default function LoadingOverlay({
  onCancel,
}: {
  onCancel: () => void;
}) {
  const [statusIndex, setStatusIndex] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setStatusIndex((i) => (i + 1) % statusTexts.length);
    }, 4000);
    return () => clearInterval(timer);
  }, []);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#1a1611]">
      {/* Subtle texture */}
      <div
        className="absolute inset-0 opacity-[0.03]"
        style={{
          backgroundImage: "radial-gradient(#fff 1px, transparent 1px)",
          backgroundSize: "16px 16px",
        }}
      />

      <div className="relative flex flex-col items-center gap-8">
        <div className="absolute -inset-16 rounded-full bg-[#8b1a1a]/20 blur-3xl" />

        <BrandMark size="lg" animated />

        {/* Status text */}
        <p className="text-lg font-medium text-[#f7efe1]/90">{statusTexts[statusIndex]}</p>

        {/* Progress dots */}
        <div className="flex gap-2">
          {statusTexts.map((_, i) => (
            <div
              key={i}
              className={`h-1.5 rounded-full transition-all duration-500 ${
                i === statusIndex ? "w-8 bg-[#f7efe1]" : "w-1.5 bg-[#f7efe1]/20"
              }`}
            />
          ))}
        </div>

        {/* Cancel button */}
        <button
          onClick={onCancel}
          className="mt-4 rounded-lg border border-[#f7efe1]/20 px-6 py-2 text-sm text-[#f7efe1]/60 hover:bg-[#f7efe1]/5 hover:text-[#f7efe1]"
        >
          取消生成
        </button>
      </div>

      <style jsx>{`
        @media (prefers-reduced-motion: reduce) {
          :global(.animate-spin),
          :global(.animate-pulse) {
            animation: none;
          }
        }
      `}</style>
    </div>
  );
}
