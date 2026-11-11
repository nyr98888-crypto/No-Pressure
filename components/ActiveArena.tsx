"use client";

import { useEffect, useState } from "react";

export interface ActiveArenaDare {
  tag: string;
  dare: string;
  script: string;
  stake: string;
  reversedDare: string;
  reversedStake: string;
}

interface ActiveArenaProps {
  challenger: string;
  victim: string;
  dare: ActiveArenaDare;
  duration?: number;
  onBack: () => void;
  onComplete: (
    verdict: "cleared" | "choked",
    meta?: { isReversed: boolean },
  ) => void;
}

export default function ActiveArena({
  challenger = "alex",
  victim = "dave",
  dare,
  duration = 30,
  onBack,
  onComplete,
}: ActiveArenaProps) {
  const [timeLeft, setTimeLeft] = useState(duration);
  const [isRunning, setIsRunning] = useState(false);
  const [isReversed, setIsReversed] = useState(false);

  useEffect(() => {
    if (!isRunning || timeLeft <= 0) {
      if (isRunning && timeLeft === 0) {
        setIsRunning(false);
        onComplete("choked", { isReversed });
      }
      return;
    }

    const interval = setInterval(() => {
      setTimeLeft((t) => t - 1);
    }, 1000);

    return () => clearInterval(interval);
  }, [isRunning, timeLeft, isReversed, onComplete]);

  const isCritical = timeLeft <= 5 && isRunning;
  const progressPct = (timeLeft / (isReversed ? 15 : duration)) * 100;

  const handleReverse = () => {
    setIsReversed(true);
    setTimeLeft(15);
    setIsRunning(true);
  };

  return (
    <div className="relative mx-auto flex h-[100dvh] w-full max-w-md select-none flex-col justify-between overflow-hidden bg-[#07070b] p-5 font-sans text-white">
      <div
        className={`pointer-events-none absolute top-1/3 left-1/2 h-[480px] w-[340px] -translate-x-1/2 -translate-y-1/2 rounded-full blur-[140px] transition-all duration-700 ${
          isCritical
            ? "scale-125 animate-pulse bg-red-600/40"
            : isReversed
              ? "bg-purple-600/35"
              : isRunning
                ? "bg-amber-500/25"
                : "bg-emerald-500/20"
        }`}
      />

      <header className="relative z-20 flex items-center justify-between pt-2">
        <button
          type="button"
          onClick={onBack}
          disabled={isRunning && !isCritical}
          className={`flex items-center gap-1.5 rounded-full border px-3 py-1.5 font-mono text-xs font-bold transition-all ${
            isRunning
              ? "cursor-not-allowed border-white/10 bg-white/[0.03] text-zinc-600"
              : "border-white/15 bg-white/[0.08] text-zinc-300 hover:bg-white/[0.15] active:scale-95"
          }`}
        >
          <span>←</span>
          <span>{isRunning ? "LOCKED" : "DECK"}</span>
        </button>

        <div className="flex items-center gap-2">
          <span
            className={`h-2 w-2 rounded-full ${
              isCritical
                ? "animate-ping bg-red-500"
                : isRunning
                  ? "animate-pulse bg-amber-400"
                  : "bg-emerald-400"
            }`}
          />
          <span className="text-[10px] font-black tracking-[0.25em] text-zinc-400 uppercase">
            {isRunning ? "SUDDEN DEATH" : "TRAP ARMED"}
          </span>
        </div>

        <div className="rounded-full border border-white/10 bg-white/[0.04] px-2 py-1 font-mono text-xs font-bold">
          <span className="text-emerald-400">
            @{isReversed ? victim : challenger}
          </span>
          <span className="px-1 text-zinc-600">vs</span>
          <span className="text-rose-400">
            @{isReversed ? challenger : victim}
          </span>
        </div>
      </header>

      <main className="relative z-10 my-auto flex flex-col justify-center space-y-6 px-1">
        <div>
          <span
            className={`inline-block rounded-full border px-3.5 py-1 font-mono text-[10px] font-black tracking-[0.2em] uppercase shadow-lg ${
              isReversed
                ? "border-purple-400 bg-purple-500/20 text-purple-300 shadow-purple-500/20"
                : "border-white/15 bg-white/[0.06] text-zinc-300"
            }`}
          >
            {isReversed ? "🔥 REVERSED COUNTER-TRAP" : dare.tag}
          </span>
        </div>

        <div className="space-y-3">
          <span className="block font-mono text-[10px] tracking-widest text-zinc-500 uppercase">
            DEMAND FOR @{isReversed ? challenger : victim}
          </span>
          <h1 className="text-xl leading-tight font-black text-white drop-shadow-[0_4px_16px_rgba(0,0,0,0.9)] sm:text-2xl">
            &quot;{isReversed ? dare.reversedDare : dare.dare}&quot;
          </h1>
        </div>

        <div className="rounded-r-2xl border-l-4 border-yellow-400 bg-yellow-400/[0.08] p-3.5 shadow-inner">
          <span className="mb-1 block text-[9px] font-black tracking-wider text-yellow-400 uppercase">
            SPOKEN SCRIPT / CAPTION
          </span>
          <p className="text-xs font-black tracking-wide text-yellow-300 italic uppercase sm:text-sm">
            {dare.script}
          </p>
        </div>

        <div className="inline-flex w-fit items-center gap-2 rounded-2xl border border-white/10 bg-black/50 px-3.5 py-2 text-xs font-black text-amber-300">
          <span className="font-mono text-[10px] text-zinc-500">PENALTY:</span>
          <span>{isReversed ? dare.reversedStake : dare.stake}</span>
        </div>

        <div className="space-y-3 border-t border-white/[0.08] pt-4">
          <div className="flex items-center justify-between px-1 font-mono text-[10px] tracking-widest text-zinc-500 uppercase">
            <span>{isCritical ? "🚨 DETONATION IMMINENT" : "COUNTDOWN WINDOW"}</span>
            <span>{timeLeft}s REMAINING</span>
          </div>

          <div
            className={`text-center font-mono text-6xl leading-none font-black tracking-tighter transition-all duration-150 sm:text-7xl ${
              isCritical
                ? "scale-110 text-red-500 drop-shadow-[0_0_35px_#ef4444]"
                : "text-white drop-shadow-[0_0_20px_rgba(255,255,255,0.4)]"
            }`}
          >
            00:{String(timeLeft).padStart(2, "0")}
          </div>

          <div className="h-1.5 w-full overflow-hidden rounded-full bg-white/10">
            <div
              className={`h-full transition-all duration-1000 ${
                isCritical
                  ? "bg-red-500 shadow-[0_0_15px_#ef4444]"
                  : "bg-gradient-to-r from-amber-400 via-rose-500 to-red-500"
              }`}
              style={{ width: `${progressPct}%` }}
            />
          </div>
        </div>
      </main>

      <footer className="relative z-20 space-y-2.5 pb-2">
        {!isRunning ? (
          <button
            type="button"
            onClick={() => setIsRunning(true)}
            className="flex w-full cursor-pointer items-center justify-center gap-2 rounded-2xl border-b-[4px] border-emerald-700 bg-gradient-to-r from-emerald-400 via-teal-400 to-emerald-500 py-4 text-xs font-black tracking-widest text-black uppercase shadow-[0_0_35px_rgba(16,185,129,0.4)] transition-all active:translate-y-1 active:border-b-0"
          >
            <span>⏱️</span>
            <span>ARM SUDDEN DEATH CLOCK ({duration}s)</span>
          </button>
        ) : (
          <div className="grid grid-cols-2 gap-2.5">
            <button
              type="button"
              onClick={() => onComplete("cleared", { isReversed })}
              className="flex items-center justify-center gap-1.5 rounded-2xl border-b-[4px] border-emerald-700 bg-emerald-500 py-4 text-xs font-black tracking-widest text-black uppercase shadow-[0_0_25px_rgba(16,185,129,0.35)] transition-all active:translate-y-1 active:border-b-0"
            >
              <span>👑</span>
              <span>HE DID IT</span>
            </button>
            <button
              type="button"
              disabled={isReversed}
              onClick={handleReverse}
              className={`flex items-center justify-center gap-1.5 rounded-2xl border-b-[4px] py-4 text-xs font-black tracking-widest uppercase transition-all ${
                isReversed
                  ? "cursor-not-allowed border-zinc-950 bg-zinc-800 text-zinc-500"
                  : "border-purple-900 bg-gradient-to-r from-purple-600 to-indigo-600 text-white shadow-[0_0_30px_rgba(168,85,247,0.45)] active:translate-y-1 active:border-b-0"
              }`}
            >
              <span>🔥</span>
              <span>REVERSE 2X</span>
            </button>
          </div>
        )}

        <button
          type="button"
          onClick={() => onComplete("choked", { isReversed })}
          className="flex w-full items-center justify-center gap-1.5 rounded-2xl border border-red-500/40 border-b-2 border-b-red-900 bg-[#130608] py-3 text-[11px] font-black tracking-wider text-red-400 uppercase shadow-[0_0_20px_rgba(239,68,68,0.2)] transition-all hover:bg-[#1a080b] active:translate-y-0.5 active:border-b-0"
        >
          <span>🤡</span>
          <span>I CHOKE & PAY FORFEIT</span>
        </button>
      </footer>
    </div>
  );
}
