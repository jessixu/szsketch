export default function TextureBox({
  children,
  className = "",
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div
      className={`relative overflow-hidden rounded-xl border border-stone-200 bg-[#111] text-stone-100 shadow-sm ${className}`}
    >
      <div
        className="absolute inset-0 opacity-20"
        style={{
          backgroundImage: "radial-gradient(#fff 1px, transparent 1px)",
          backgroundSize: "9px 9px",
        }}
      />
      <div className="relative h-full w-full">{children}</div>
    </div>
  );
}
