"use client";

import { useCallback, useEffect, useState } from "react";
import ActiveArena from "@/components/ActiveArena";

interface LethalDare {
  id: string;
  type: "TEXT" | "CALL" | "HOSTAGE";
  tag: string;
  dare: string;
  script: string;
  stake: string;
  reversedDare: string;
  reversedStake: string;
}

const DECK: LethalDare[] = [
  {
    id: "d1",
    type: "TEXT",
    tag: "READ-RECEIPT WARFARE",
    dare: "Drop this text into your main group chat: 'I didn't want to say anything while they were here, but we need to talk about what just happened.' Put phone on airplane mode for 10 minutes.",
    script: '"SEND TO MAIN CHAT. AIRPLANE MODE ON."',
    stake: "Covers the entire table's bar tab tonight 🍻",
    reversedDare:
      "Send the exact same text to your family group chat and turn off your phone for 15 minutes.",
    reversedStake: "Covers the bar tab + $50 direct cash bounty 💸",
  },
  {
    id: "d2",
    type: "CALL",
    tag: "SPEAKERPHONE AMBUSH",
    dare: "Call a pizza shop on speaker and ask if their sink water is certified gluten-free & organic.",
    script: '"YES HELLO, DO YOU FILTER YOUR PIPES FOR SYNTHETIC CALCIUM?"',
    stake: "Buys the winner a 3-course dinner this week 🥩",
    reversedDare:
      "Call your boss or closest coworker on speaker: 'Did they approve the audit or are we still pretending it didn't happen?'",
    reversedStake: "$100 cash sent immediately via Bit / Venmo 💸",
  },
  {
    id: "d3",
    type: "HOSTAGE",
    tag: "45s CAMERA ROLL ROULETTE",
    dare: "Hand your unlocked phone to the challenger for 45s. They can enter your camera roll or deleted items and post 1 photo to your IG Story.",
    script: '"PHONE UNLOCKED. CAMERA ROLL IS FAIR GAME."',
    stake: "Clown profile picture on all socials for 7 full days 🤡",
    reversedDare:
      "Challenger gets 60 seconds to reply 'interesting...' to your last 3 Instagram DMs.",
    reversedStake: "Clown PFP for 14 days + pays next month's gym membership 🪦",
  },
  {
    id: "d4",
    type: "TEXT",
    tag: "BATTERY ROULETTE",
    dare: "Screenshot your current battery percentage and DM it to your last match or crush with: 'Us?' Don't reply for 20 minutes.",
    script: '"SEND BATTERY SCREENSHOT. ZERO CLARIFICATION."',
    stake: "Covers morning iced coffee & pastries tomorrow ☕",
    reversedDare:
      "Send the same screenshot to the 4th person in your recent DMs with 'thinking about this'.",
    reversedStake: "Buys lunch for the whole table 🍔",
  },
  {
    id: "d5",
    type: "CALL",
    tag: "BAIL INQUIRY",
    dare: "Call your sibling or best friend on speaker: 'Quick question, don't scream... what's our emergency cash limit right now?' Hang up immediately.",
    script: '"HOW MUCH LIQUID CASH DO WE HAVE? HANG UP."',
    stake: "Carries everyone's luggage and bags on next trip 🎒",
    reversedDare:
      "Call your dad on speaker and ask if he knows a reliable criminal defense attorney.",
    reversedStake: "Designated driver for the next 3 weekends 🚗",
  },
  {
    id: "d6",
    type: "HOSTAGE",
    tag: "BIO HIJACK",
    dare: "Hand unlocked phone over. Challenger rewrites your Instagram or Tinder bio to whatever they want for 72 hours.",
    script: '"BIO EDIT UNLOCKED. NO TOUCHING FOR 3 DAYS."',
    stake: "$50 cash fine paid on the spot 💸",
    reversedDare: "Challenger records your main Hinge voice prompt while you stay silent.",
    reversedStake: "$120 dinner tab or cash penalty 🥩",
  },
];

class Sfx {
  private ctx: AudioContext | null = null;

  private init() {
    if (!this.ctx && typeof window !== "undefined") {
      const AudioCtx =
        window.AudioContext ||
        (window as unknown as { webkitAudioContext: typeof AudioContext })
          .webkitAudioContext;
      this.ctx = new AudioCtx();
    }
    if (this.ctx && this.ctx.state === "suspended") void this.ctx.resume();
  }

  tick(high = false) {
    this.init();
    if (!this.ctx) return;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.type = "sine";
    osc.frequency.setValueAtTime(high ? 1100 : 700, this.ctx.currentTime);
    gain.gain.setValueAtTime(0.12, this.ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + 0.04);
    osc.connect(gain);
    gain.connect(this.ctx.destination);
    osc.start();
    osc.stop(this.ctx.currentTime + 0.04);
  }

  buzzer() {
    this.init();
    if (!this.ctx) return;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.type = "sawtooth";
    osc.frequency.setValueAtTime(110, this.ctx.currentTime);
    gain.gain.setValueAtTime(0.35, this.ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.01, this.ctx.currentTime + 0.4);
    osc.connect(gain);
    gain.connect(this.ctx.destination);
    osc.start();
    osc.stop(this.ctx.currentTime + 0.4);
  }
}

const sfx = new Sfx();

function dealThree(): LethalDare[] {
  const shuffled = [...DECK].sort(() => 0.5 - Math.random());
  return [shuffled[0], shuffled[1], shuffled[2]];
}

export default function BetYouLoseApp() {
  const [challenger, setChallenger] = useState("alex");
  const [victim, setVictim] = useState("dave");
  const [hand, setHand] = useState<LethalDare[]>([DECK[0], DECK[1], DECK[2]]);
  const [selectedDare, setSelectedDare] = useState<LethalDare | null>(null);
  const [verdict, setVerdict] = useState<"pending" | "cleared" | "choked">("pending");
  const [wasReversed, setWasReversed] = useState(false);

  useEffect(() => {
    setHand(dealThree());
  }, []);

  const dealFreshHand = () => {
    setHand(dealThree());
    setSelectedDare(null);
    setVerdict("pending");
    setWasReversed(false);
  };

  const handleComplete = useCallback(
    (result: "cleared" | "choked", meta?: { isReversed: boolean }) => {
      setWasReversed(Boolean(meta?.isReversed));
      setVerdict(result);
      if (result === "choked") sfx.buzzer();
      else sfx.tick(true);
    },
    [],
  );

  if (selectedDare && verdict === "pending") {
    return (
      <ActiveArena
        key={selectedDare.id}
        challenger={challenger}
        victim={victim}
        dare={selectedDare}
        duration={30}
        onBack={() => setSelectedDare(null)}
        onComplete={handleComplete}
      />
    );
  }

  if (selectedDare && verdict !== "pending") {
    return (
      <div className="relative mx-auto flex h-[100dvh] w-full max-w-md select-none flex-col justify-between overflow-hidden bg-[#07070b] p-5 font-sans text-white">
        <div className="pointer-events-none absolute top-1/3 left-1/2 h-[480px] w-[340px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-rose-600/25 blur-[140px]" />
        <div className="relative z-10 my-auto flex flex-col justify-between space-y-6 text-center">
          <div>
            <span className="mb-2 block text-6xl">
              {verdict === "choked" ? "🤡" : "👑"}
            </span>
            <span
              className={`rounded-full border px-3 py-1 text-xs font-black tracking-widest uppercase ${
                verdict === "choked"
                  ? "border-red-500 bg-red-500/20 text-red-400"
                  : "border-emerald-500 bg-emerald-500/20 text-emerald-400"
              }`}
            >
              {verdict === "choked"
                ? "OFFICIAL FORFEIT RECEIPT"
                : "CHAMPION VINDICATED"}
            </span>
          </div>

          <div className="space-y-2 rounded-3xl border border-white/10 bg-white/[0.04] p-4 text-left font-mono text-xs">
            <div className="flex justify-between">
              <span className="text-zinc-500">DEFENDANT:</span>
              <span className="font-bold text-white">@{victim}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-zinc-500">VERDICT:</span>
              <span
                className={`font-bold ${
                  verdict === "choked" ? "text-red-400" : "text-emerald-400"
                }`}
              >
                {verdict === "choked"
                  ? "SURRENDER // COWARD"
                  : "COMPLETED ON CAMERA"}
              </span>
            </div>
            <div className="my-1 border-t border-dashed border-white/20" />
            <div>
              <span className="mb-0.5 block text-zinc-500">PENALTY OWED:</span>
              <span className="font-bold text-amber-300">
                {verdict === "choked"
                  ? wasReversed
                    ? selectedDare.reversedStake
                    : selectedDare.stake
                  : "Zero debt."}
              </span>
            </div>
          </div>

          <button
            type="button"
            onClick={dealFreshHand}
            className="w-full rounded-2xl bg-white py-4 text-xs font-black tracking-widest text-black uppercase shadow-xl transition-all active:scale-95"
          >
            Draft Next Wager 🎲
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="relative mx-auto flex h-[100dvh] w-full max-w-md select-none flex-col justify-between overflow-hidden bg-[#060609] p-5 font-sans text-white">
      <div className="pointer-events-none absolute top-1/2 left-1/2 h-[640px] w-[420px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-emerald-500/25 blur-[140px]" />

      <div className="relative z-20 flex items-center justify-between pt-1">
        <div className="flex items-center gap-2">
          <span className="h-2.5 w-2.5 rounded-full bg-emerald-400" />
          <span className="text-[10px] font-black tracking-[0.25em] text-zinc-300 uppercase">
            BET YOU LOSE
          </span>
        </div>
        <div className="flex items-center gap-1.5 font-mono text-xs font-bold">
          <input
            type="text"
            value={challenger}
            onChange={(e) =>
              setChallenger(e.target.value.replace(/[^a-zA-Z0-9_]/g, ""))
            }
            className="w-16 bg-transparent text-right text-emerald-400 focus:outline-none"
            aria-label="challenger"
          />
          <span className="text-zinc-600">vs</span>
          <input
            type="text"
            value={victim}
            onChange={(e) =>
              setVictim(e.target.value.replace(/[^a-zA-Z0-9_]/g, ""))
            }
            className="w-16 bg-transparent text-rose-400 focus:outline-none"
            aria-label="victim"
          />
        </div>
      </div>

      <div className="relative z-10 my-auto animate-in space-y-3 duration-200 fade-in zoom-in-95">
        <div className="mb-2 text-center">
          <span className="mb-1 block font-mono text-[9px] tracking-[0.2em] text-zinc-400 uppercase">
            TAP TO DEPLOY TRAP
          </span>
          <h2 className="text-base font-black text-white uppercase">
            Choose @{victim}&apos;s Poison
          </h2>
        </div>

        {hand.map((card, i) => (
          <button
            key={card.id}
            type="button"
            onClick={() => {
              sfx.tick(true);
              setVerdict("pending");
              setSelectedDare(card);
            }}
            className={`w-full cursor-pointer rounded-3xl border p-4 text-left transition-all active:scale-95 ${
              i === 0
                ? "border-blue-500/30 bg-gradient-to-r from-blue-950/30 to-black hover:border-blue-400"
                : i === 1
                  ? "border-amber-500/30 bg-gradient-to-r from-amber-950/30 to-black hover:border-amber-400"
                  : "border-purple-500/30 bg-gradient-to-r from-purple-950/30 to-black hover:border-purple-400"
            }`}
          >
            <div className="mb-1 flex items-center justify-between">
              <span className="font-mono text-[9px] font-black tracking-wider text-zinc-400 uppercase">
                {card.tag}
              </span>
              <span className="font-mono text-[9px] font-black text-amber-400">
                30s CLOCK
              </span>
            </div>
            <p className="line-clamp-2 text-xs leading-snug font-bold text-white">
              &quot;{card.dare}&quot;
            </p>
            <div className="mt-2 text-[10px] font-black text-zinc-400">
              STAKE: <span className="text-amber-300">{card.stake}</span>
            </div>
          </button>
        ))}

        <button
          type="button"
          onClick={dealFreshHand}
          className="w-full rounded-2xl border border-white/10 bg-white/[0.04] py-3 text-xs font-black tracking-widest text-zinc-400 uppercase transition-all hover:bg-white/[0.08] active:scale-95"
        >
          🎲 Deal 3 Fresh Cards
        </button>
      </div>
    </div>
  );
}
