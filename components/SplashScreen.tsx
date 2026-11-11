"use client";

import { useState } from "react";

function playEntrySound() {
  if (typeof window === "undefined") return;
  try {
    const AudioCtx =
      window.AudioContext ||
      (window as unknown as { webkitAudioContext: typeof AudioContext })
        .webkitAudioContext;
    const ctx = new AudioCtx();
    if (ctx.state === "suspended") void ctx.resume();

    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = "sine";
    osc.frequency.setValueAtTime(140, ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(35, ctx.currentTime + 0.35);
    gain.gain.setValueAtTime(0.4, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.35);
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start();
    osc.stop(ctx.currentTime + 0.35);
  } catch {
    // Audio context blocked fallback
  }
}

export default function SplashScreen({ onEnter }: { onEnter: () => void }) {
  const [isPressing, setIsPressing] = useState(false);

  const handlePress = () => {
    setIsPressing(true);
    playEntrySound();
    navigator.vibrate?.([40, 30, 60]);
    setTimeout(() => {
      onEnter();
    }, 220);
  };

  return (
    <div className="relative mx-auto flex h-[100dvh] w-full max-w-md select-none flex-col justify-between overflow-hidden bg-[#050508] p-6 font-sans text-white">
      <div className="pointer-events-none absolute top-1/2 left-1/2 h-[340px] w-[340px] -translate-x-1/2 -translate-y-1/2 animate-pulse rounded-full bg-rose-600/30 blur-[140px]" />
      <div className="pointer-events-none absolute top-1/2 left-1/2 h-[220px] w-[220px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-amber-500/20 blur-[90px]" />

      <header className="relative z-10 flex items-center justify-between pt-3">
        <div className="flex items-center gap-2">
          <span className="h-2 w-2 animate-pulse rounded-full bg-emerald-400 shadow-[0_0_8px_#34d399]" />
          <span className="font-mono text-[10px] font-black tracking-[0.3em] text-zinc-400 uppercase">
            ONLINE // 2026.1
          </span>
        </div>
        <span className="font-mono text-[10px] font-bold tracking-widest text-zinc-600 uppercase">
          HIGH STAKES
        </span>
      </header>

      <main className="relative z-10 my-auto flex flex-col items-center space-y-4 px-2 text-center">
        <div className="inline-flex items-center gap-1.5 rounded-full border border-white/10 bg-white/[0.04] px-3 py-1 shadow-lg backdrop-blur-md">
          <span className="text-xs">⚠️</span>
          <span className="font-mono text-[9px] font-black tracking-[0.25em] text-zinc-300 uppercase">
            SOCIAL SUDDEN DEATH
          </span>
        </div>

        <div className="space-y-1">
          <h1 className="bg-gradient-to-b from-white via-zinc-100 to-zinc-400 bg-clip-text text-5xl leading-[0.9] font-black tracking-tighter text-transparent uppercase drop-shadow-[0_4px_25px_rgba(255,255,255,0.25)] sm:text-6xl">
            BET YOU
            <br />
            <span className="bg-gradient-to-r from-rose-500 via-red-500 to-amber-500 bg-clip-text text-transparent drop-shadow-[0_0_35px_rgba(244,63,94,0.6)]">
              LOSE
            </span>
          </h1>
        </div>

        <p className="max-w-[280px] pt-2 text-xs leading-relaxed font-bold text-zinc-400 sm:text-sm">
          Pick a victim. Deal 3 lethal dares. 30 seconds before detonation.
        </p>

        <div className="flex items-center gap-2 pt-2 font-mono text-[10px] font-bold text-zinc-500">
          <span className="rounded-xl border border-white/5 bg-white/[0.03] px-2.5 py-1">
            0MS LATENCY
          </span>
          <span>•</span>
          <span className="rounded-xl border border-white/5 bg-white/[0.03] px-2.5 py-1">
            DOUBLE DARE
          </span>
          <span>•</span>
          <span className="rounded-xl border border-white/5 bg-white/[0.03] px-2.5 py-1">
            THE RECEIPT
          </span>
        </div>
      </main>

      <footer className="relative z-10 pb-6">
        <div className="group relative">
          <div className="pointer-events-none absolute -inset-1 animate-pulse rounded-3xl bg-gradient-to-r from-rose-600 to-amber-500 opacity-75 blur-md transition duration-300 group-hover:opacity-100" />
          <button
            type="button"
            onClick={handlePress}
            className={`relative flex w-full cursor-pointer items-center justify-center gap-2 rounded-2xl border-b-[5px] border-red-950 bg-gradient-to-r from-red-600 via-rose-600 to-amber-600 py-5 text-sm font-black tracking-[0.2em] text-white uppercase shadow-[0_0_30px_rgba(225,29,72,0.5)] transition-all ${
              isPressing
                ? "translate-y-1.5 border-b-0 brightness-125"
                : "hover:brightness-110 active:translate-y-1.5 active:border-b-0"
            }`}
          >
            <span className="animate-bounce text-base">⚡</span>
            <span>ENTER THE ARENA</span>
          </button>
        </div>
        <div className="mt-3 text-center">
          <span className="font-mono text-[9px] font-bold tracking-widest text-zinc-600 uppercase">
            Tap to prime audio engine & arm deck
          </span>
        </div>
      </footer>
    </div>
  );
}
