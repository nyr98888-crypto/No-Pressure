"use client";

import { useEffect, useRef, useState } from "react";
import { rouletteDares } from "@/lib/darePool";
import type { HeatLevel } from "@/lib/types";

function pickRandomDare(level: HeatLevel): string {
  const pool = rouletteDares(level);
  if (!pool.length) return "";
  return pool[Math.floor(Math.random() * pool.length)].text;
}

export function DareRoulette({
  level,
  onLand,
  onTick,
  onPop,
}: {
  level: HeatLevel;
  onLand: (text: string) => void;
  onTick: () => void;
  onPop: () => void;
}) {
  const [spinning, setSpinning] = useState(false);
  const [display, setDisplay] = useState("");
  const timer = useRef<number | null>(null);
  const onLandRef = useRef(onLand);
  onLandRef.current = onLand;

  useEffect(() => {
    if (timer.current != null) {
      window.clearTimeout(timer.current);
      timer.current = null;
    }
    setSpinning(false);
    const text = pickRandomDare(level);
    setDisplay(text);
    onLandRef.current(text);
    return () => {
      if (timer.current != null) {
        window.clearTimeout(timer.current);
        timer.current = null;
      }
    };
  }, [level]);

  const spin = () => {
    if (spinning) return;
    const pool = rouletteDares(level);
    if (!pool.length) return;
    setSpinning(true);
    let i = 0;
    let delay = 40;
    let landed = pool[0].text;

    const tick = () => {
      const pick = pool[i % pool.length];
      landed = pick.text;
      setDisplay(landed);
      onTick();
      i += 1;
      delay += 18;
      if (delay < 280) {
        timer.current = window.setTimeout(tick, delay);
      } else {
        timer.current = null;
        setDisplay(landed);
        setSpinning(false);
        onLand(landed);
        onPop();
      }
    };
    tick();
  };

  return (
    <div className="glass-panel rounded-2xl p-4">
      <div className="flex items-center justify-between">
        <p className="font-[family-name:var(--font-display)] text-lg font-black">
          🎰 Dare Roulette
        </p>
        <span className="text-[10px] font-bold tracking-widest text-[#9aa3b8]">
          LVL {level}
        </span>
      </div>
      <div className="mt-3 min-h-20 rounded-xl border border-white/10 bg-black/30 px-3 py-4 text-center text-sm font-semibold leading-relaxed">
        {display || "…"}
      </div>
      <button
        type="button"
        disabled={spinning}
        className="pill-3d mt-3 w-full bg-gradient-to-b from-amber-300 to-orange-600 px-4 py-3 text-sm text-black"
        onClick={spin}
      >
        {spinning ? "Spinning…" : "Spin the Heat"}
      </button>
    </div>
  );
}
