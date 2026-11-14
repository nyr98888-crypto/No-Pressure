export function BrandCorner({
  align = "left",
}: {
  align?: "left" | "right";
}) {
  return (
    <p
      className={`font-[family-name:var(--font-display)] text-[10px] font-black tracking-[0.28em] text-white/45 ${
        align === "right" ? "text-right" : "text-left"
      }`}
    >
      NO PRESSURE
    </p>
  );
}
