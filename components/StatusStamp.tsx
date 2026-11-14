"use client";

import {
  AlertTriangle,
  Ban,
  CheckCircle2,
  Crown,
  Eye,
  Zap,
} from "lucide-react";
import { STATUS_STAMPS } from "@/lib/types";
import { iconXs } from "./icons";

type StampKey = keyof typeof STATUS_STAMPS;

const COLORS: Record<StampKey, string> = {
  open: "border-[#FFD600] text-[#FFD600] bg-[rgba(255,214,0,0.14)] shadow-[0_0_18px_rgba(255,214,0,0.22)]",
  locked: "border-amber-300 text-amber-200 bg-black/40",
  chickened: "border-[#FFD600] bg-[#FFD600] text-[#111111]",
  cooked: "border-emerald-300 text-emerald-200 bg-black/40",
  certified: "border-yellow-300 text-yellow-200 bg-black/40",
  capped: "border-rose-400 text-rose-200 bg-black/40",
};

const ICONS: Record<StampKey, typeof Eye> = {
  open: Eye,
  locked: Zap,
  chickened: AlertTriangle,
  cooked: CheckCircle2,
  certified: Crown,
  capped: Ban,
};

export function StatusStamp({
  kind,
  slam = false,
}: {
  kind: StampKey;
  slam?: boolean;
}) {
  const Icon = ICONS[kind];
  return (
    <div className="relative inline-flex">
      {slam && <span className="shockwave-ring" />}
      <span
        className={[
          "inline-flex items-center gap-1.5 rounded-md border-4 border-dashed px-3 py-1.5 font-[family-name:var(--font-display)] text-sm font-black tracking-wide rotate-0",
          COLORS[kind],
          slam ? "animate-impact-slam" : "",
        ].join(" ")}
      >
        <Icon {...iconXs} />
        {STATUS_STAMPS[kind]}
      </span>
    </div>
  );
}
