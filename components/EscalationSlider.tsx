"use client";

import type { HeatLevel, TierConfig } from "@/lib/types";
import { HEAT_COLORS } from "@/lib/types";

export function EscalationSlider({
  level,
  tiers,
  onChange,
  onCustomize,
  onTick,
}: {
  level: HeatLevel;
  tiers: TierConfig[];
  onChange: (level: HeatLevel) => void;
  onCustomize: () => void;
  onTick: (level: HeatLevel) => void;
}) {
  const tier = tiers.find((t) => t.level === level)!;

  return (
    <div className="glass-panel rounded-2xl p-4">
      <div className="flex items-center justify-between gap-2">
        <div>
          <p className="text-[10px] font-bold tracking-[0.18em] text-[#9aa3b8]">
            RISK ESCALATION
          </p>
          <p className="font-[family-name:var(--font-display)] text-xl font-black" style={{ color: HEAT_COLORS[level] }}>
            LVL {level} — {tier.name}
          </p>
        </div>
        <button
          type="button"
          className="pill-3d bg-white/10 px-3 py-1.5 text-[11px] text-white"
          onClick={onCustomize}
        >
          ✎ Customize Tiers
        </button>
      </div>

      <input
        type="range"
        min={1}
        max={5}
        step={1}
        value={level}
        aria-label="Risk escalation level"
        className="mt-4 w-full accent-rose-500"
        onChange={(e) => {
          const next = Number(e.target.value) as HeatLevel;
          onChange(next);
          onTick(next);
        }}
      />

      <div className="mt-2 flex justify-between text-[10px] font-bold tracking-wide text-[#9aa3b8]">
        {tiers.map((t) => (
          <button
            key={t.level}
            type="button"
            className="hover:text-white"
            style={{ color: level === t.level ? HEAT_COLORS[t.level] : undefined }}
            onClick={() => {
              onChange(t.level);
              onTick(t.level);
            }}
          >
            {t.level}
          </button>
        ))}
      </div>
      <p className="mt-3 text-xs text-[#9aa3b8]">
        Default forfeit: <span className="text-white/90">{tier.forfeit}</span>
      </p>
    </div>
  );
}
