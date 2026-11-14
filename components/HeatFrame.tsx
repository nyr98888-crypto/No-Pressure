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
    <div
      className={`heat-frame heat-${level} relative overflow-hidden ${className}`}
      data-np-level={level}
    >
      {embers && <div className="ember-layer absolute inset-0 z-0">{embers}</div>}
      <div className="relative z-10">{children}</div>
    </div>
  );
}
