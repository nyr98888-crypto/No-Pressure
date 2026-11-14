"use client";

import type { ReactNode } from "react";
import type { HeatLevel } from "@/lib/types";

export function HeatFrame({
  level,
  children,
  className = "",
}: {
  level: HeatLevel;
  children: ReactNode;
  className?: string;
}) {
  const embers =
    level >= 4
      ? Array.from({ length: level === 5 ? 18 : 8 }, (_, i) => (
          <span
            key={i}
            style={{
              left: `${8 + ((i * 17) % 84)}%`,
              animationDuration: `${1.4 + (i % 5) * 0.35}s`,
              animationDelay: `${(i % 7) * 0.12}s`,
              background: level === 5 ? "#ff1744" : "#ff6d00",
            }}
          />
        ))
      : null;

  return (
    <div className={`heat-frame heat-${level} relative overflow-hidden ${className}`}>
      {level === 3 && (
        <div className="hazard-pulse absolute right-3 top-3 z-10 rounded bg-black/70 px-2 py-0.5 text-[10px] font-black tracking-widest text-yellow-300">
          ⚠ HAZARD
        </div>
      )}
      {embers && <div className="ember-layer absolute inset-0 z-0">{embers}</div>}
      <div className="relative z-10">{children}</div>
    </div>
  );
}
