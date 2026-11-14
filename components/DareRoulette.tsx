"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { Dices, Lock, Unlock } from "lucide-react";
import {
  SLOT_REEL_KEYS,
  SLOT_REELS,
  SLOT_STOP_MS,
  formatSpark,
  pickReelValue,
  type SlotReelKey,
} from "@/lib/slotReels";
import type { HeatLevel } from "@/lib/types";
import { iconSm, iconXs } from "./icons";

type ReelState = Record<SlotReelKey, string>;
type LockState = Record<SlotReelKey, boolean>;
type OffsetState = Record<SlotReelKey, number>;

const REEL_H = 52; // px — matches .reel-item height
const STRIP_LOOPS = 12;
const SPIN_PX_PER_MS = 2.35; // high-speed downward scroll

function randomReels(): ReelState {
  return {
    SETTING: pickReelValue("SETTING"),
    ENERGY: pickReelValue("ENERGY"),
    TWIST: pickReelValue("TWIST"),
    FOCUS: pickReelValue("FOCUS"),
  };
}

function indexOfValue(key: SlotReelKey, value: string) {
  const i = SLOT_REELS[key].indexOf(value as never);
  return i >= 0 ? i : 0;
}

/** Pixel offset so pool index lands on the center payline of a 3-row window. */
function offsetForIndex(key: SlotReelKey, index: number, loop = 4) {
  const poolLen = SLOT_REELS[key].length;
  // Center row is the 2nd visible cell → shift by -1 item
  return -((loop * poolLen + index - 1) * REEL_H);
}

function offsetsFromReels(reels: ReelState): OffsetState {
  return {
    SETTING: offsetForIndex("SETTING", indexOfValue("SETTING", reels.SETTING)),
    ENERGY: offsetForIndex("ENERGY", indexOfValue("ENERGY", reels.ENERGY)),
    TWIST: offsetForIndex("TWIST", indexOfValue("TWIST", reels.TWIST)),
    FOCUS: offsetForIndex("FOCUS", indexOfValue("FOCUS", reels.FOCUS)),
  };
}

function buildStrip(key: SlotReelKey) {
  const pool = SLOT_REELS[key];
  const out: string[] = [];
  for (let i = 0; i < STRIP_LOOPS; i++) out.push(...pool);
  return out;
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
  // Deterministic placeholders — Math.random() only after mount (never during prerender)
  const seed = useMemo(
    () =>
      ({
        SETTING: SLOT_REELS.SETTING[0]!,
        ENERGY: SLOT_REELS.ENERGY[0]!,
        TWIST: SLOT_REELS.TWIST[0]!,
        FOCUS: SLOT_REELS.FOCUS[0]!,
      }) satisfies ReelState,
    []
  );
  const [reels, setReels] = useState<ReelState>(seed);
  const [offsets, setOffsets] = useState<OffsetState>(() =>
    offsetsFromReels(seed)
  );
  const [locked, setLocked] = useState<LockState>({
    SETTING: false,
    ENERGY: false,
    TWIST: false,
    FOCUS: false,
  });
  const [spinning, setSpinning] = useState(false);
  const [activeSpin, setActiveSpin] = useState<Partial<Record<SlotReelKey, boolean>>>({});
  const [locking, setLocking] = useState<Partial<Record<SlotReelKey, boolean>>>({});

  const timers = useRef<number[]>([]);
  const rafRef = useRef<number | null>(null);
  const lockedRef = useRef(locked);
  const offsetsRef = useRef(offsets);
  const activeSpinRef = useRef(activeSpin);
  const lastTickRef = useRef(0);
  lockedRef.current = locked;
  offsetsRef.current = offsets;
  activeSpinRef.current = activeSpin;

  const strips = useMemo(
    () =>
      Object.fromEntries(
        SLOT_REEL_KEYS.map((k) => [k, buildStrip(k)])
      ) as Record<SlotReelKey, string[]>,
    []
  );

  const clearTimers = () => {
    timers.current.forEach((id) => window.clearTimeout(id));
    timers.current = [];
    if (rafRef.current != null) {
      cancelAnimationFrame(rafRef.current);
      rafRef.current = null;
    }
  };

  useEffect(() => {
    const initial = randomReels();
    setReels(initial);
    setOffsets(offsetsFromReels(initial));
  }, []);

  useEffect(() => () => clearTimers(), []);

  const spin = () => {
    if (spinning) return;
    const locks = lockedRef.current;
    const unlocked = SLOT_REEL_KEYS.filter((k) => !locks[k]);
    if (!unlocked.length) return;

    clearTimers();
    setSpinning(true);
    setLocking({});

    const finals: ReelState = { ...reels };
    for (const key of unlocked) {
      finals[key] = pickReelValue(key);
    }

    const motionOff =
      document.documentElement.classList.contains("reduce-motion");

    if (motionOff) {
      setReels(finals);
      setOffsets(offsetsFromReels(finals));
      setActiveSpin({});
      setLocking({});
      setSpinning(false);
      onPop();
      return;
    }

    const spinningMap: Partial<Record<SlotReelKey, boolean>> = {};
    for (const key of unlocked) spinningMap[key] = true;
    setActiveSpin(spinningMap);
    activeSpinRef.current = spinningMap;
    lastTickRef.current = performance.now();

    const loop = () => {
      const now = performance.now();
      const dt = Math.min(32, now - lastTickRef.current);
      lastTickRef.current = now;
      const delta = SPIN_PX_PER_MS * dt;

      setOffsets((prev) => {
        const next = { ...prev };
        let changed = false;
        for (const key of SLOT_REEL_KEYS) {
          if (!activeSpinRef.current[key]) continue;
          // More negative = strip moves up → symbols scroll downward through the window
          next[key] = prev[key]! - delta;
          const poolLen = SLOT_REELS[key].length;
          const cycle = poolLen * REEL_H;
          const min = -(STRIP_LOOPS - 4) * cycle;
          const max = -2 * cycle;
          while (next[key]! < min) next[key]! += cycle;
          while (next[key]! > max) next[key]! -= cycle;
          changed = true;
        }
        if (changed) offsetsRef.current = next;
        return changed ? next : prev;
      });

      rafRef.current = requestAnimationFrame(loop);
    };
    rafRef.current = requestAnimationFrame(loop);

    const tickId = window.setInterval(() => onTick(), 90);
    timers.current.push(tickId);

    unlocked.forEach((key, i) => {
      const delay = SLOT_STOP_MS[Math.min(i, SLOT_STOP_MS.length - 1)]!;
      const id = window.setTimeout(() => {
        // Freeze this reel's continuous spin, then snap/bounce to final
        setActiveSpin((s) => {
          const next = { ...s, [key]: false };
          activeSpinRef.current = next;
          return next;
        });

        const finalIdx = indexOfValue(key, finals[key]!);
        const current = offsetsRef.current[key]!;
        const poolLen = SLOT_REELS[key].length;
        const cycle = poolLen * REEL_H;

        // Nearest future loop landing (keep scrolling "down" / more negative)
        let target = offsetForIndex(key, finalIdx, 6);
        while (target > current) target -= cycle;
        while (current - target > cycle * 2) target += cycle;
        // One extra loop of travel so deceleration feels mechanical
        target -= cycle;

        setLocking((l) => ({ ...l, [key]: true }));
        setOffsets((prev) => {
          const next = { ...prev, [key]: target };
          offsetsRef.current = next;
          return next;
        });
        setReels((prev) => ({ ...prev, [key]: finals[key]! }));
        onTick();

        const unlockId = window.setTimeout(() => {
          setLocking((l) => ({ ...l, [key]: false }));
        }, 440);
        timers.current.push(unlockId);

        if (i === unlocked.length - 1) {
          window.clearInterval(tickId);
          const doneId = window.setTimeout(() => {
            if (rafRef.current != null) {
              cancelAnimationFrame(rafRef.current);
              rafRef.current = null;
            }
            setSpinning(false);
            setActiveSpin({});
            activeSpinRef.current = {};
            setReels(finals);
            // Normalize offsets to a mid-strip equivalent (no visual jump)
            setOffsets((prev) => {
              const next = { ...prev };
              for (const k of SLOT_REEL_KEYS) {
                const idx = indexOfValue(k, finals[k]!);
                const poolLen = SLOT_REELS[k].length;
                const cycle = poolLen * REEL_H;
                let target = offsetForIndex(k, idx, 4);
                const cur = prev[k]!;
                while (target - cur > cycle / 2) target -= cycle;
                while (cur - target > cycle / 2) target += cycle;
                next[k] = target;
              }
              offsetsRef.current = next;
              return next;
            });
            onPop();
          }, 460);
          timers.current.push(doneId);
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
        <p className="inline-flex items-center gap-2 font-[family-name:var(--font-display)] text-lg font-black tracking-tight">
          <Dices {...iconSm} />
          Dare Slots
        </p>
        <span className="text-[10px] font-bold tracking-widest text-[#9aa3b8]">
          LVL {level}
        </span>
      </div>

      <div className="mt-3 grid grid-cols-2 gap-2 sm:grid-cols-4">
        {SLOT_REEL_KEYS.map((key) => {
          const isSpinning = Boolean(activeSpin[key]);
          const isLocking = Boolean(locking[key]);

          return (
            <div
              key={key}
              className={`relative rounded-xl border bg-black/50 p-2 ${
                locked[key]
                  ? "border-amber-400/50"
                  : isSpinning
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
                  className={`inline-flex items-center rounded px-1.5 py-0.5 ${
                    locked[key]
                      ? "bg-amber-500/30 text-amber-200"
                      : "bg-white/5 text-[#9aa3b8]"
                  }`}
                  onClick={() => toggleLock(key)}
                >
                  {locked[key] ? <Lock {...iconXs} /> : <Unlock {...iconXs} />}
                </button>
              </div>

              <div
                className={`reel-window mt-2 ${isSpinning ? "reel-spinning" : ""}`}
              >
                <div className="reel-payline" aria-hidden />
                <div
                  className={`reel-strip ${isLocking ? "reel-locking" : ""}`}
                  style={{
                    transform: `translate3d(0, ${offsets[key]}px, 0)`,
                    transition: isSpinning
                      ? "none"
                      : isLocking
                        ? undefined
                        : "transform 180ms cubic-bezier(0.2, 0.9, 0.2, 1)",
                  }}
                >
                  {strips[key].map((item, i) => (
                    <div key={`${key}-${i}`} className="reel-item">
                      {item}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          );
        })}
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
