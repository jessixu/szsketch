export default function PrintSVG({ type = "bird", large = false }: { type?: string; large?: boolean }) {
  const stroke = large ? 5 : 4;
  return (
    <svg viewBox="0 0 360 220" className="h-full w-full" aria-hidden="true">
      <rect x="8" y="8" width="344" height="204" fill="none" stroke="#f7efe1" strokeWidth="5" />
      <path
        d="M25 182 C70 150, 76 94, 132 84 C193 72, 238 126, 335 45"
        fill="none" stroke="#f7efe1" strokeWidth={stroke} strokeLinecap="round"
      />
      <path
        d="M36 42 C80 70, 82 22, 128 48 M252 36 C278 48, 294 20, 327 32 M240 188 C265 168, 300 174, 322 142"
        fill="none" stroke="#f7efe1" strokeWidth="4" strokeLinecap="round"
      />
      {type === "bird" && (
        <>
          <path d="M92 125 C130 62, 195 48, 236 98 C190 104, 152 128, 112 168 Z" fill="none" stroke="#f7efe1" strokeWidth="5" />
          <path d="M154 100 C118 78, 98 45, 78 25 C96 80, 116 120, 154 154" fill="none" stroke="#f7efe1" strokeWidth="5" />
          <path d="M222 98 C260 90, 278 70, 318 54" fill="none" stroke="#f7efe1" strokeWidth="5" />
          <circle cx="122" cy="102" r="7" fill="#f7efe1" />
          <path d="M130 128 C160 117, 182 115, 216 121 M138 146 C168 139, 190 141, 220 154" stroke="#f7efe1" strokeWidth="3" fill="none" />
        </>
      )}
      {type === "tiger" && (
        <>
          <path d="M72 145 C95 78, 210 64, 264 120 C286 146, 268 174, 230 172 L104 172 C78 170, 62 158, 72 145 Z" fill="none" stroke="#f7efe1" strokeWidth="5" />
          <circle cx="110" cy="110" r="32" fill="none" stroke="#f7efe1" strokeWidth="5" />
          <path d="M94 80 L82 48 L116 70 M124 72 L150 45 L148 86 M246 122 C285 95, 312 92, 336 112" fill="none" stroke="#f7efe1" strokeWidth="5" />
          <circle cx="100" cy="105" r="4" fill="#f7efe1" />
          <path d="M144 108 L176 86 M158 135 L198 108 M190 154 L226 126" stroke="#f7efe1" strokeWidth="4" />
        </>
      )}
      {type === "fish" && (
        <>
          <path d="M52 120 C112 52, 230 52, 296 120 C226 188, 112 188, 52 120 Z" fill="none" stroke="#f7efe1" strokeWidth="5" />
          <path d="M296 120 L340 76 L330 120 L340 164 Z" fill="none" stroke="#f7efe1" strokeWidth="5" />
          <circle cx="104" cy="112" r="8" fill="#f7efe1" />
          <path d="M138 90 C154 110, 154 132, 138 154 M174 82 C192 108, 192 134, 174 160 M212 88 C232 110, 232 132, 212 154" fill="none" stroke="#f7efe1" strokeWidth="4" />
          <path d="M60 172 C100 150, 124 148, 162 174 M174 48 C210 70, 232 70, 268 48" fill="none" stroke="#f7efe1" strokeWidth="4" />
        </>
      )}
      {type === "god" && (
        <>
          <circle cx="180" cy="72" r="30" fill="none" stroke="#f7efe1" strokeWidth="5" />
          <path d="M180 102 L180 164 M142 124 L218 124 M150 164 L122 196 M210 164 L240 196" fill="none" stroke="#f7efe1" strokeWidth="6" strokeLinecap="round" />
          <path d="M128 48 L104 12 M154 42 L146 8 M206 42 L218 8 M232 50 L264 18" stroke="#f7efe1" strokeWidth="5" />
          <path d="M50 42 L86 42 L62 82 L100 82 M274 44 L318 44 L286 84 L332 84" fill="none" stroke="#f7efe1" strokeWidth="5" />
          <path d="M162 70 C175 58, 190 58, 204 70 M166 84 C180 94, 194 92, 208 82" fill="none" stroke="#f7efe1" strokeWidth="3" />
        </>
      )}
      <circle cx="300" cy="52" r="20" fill="none" stroke="#f7efe1" strokeWidth="4" />
    </svg>
  );
}
