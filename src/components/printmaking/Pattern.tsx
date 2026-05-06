import TextureBox from "./TextureBox";

export default function Pattern({ label }: { label: string }) {
  const isWater = label.includes("水") || label.includes("浪");
  const isScale = label.includes("鳞") || label.includes("莲") || label.includes("羽");
  const shouldFallback =
    !label.includes("火") && !label.includes("雷") && !isWater && !label.includes("云") && !isScale;

  return (
    <TextureBox className="h-24">
      <svg viewBox="0 0 180 90" className="h-full w-full" aria-hidden="true">
        {label.includes("火") && (
          <path
            d="M20 72 C36 42, 28 28, 50 16 C44 40, 72 40, 66 10 C96 42, 78 54, 106 72 M110 72 C126 42, 120 24, 148 14 C140 38, 166 44, 156 72"
            fill="none" stroke="#f7efe1" strokeWidth="6" strokeLinecap="round"
          />
        )}
        {label.includes("雷") && (
          <path
            d="M22 18 L60 18 L40 45 L76 45 L46 78 M92 18 L130 18 L110 45 L150 45 L116 78"
            fill="none" stroke="#f7efe1" strokeWidth="7" strokeLinejoin="round"
          />
        )}
        {isWater && (
          <path
            d="M10 58 C28 34, 48 34, 66 58 S106 82, 124 58 S158 34, 174 58 M18 34 C34 18, 50 18, 66 34 S100 50, 116 34"
            fill="none" stroke="#f7efe1" strokeWidth="5" strokeLinecap="round"
          />
        )}
        {label.includes("云") && (
          <path
            d="M22 56 C20 34, 46 30, 52 46 C58 20, 98 22, 96 50 C120 36, 152 44, 148 66 L28 66 M66 42 C82 50, 72 62, 54 62"
            fill="none" stroke="#f7efe1" strokeWidth="5" strokeLinecap="round"
          />
        )}
        {isScale && (
          <g fill="none" stroke="#f7efe1" strokeWidth="4">
            <path d="M20 76 C20 30, 60 30, 60 76" />
            <path d="M60 76 C60 30, 100 30, 100 76" />
            <path d="M100 76 C100 30, 140 30, 140 76" />
            <path d="M40 76 C40 44, 80 44, 80 76" />
            <path d="M80 76 C80 44, 120 44, 120 76" />
          </g>
        )}
        {shouldFallback && (
          <path
            d="M20 70 C50 20, 86 20, 116 70 M64 70 C88 34, 116 34, 148 70"
            fill="none" stroke="#f7efe1" strokeWidth="5"
          />
        )}
      </svg>
    </TextureBox>
  );
}
