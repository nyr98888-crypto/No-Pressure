"use client";

import { useState } from "react";

export interface ChallengeCard {
  id: "blue" | "yellow" | "red";
  tierLabel: string;
  channelName: string;
  dare: string;
  script: string;
  stake: string;
  theme: {
    baseBorder: string;
    glowColor: string;
    glowGradient: string;
    badgeBg: string;
    badgeText: string;
    scriptText: string;
    activeBorder: string;
    accentHex: string;
  };
}

export const CHANNEL_CARDS: ChallengeCard[] = [
  {
    id: "blue",
    tierLabel: "CHANNEL 01",
    channelName: "READ-RECEIPT TRAP",
    dare: "Screenshot your battery percentage and DM it to your last match with 'Us?' Zero explanation for 20 minutes.",
    script: '"SEND BATTERY PERCENTAGE. NO CLARIFICATION."',
    stake: "Covers morning iced coffee & pastries ☕",
    theme: {
      baseBorder: "border-blue-600/35",
      glowColor: "rgba(37,99,235,0.7)",
      glowGradient: "from-blue-700 via-blue-600 to-indigo-800",
      badgeBg: "bg-blue-600/15 border-blue-500/40",
      badgeText: "text-blue-400",
      scriptText: "text-blue-200",
      activeBorder: "border-blue-500 shadow-[0_0_30px_#2563eb]",
      accentHex: "#2563eb",
    },
  },
  {
    id: "yellow",
    tierLabel: "CHANNEL 02",
    channelName: "SPEAKERPHONE AMBUSH",
    dare: "Call a local pizza shop on speaker and ask if their tap water is certified gluten-free & organic.",
    script: '"YES HELLO, DO YOU FILTER YOUR PIPES FOR SYNTHETIC CALCIUM?"',
    stake: "Covers the entire table's bar tab tonight 🍻",
    theme: {
      baseBorder: "border-yellow-500/35",
      glowColor: "rgba(234,179,8,0.7)",
      glowGradient: "from-yellow-500 via-amber-400 to-yellow-600",
      badgeBg: "bg-yellow-500/15 border-yellow-400/40",
      badgeText: "text-yellow-300",
      scriptText: "text-yellow-100",
      activeBorder: "border-yellow-400 shadow-[0_0_30px_#eab308]",
      accentHex: "#eab308",
    },
  },
  {
    id: "red",
    tierLabel: "CHANNEL 03",
    channelName: "DIGITAL HOSTAGE",
    dare: "Hand your unlocked phone to @challenger for 45s to post any existing photo from your roll to IG Story.",
    script: '"PHONE UNLOCKED. CAMERA ROLL IS FAIR GAME."',
    stake: "Clown PFP across ALL socials for 7 days + $150 dinner 🥩",
    theme: {
      baseBorder: "border-red-600/40",
      glowColor: "rgba(220,38,38,0.8)",
      glowGradient: "from-red-700 via-red-600 to-rose-900",
      badgeBg: "bg-red-600/15 border-red-500/40",
      badgeText: "text-red-400",
      scriptText: "text-red-200",
      activeBorder: "border-red-500 shadow-[0_0_35px_#dc2626]",
      accentHex: "#dc2626",
    },
  },
];

function playHeavyMechanicalClank() {
  if (typeof window === "undefined") return;
  try {
    const AudioCtx =
      window.AudioContext ||
      (window as unknown as { webkitAudioContext: typeof AudioContext })
        .webkitAudioContext;
    const ctx = new AudioCtx();
    if (ctx.state === "suspended") void ctx.resume();

    const snapOsc = ctx.createOscillator();
    const snapGain = ctx.createGain();
    snapOsc.type = "triangle";
    snapOsc.frequency.setValueAtTime(340, ctx.currentTime);
    snapOsc.frequency.exponentialRampToValueAtTime(70, ctx.currentTime + 0.05);
    snapGain.gain.setValueAtTime(0.35, ctx.currentTime);
    snapGain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.05);
    snapOsc.connect(snapGain);
    snapGain.connect(ctx.destination);
    snapOsc.start();
    snapOsc.stop(ctx.currentTime + 0.05);

    const subOsc = ctx.createOscillator();
    const subGain = ctx.createGain();
    subOsc.type = "sine";
    subOsc.frequency.setValueAtTime(130, ctx.currentTime);
    subOsc.frequency.exponentialRampToValueAtTime(26, ctx.currentTime + 0.32);
    subGain.gain.setValueAtTime(0.6, ctx.currentTime + 0.02);
    subGain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.32);
    subOsc.connect(subGain);
    subGain.connect(ctx.destination);
    subOsc.start(ctx.currentTime + 0.02);
    subOsc.stop(ctx.currentTime + 0.32);

    setTimeout(() => {
      try {
        const latchOsc = ctx.createOscillator();
        const latchGain = ctx.createGain();
        latchOsc.type = "sawtooth";
        latchOsc.frequency.setValueAtTime(190, ctx.currentTime);
        latchOsc.frequency.exponentialRampToValueAtTime(
          40,
          ctx.currentTime + 0.14,
        );
        latchGain.gain.setValueAtTime(0.28, ctx.currentTime);
        latchGain.gain.exponentialRampToValueAtTime(
          0.001,
          ctx.currentTime + 0.14,
        );
        latchOsc.connect(latchGain);
        latchGain.connect(ctx.destination);
        latchOsc.start();
        latchOsc.stop(ctx.currentTime + 0.14);
      } catch {
        // Latch click optional
      }
    }, 260);
  } catch {
    // Audio blocked
  }
}

export default function DeepTactileDeck({
  onCardSelected,
  onCancel,
}: {
  onCardSelected: (card: ChallengeCard) => void;
  onCancel?: () => void;
}) {
  const [activePressId, setActivePressId] = useState<string | null>(null);
  const [isEngaged, setIsEngaged] = useState(false);

  const handleCardClick = (card: ChallengeCard) => {
    if (isEngaged) return;
    setIsEngaged(true);
    setActivePressId(card.id);
    playHeavyMechanicalClank();
    navigator.vibrate?.([40, 50, 100]);
    setTimeout(() => {
      onCardSelected(card);
    }, 620);
  };

  return (
    <div className="relative mx-auto flex h-[100dvh] w-full max-w-md select-none flex-col justify-between overflow-hidden bg-[#050508] p-5 font-sans text-white">
      <header className="relative z-20 flex items-center justify-between pt-2">
        <div className="flex items-center gap-2">
          <span className="h-2 w-2 rounded-full bg-emerald-400 shadow-[0_0_8px_#34d399]" />
          <span className="font-mono text-[10px] font-bold tracking-[0.25em] text-zinc-400 uppercase">
            3-CHANNEL WEAPON DECK
          </span>
        </div>
        <div className="flex items-center gap-3">
          <span className="font-mono text-xs font-bold text-zinc-500 uppercase">
            ROYAL • GOLD • RED
          </span>
          {onCancel && !isEngaged ? (
            <button
              type="button"
              onClick={onCancel}
              className="font-mono text-[10px] text-zinc-500 uppercase hover:text-zinc-300"
            >
              ← Back
            </button>
          ) : null}
        </div>
      </header>

      <main className="relative z-10 my-auto flex flex-col justify-center gap-4">
        {CHANNEL_CARDS.map((card) => {
          const isPressed = activePressId === card.id;
          const isDimmed = isEngaged && !isPressed;

          return (
            <button
              key={card.id}
              type="button"
              onClick={() => handleCardClick(card)}
              className={`group relative cursor-pointer text-left transition-all duration-300 ${
                isDimmed
                  ? "pointer-events-none scale-[0.96] opacity-15 blur-[2px]"
                  : ""
              }`}
            >
              <div
                className={`pointer-events-none absolute -inset-1.5 rounded-[32px] bg-gradient-to-r transition-all duration-300 ${
                  card.theme.glowGradient
                } ${
                  isPressed
                    ? "scale-105 opacity-100 blur-2xl"
                    : "opacity-25 blur-xl group-hover:opacity-60"
                }`}
              />

              <div
                style={{
                  transform: isPressed ? "translateY(8px)" : "translateY(0px)",
                }}
                className={`relative rounded-[28px] border bg-gradient-to-b from-white/[0.08] via-[#090910] to-[#030306] p-5 backdrop-blur-2xl transition-all duration-150 ${
                  isPressed
                    ? `${card.theme.activeBorder} shadow-[inset_0_10px_25px_rgba(0,0,0,0.95)]`
                    : `${card.theme.baseBorder} shadow-[0_14px_35px_rgba(0,0,0,0.85),inset_0_1px_1px_rgba(255,255,255,0.2)] hover:border-white/20 active:translate-y-2`
                }`}
              >
                <div
                  className={`mb-3 h-[1px] w-full transition-opacity duration-300 ${
                    isPressed ? "bg-white/50 opacity-100" : "bg-white opacity-20"
                  }`}
                />

                <div className="mb-2.5 flex items-center justify-between">
                  <span
                    className={`rounded-full border px-2.5 py-0.5 font-mono text-[9px] font-black tracking-widest uppercase transition-colors ${card.theme.badgeBg} ${card.theme.badgeText}`}
                  >
                    {card.tierLabel} • {card.channelName}
                  </span>
                  <div className="flex items-center gap-1.5 font-mono text-[9px]">
                    <span
                      className={`h-1.5 w-1.5 rounded-full transition-all duration-200 ${
                        isPressed
                          ? "scale-125 bg-white shadow-[0_0_10px_#ffffff]"
                          : "bg-zinc-600"
                      }`}
                    />
                    <span
                      className={
                        isPressed ? "font-bold text-white" : "text-zinc-500"
                      }
                    >
                      {isPressed ? "LATCHED" : "ARMED"}
                    </span>
                  </div>
                </div>

                <h3 className="text-sm leading-snug font-bold tracking-tight text-white drop-shadow-[0_2px_8px_rgba(0,0,0,0.9)] sm:text-base">
                  &quot;{card.dare}&quot;
                </h3>

                <div className="mt-2.5 border-l-2 border-white/20 pl-2.5">
                  <p
                    className={`text-[11px] font-black tracking-wide uppercase italic ${card.theme.scriptText}`}
                  >
                    {card.script}
                  </p>
                </div>

                <div className="mt-3 flex items-center justify-between border-t border-white/[0.06] pt-2.5 text-xs">
                  <span className="font-mono text-[10px] text-zinc-500 uppercase">
                    PENALTY:
                  </span>
                  <span className="text-[11px] font-semibold text-zinc-300">
                    {card.stake}
                  </span>
                </div>
              </div>

              <div
                className={`absolute inset-x-2 -bottom-2 -z-10 h-4 rounded-[26px] bg-black/95 transition-opacity ${
                  isPressed ? "opacity-0" : "opacity-100"
                }`}
              />
            </button>
          );
        })}
      </main>

      <footer className="relative z-10 pb-2 text-center">
        <span className="font-mono text-[10px] tracking-widest text-zinc-500 uppercase">
          {isEngaged
            ? "RELAY ENGAGED // COMMENCING 30S CLOCK..."
            : "PRESS A CHANNEL TO ENGAGE MECHANICAL RELAY"}
        </span>
      </footer>
    </div>
  );
}
