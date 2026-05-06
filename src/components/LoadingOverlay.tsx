"use client";

import { useEffect, useState } from "react";

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

      {/* Content */}
      <div className="relative flex flex-col items-center gap-8">
        {/* Glow behind stamp */}
        <div className="absolute -inset-16 rounded-full bg-[#8b1a1a]/20 blur-3xl" />

        {/* Stamp animation */}
        <div className="stamp-animate relative">
          <div className="flex h-28 w-28 items-center justify-center rounded-md border-4 border-[#f7efe1] bg-[#8b1a1a] shadow-2xl shadow-[#8b1a1a]/30">
            <span className="text-2xl font-bold text-[#f7efe1]">版画</span>
          </div>
        </div>

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
        .stamp-animate {
          animation: stamp 1.6s ease-in-out infinite;
        }
        @keyframes stamp {
          0% { transform: translateY(-20px) scale(1.05); opacity: 0.8; }
          30% { transform: translateY(0) scale(1); opacity: 1; }
          50% { transform: translateY(0) scale(1); opacity: 1; }
          80% { transform: translateY(-20px) scale(1.05); opacity: 0.8; }
          100% { transform: translateY(-20px) scale(1.05); opacity: 0.8; }
        }
      `}</style>
    </div>
  );
}
