"use client";

import { STATUS_STAMPS } from "@/lib/types";

type StampKey = keyof typeof STATUS_STAMPS;

const COLORS: Record<StampKey, string> = {
  open: "border-cyan-300 text-cyan-200",
  locked: "border-amber-300 text-amber-200",
  chickened: "border-orange-400 text-orange-200",
  cooked: "border-emerald-300 text-emerald-200",
  certified: "border-yellow-300 text-yellow-200",
  capped: "border-rose-400 text-rose-200",
};

export function StatusStamp({
  kind,
  slam = false,
}: {
  kind: StampKey;
  slam?: boolean;
}) {
  return (
    <div className="relative inline-flex">
      {slam && <span className="shockwave-ring" />}
      <span
        className={[
          "rounded-md border-4 border-dashed px-3 py-1.5 font-[family-name:var(--font-display)] text-sm font-black tracking-wide",
          COLORS[kind],
          slam ? "animate-impact-slam" : "rotate-[-6deg]",
        ].join(" ")}
      >
        {STATUS_STAMPS[kind]}
      </span>
    </div>
  );
}
