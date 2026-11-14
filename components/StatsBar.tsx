"use client";

import {
  CheckCircle2,
  Crown,
  Flame,
  Snowflake,
  Zap,
} from "lucide-react";
import type { LocalStats } from "@/lib/types";
import type { RankId } from "@/lib/rank";
import { iconSm } from "./icons";

export function StatsBar({
  stats,
  rank,
  popup,
}: {
  stats: LocalStats;
  rank: { id: RankId; label: string };
  popup: string | null;
}) {
  return (
    <div className="glass-panel relative overflow-visible rounded-2xl border-white/10 px-3 py-2.5 backdrop-blur-2xl">
      {popup && (
        <span className="stat-popup pointer-events-none absolute right-4 top-0 z-20 rounded-full bg-rose-600 px-2 py-0.5 text-[10px] font-black tabular-nums">
          {popup}
        </span>
      )}
      <div className="grid grid-cols-4 gap-2 text-center">
        <Stat label="LOCKED IN" value={stats.lockedIn} icon={<Zap {...iconSm} />} />
        <Stat
          label="COOKED"
          value={stats.cooked}
          icon={<CheckCircle2 {...iconSm} />}
        />
        <Stat label="CERTIFIED" value={stats.certified} icon={<Crown {...iconSm} />} />
        <Stat label="STREAK" value={stats.streak} icon={<Flame {...iconSm} />} />
      </div>
      <p className="mt-1.5 flex items-center justify-center gap-1.5 text-[11px] font-bold tracking-tight text-[#9aa3b8]">
        <RankIcon id={rank.id} />
        {rank.label}
      </p>
    </div>
  );
}

function RankIcon({ id }: { id: RankId }) {
  if (id === "legend") return <Crown {...iconSm} className="h-3.5 w-3.5" />;
  if (id === "menace") return <Flame {...iconSm} className="h-3.5 w-3.5" />;
  if (id === "nofear") return <Zap {...iconSm} className="h-3.5 w-3.5" />;
  return <Snowflake {...iconSm} className="h-3.5 w-3.5" />;
}

function Stat({
  label,
  value,
  icon,
}: {
  label: string;
  value: number;
  icon: React.ReactNode;
}) {
  return (
    <div>
      <p className="flex items-center justify-center gap-1 text-lg font-black tabular-nums">
        {icon}
        {value}
      </p>
      <p className="text-[9px] font-bold tracking-wider text-[#9aa3b8]">{label}</p>
    </div>
  );
}
