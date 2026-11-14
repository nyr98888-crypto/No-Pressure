"use client";

import { useEffect, useRef, useState } from "react";
import {
  SLOT_REEL_KEYS,
  SLOT_REELS,
  SLOT_STOP_MS,
  formatSpark,
  pickReelValue,
  type SlotReelKey,
} from "@/lib/slotReels";
import type { HeatLevel } from "@/lib/types";

type ReelState = Record<SlotReelKey, string>;
type LockState = Record<SlotReelKey, boolean>;

function randomReels(): ReelState {
  return {
    SETTING: pickReelValue("SETTING"),
    ENERGY: pickReelValue("ENERGY"),
    TWIST: pickReelValue("TWIST"),
    FOCUS: pickReelValue("FOCUS"),
  };
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
  const [reels, setReels] = useState<ReelState>(randomReels);
  const [locked, setLocked] = useState<LockState>({
    SETTING: false,
    ENERGY: false,
    TWIST: false,
    FOCUS: false,
  });
  const [spinning, setSpinning] = useState(false);
  const [stopping, setStopping] = useState<Partial<Record<SlotReelKey, boolean>>>(
    {}
  );
  const timers = useRef<number[]>([]);
  const tickRef = useRef<number | null>(null);
  const lockedRef = useRef(locked);
  lockedRef.current = locked;

  const clearTimers = () => {
    timers.current.forEach((id) => window.clearTimeout(id));
    timers.current = [];
    if (tickRef.current != null) {
      window.clearInterval(tickRef.current);
      tickRef.current = null;
    }
  };

  useEffect(() => () => clearTimers(), []);

  const reduceMotion =
    typeof document !== "undefined" &&
    document.documentElement.classList.contains("reduce-motion");

  const spin = () => {
    if (spinning) return;
    const locks = lockedRef.current;
    const unlocked = SLOT_REEL_KEYS.filter((k) => !locks[k]);
    if (!unlocked.length) return;

    clearTimers();
    setSpinning(true);
    setStopping({});

    const finals: ReelState = { ...reels };
    for (const key of unlocked) {
      finals[key] = pickReelValue(key);
    }

    const motionOff =
      document.documentElement.classList.contains("reduce-motion");

    if (motionOff) {
      setReels(finals);
      setSpinning(false);
      onPop();
      return;
    }

    // Rapid mechanical ticks while unlocked reels scramble
    tickRef.current = window.setInterval(() => {
      setReels((prev) => {
        const next = { ...prev };
        for (const key of unlocked) {
          const pool = SLOT_REELS[key];
          next[key] = pool[Math.floor(Math.random() * pool.length)]!;
        }
        return next;
      });
      onTick();
    }, 55);

    unlocked.forEach((key, i) => {
      const delay = SLOT_STOP_MS[Math.min(i, SLOT_STOP_MS.length - 1)]!;
      const id = window.setTimeout(() => {
        setStopping((s) => ({ ...s, [key]: true }));
        setReels((prev) => ({ ...prev, [key]: finals[key] }));
        onTick();

        if (i === unlocked.length - 1) {
          if (tickRef.current != null) {
            window.clearInterval(tickRef.current);
            tickRef.current = null;
          }
          setSpinning(false);
          setStopping({});
          onPop();
        }
      }, delay);
      timers.current.push(id);
    });
  };

  const toggleLock = (key: SlotReelKey) => {
    if (spinning) return;
    setLocked((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  const useSpark = () => {
    onLand(formatSpark(reels));
  };

  return (
    <div className="glass-panel rounded-2xl p-4">
      <div className="flex items-center justify-between">
        <p className="font-[family-name:var(--font-display)] text-lg font-black">
          🎰 Inspiration Slots
        </p>
        <span className="text-[10px] font-bold tracking-widest text-[#9aa3b8]">
          LVL {level}
        </span>
      </div>

      <div className="mt-3 grid grid-cols-2 gap-2 sm:grid-cols-4">
        {SLOT_REEL_KEYS.map((key) => (
          <div
            key={key}
            className={`relative rounded-xl border bg-black/40 p-2 ${
              locked[key]
                ? "border-amber-400/50"
                : stopping[key]
                  ? "border-emerald-400/40"
                  : "border-white/10"
            }`}
          >
            <div className="flex items-center justify-between gap-1">
              <p className="text-[9px] font-black tracking-[0.14em] text-[#9aa3b8]">
                {key}
              </p>
              <button
                type="button"
                disabled={spinning}
                aria-label={locked[key] ? `Unlock ${key}` : `Lock ${key}`}
                className={`rounded px-1.5 py-0.5 text-[10px] ${
                  locked[key] ? "bg-amber-500/30 text-amber-200" : "bg-white/5 text-[#9aa3b8]"
                }`}
                onClick={() => toggleLock(key)}
              >
                🔒
              </button>
            </div>
            <p
              className={`mt-2 min-h-12 text-center text-[11px] font-bold leading-snug ${
                spinning && !locked[key] && !reduceMotion ? "opacity-80" : "text-white"
              }`}
            >
              {reels[key]}
            </p>
          </div>
        ))}
      </div>

      <div className="mt-3 flex gap-2">
        <button
          type="button"
          disabled={spinning || SLOT_REEL_KEYS.every((k) => locked[k])}
          className="pill-3d flex-1 bg-gradient-to-b from-amber-300 to-orange-600 px-4 py-3 text-sm text-black disabled:opacity-50"
          onClick={spin}
        >
          {spinning ? "Spinning…" : "Spin the Heat"}
        </button>
        <button
          type="button"
          disabled={spinning}
          className="pill-3d flex-1 bg-gradient-to-b from-rose-500 to-rose-700 px-4 py-3 text-sm text-white disabled:opacity-50"
          onClick={useSpark}
        >
          Use Spark →
        </button>
      </div>
    </div>
  );
}
