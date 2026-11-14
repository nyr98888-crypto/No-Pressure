"use client";

import type { LocalStats } from "@/lib/types";

export function StatsBar({
  stats,
  rank,
  popup,
}: {
  stats: LocalStats;
  rank: { badge: string; label: string };
  popup: string | null;
}) {
  return (
    <div className="glass-panel relative overflow-visible rounded-2xl px-3 py-3">
      {popup && (
        <span className="stat-popup pointer-events-none absolute right-4 top-0 z-20 rounded-full bg-rose-600 px-2 py-0.5 text-[10px] font-black">
          {popup}
        </span>
      )}
      <div className="grid grid-cols-4 gap-2 text-center">
        <Stat label="LOCKED IN" value={stats.lockedIn} icon="⚡" />
        <Stat label="COOKED" value={stats.cooked} icon="📸" />
        <Stat label="CERTIFIED" value={stats.certified} icon="👑" />
        <Stat label="STREAK" value={stats.streak} icon="🔥" />
      </div>
      <p className="mt-2 text-center text-[11px] font-bold tracking-wide text-[#9aa3b8]">
        {rank.badge} {rank.label}
      </p>
    </div>
  );
}

function Stat({
  label,
  value,
  icon,
}: {
  label: string;
  value: number;
  icon: string;
}) {
  return (
    <div>
      <p className="text-lg font-black tabular-nums">
        {icon} {value}
      </p>
      <p className="text-[9px] font-bold tracking-wider text-[#9aa3b8]">{label}</p>
    </div>
  );
}
