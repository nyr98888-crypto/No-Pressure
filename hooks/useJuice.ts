"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { LS } from "@/lib/storageKeys";

type JuiceKind = "tick" | "slot" | "boom" | "cap" | "pop" | "lock" | "error";

function vibrate(pattern: number | number[]) {
  try {
    navigator.vibrate?.(pattern);
  } catch {
    /* ignore */
  }
}

export function useJuice() {
  const ctxRef = useRef<AudioContext | null>(null);
  const [soundOn, setSoundOn] = useState(true);

  useEffect(() => {
    const saved = localStorage.getItem(LS.sound);
    if (saved != null) setSoundOn(saved === "1");
  }, []);

  const toggleSound = useCallback(() => {
    setSoundOn((prev) => {
      const next = !prev;
      localStorage.setItem(LS.sound, next ? "1" : "0");
      return next;
    });
  }, []);

  const ensureCtx = useCallback(async () => {
    if (!ctxRef.current) {
      ctxRef.current = new AudioContext();
    }
    if (ctxRef.current.state === "suspended") {
      await ctxRef.current.resume();
    }
    return ctxRef.current;
  }, []);

  /** Deep tactile UI hit: sine + lowpass, fast pitch drop */
  const playDeep = useCallback(
    async (
      fromHz: number,
      toHz: number,
      durationSec: number,
      peakGain: number,
      opts?: { thud?: boolean }
    ) => {
      if (!soundOn) return;
      const ctx = await ensureCtx();
      const t0 = ctx.currentTime;
      const osc = ctx.createOscillator();
      const filter = ctx.createBiquadFilter();
      const g = ctx.createGain();

      osc.type = "sine";
      osc.frequency.setValueAtTime(fromHz, t0);
      osc.frequency.exponentialRampToValueAtTime(Math.max(20, toHz), t0 + durationSec);

      filter.type = "lowpass";
      filter.frequency.setValueAtTime(opts?.thud ? 180 : 320, t0);
      filter.Q.setValueAtTime(0.7, t0);

      g.gain.setValueAtTime(0.0001, t0);
      g.gain.exponentialRampToValueAtTime(peakGain, t0 + 0.008);
      if (opts?.thud) {
        g.gain.exponentialRampToValueAtTime(0.0001, t0 + durationSec);
      } else {
        g.gain.exponentialRampToValueAtTime(peakGain * 0.35, t0 + durationSec * 0.45);
        g.gain.exponentialRampToValueAtTime(0.0001, t0 + durationSec);
      }

      osc.connect(filter);
      filter.connect(g);
      g.connect(ctx.destination);
      osc.start(t0);
      osc.stop(t0 + durationSec + 0.02);
    },
    [ensureCtx, soundOn]
  );

  const juice = useCallback(
    async (kind: JuiceKind, _detail?: number) => {
      switch (kind) {
        case "tick":
        case "slot":
        case "lock": {
          vibrate(kind === "lock" ? 18 : kind === "slot" ? 6 : 8);
          // Low-end mechanical click: 120Hz → 45Hz, 35ms
          await playDeep(120, 45, 0.035, kind === "lock" ? 0.12 : 0.1);
          break;
        }
        case "boom":
        case "pop": {
          vibrate(kind === "boom" ? [30, 40, 60] : 12);
          // Deep sub-bass punch: 90Hz → 28Hz, 220ms
          await playDeep(90, 28, 0.22, 0.18);
          break;
        }
        case "cap":
        case "error": {
          vibrate(kind === "cap" ? [20, 30, 20, 30, 40] : 24);
          // Muted low thud
          await playDeep(70, 32, 0.12, 0.07, { thud: true });
          break;
        }
      }
    },
    [playDeep]
  );

  return { juice, soundOn, toggleSound };
}
