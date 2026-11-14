"use client";

import { useEffect, useState } from "react";
import { Flame } from "lucide-react";
import { dailyDareForDate, msUntilMidnight } from "@/lib/darePool";
import type { HeatLevel } from "@/lib/types";
import { HeatFrame } from "./HeatFrame";
import { iconXs } from "./icons";

function formatCountdown(ms: number) {
  const total = Math.max(0, Math.floor(ms / 1000));
  const h = String(Math.floor(total / 3600)).padStart(2, "0");
  const m = String(Math.floor((total % 3600) / 60)).padStart(2, "0");
  const s = String(total % 60).padStart(2, "0");
  return `${h}:${m}:${s}`;
}

export function DailyDare({
  lockedToday,
  onLockIn,
}: {
  lockedToday: boolean;
  onLockIn: (payload: { key: string; text: string; level: HeatLevel }) => void;
}) {
  const [dare, setDare] = useState<{
    key: string;
    text: string;
    level: HeatLevel;
  } | null>(null);
  const [left, setLeft] = useState(0);

  // new Date() / clocks only after mount (never during prerender)
  useEffect(() => {
    const tick = () => {
      setDare(dailyDareForDate());
      setLeft(msUntilMidnight());
    };
    tick();
    const id = window.setInterval(tick, 1000);
    return () => clearInterval(id);
  }, []);

  if (!dare) {
    return (
      <div className="glass-panel h-36 animate-pulse rounded-2xl border border-white/10" />
    );
  }

  return (
    <HeatFrame level={dare.level} className="p-4">
      <div className="flex items-start justify-between gap-2">
        <div>
          <p className="inline-flex items-center gap-1.5 text-[10px] font-black tracking-[0.2em] text-orange-300">
            <Flame {...iconXs} /> DAILY DARE
          </p>
          <p className="mt-1 font-[family-name:var(--font-display)] text-xl font-black tracking-tight">
            Today&apos;s heat
          </p>
        </div>
        <div className="rounded-full bg-black/40 px-3 py-1 text-xs font-black tabular-nums text-orange-200">
          {formatCountdown(left)}
        </div>
      </div>
      <p className="mt-3 text-sm leading-relaxed text-white/90">{dare.text}</p>
      <button
        type="button"
        disabled={lockedToday}
        className="pill-3d mt-4 w-full bg-gradient-to-b from-orange-400 to-rose-600 px-4 py-3 text-sm text-white disabled:opacity-50"
        onClick={() => onLockIn(dare)}
      >
        {lockedToday ? "Already Locked In Today" : "Lock In Daily Dare"}
      </button>
    </HeatFrame>
  );
}
