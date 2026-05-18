"use client";

interface BrandMarkProps {
  size?: "sm" | "md" | "lg";
  animated?: boolean;
}

const sizeMap = {
  sm: {
    outer: "h-12 w-12",
    inner: "h-9 w-9",
    icon: "h-6 w-6",
    stroke: 7,
  },
  md: {
    outer: "h-14 w-14",
    inner: "h-10 w-10",
    icon: "h-7 w-7",
    stroke: 6.5,
  },
  lg: {
    outer: "h-28 w-28",
    inner: "h-20 w-20",
    icon: "h-12 w-12",
    stroke: 6,
  },
};

export default function BrandMark({ size = "md", animated = false }: BrandMarkProps) {
  const sizes = sizeMap[size];

  return (
    <div className="relative flex items-center justify-center">
      <div
        className={`${sizes.outer} absolute rounded-full border-4 border-dashed border-[#8a6a43] border-t-transparent opacity-70 ${
          animated ? "animate-spin" : ""
        }`}
      />
      <div
        className={`${sizes.inner} flex items-center justify-center rounded-full border-4 border-[#2a241d] bg-[#f4e6d2] shadow-inner`}
      >
        <svg
          viewBox="0 0 120 120"
          className={`${sizes.icon} text-[#2a241d] ${animated ? "animate-pulse" : ""}`}
          aria-hidden="true"
        >
          <path
            d="M20 82 C40 38, 78 30, 100 60 C80 58, 58 72, 34 96 Z"
            fill="none"
            stroke="currentColor"
            strokeWidth={sizes.stroke}
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <path
            d="M56 48 C46 34, 34 22, 26 12"
            fill="none"
            stroke="currentColor"
            strokeWidth={sizes.stroke}
            strokeLinecap="round"
          />
          <circle cx="46" cy="58" r="4" fill="currentColor" />
        </svg>
      </div>
    </div>
  );
}
