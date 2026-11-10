type StampBadgeProps = {
  label: "PAY UP" | "LOCKED" | "PENDING" | "SETTLED";
  tone?: "red" | "yellow" | "zinc";
};

const toneClasses = {
  red: "border-red-500 text-red-500",
  yellow: "border-yellow-400 text-yellow-400",
  zinc: "border-zinc-500 text-zinc-400",
};

export default function StampBadge({ label, tone = "red" }: StampBadgeProps) {
  return (
    <span
      className={`inline-block rotate-[-8deg] border-4 px-3 py-1 text-sm font-black uppercase tracking-[0.2em] ${toneClasses[tone]}`}
      aria-label={label}
    >
      {label}
    </span>
  );
}
