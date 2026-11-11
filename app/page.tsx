"use client";

import { useEffect, useState } from "react";

type ScreenView = "entry" | "deck" | "active" | "verdict";
type NetworkId = "whatsapp" | "telegram" | "instagram" | "sms" | "native" | "copy";

interface DareItem {
  id: string;
  channel: string;
  tag: string;
  dare: string;
  script: string;
  stake: string;
  reversedDare: string;
  reversedStake: string;
  theme: {
    border: string;
    glow: string;
    badgeBg: string;
    badgeText: string;
    accentHex: string;
  };
}

const WEAPON_DECK: DareItem[] = [
  {
    id: "blue",
    channel: "CHANNEL 01",
    tag: "READ-RECEIPT TRAP",
    dare: "Screenshot your current battery percentage and DM it to your last match or crush with 'Us?' Zero explanation for 20 minutes.",
    script: '"SEND BATTERY PERCENTAGE. NO CLARIFICATION FOR 20 MINS."',
    stake: "Covers morning iced coffee & pastries tomorrow",
    reversedDare:
      "Send the same battery screenshot to the 3rd person in your recent WhatsApp chats with 'thinking of you'.",
    reversedStake: "Covers full table lunch or food truck order",
    theme: {
      border: "border-blue-600/40 hover:border-blue-500",
      glow: "from-blue-600/25 via-blue-700/15 to-transparent",
      badgeBg: "bg-blue-600/10 border-blue-500/30",
      badgeText: "text-blue-400",
      accentHex: "#2563eb",
    },
  },
  {
    id: "yellow",
    channel: "CHANNEL 02",
    tag: "SPEAKERPHONE AMBUSH",
    dare: "Call a local pizza shop on speaker and ask if their tap water is certified organic & gluten-free.",
    script: '"YES HELLO, DO YOU FILTER YOUR SINK PIPES FOR SYNTHETIC CALCIUM?"',
    stake: "Covers the entire table's bar tab tonight",
    reversedDare:
      "Call your boss or closest coworker on speaker: 'Did they approve the audit or are we still pretending it didn't happen?'",
    reversedStake: "$100 direct settlement transferred immediately",
    theme: {
      border: "border-yellow-500/40 hover:border-yellow-400",
      glow: "from-yellow-500/25 via-amber-600/15 to-transparent",
      badgeBg: "bg-yellow-500/10 border-yellow-400/30",
      badgeText: "text-yellow-300",
      accentHex: "#eab308",
    },
  },
  {
    id: "red",
    channel: "CHANNEL 03",
    tag: "DIGITAL HOSTAGE",
    dare: "Hand your unlocked phone to the challenger for 45 seconds. They can enter your camera roll or deleted items and post one photo to your Instagram Story.",
    script: '"PHONE UNLOCKED. CAMERA ROLL IS FAIR GAME."',
    stake: "Black-and-white clown portrait avatar on all socials for 7 days",
    reversedDare:
      "Challenger gets 60 seconds to reply 'interesting...' to your last 3 Instagram DMs.",
    reversedStake: "Avatar fine for 14 days + covers next month gym subscription",
    theme: {
      border: "border-red-600/40 hover:border-red-500",
      glow: "from-red-600/25 via-rose-700/15 to-transparent",
      badgeBg: "bg-red-600/10 border-red-500/30",
      badgeText: "text-red-400",
      accentHex: "#dc2626",
    },
  },
];

class TelemetryAudio {
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

  thud() {
    this.init();
    if (!this.ctx) return;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.type = "sine";
    osc.frequency.setValueAtTime(130, this.ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(32, this.ctx.currentTime + 0.22);
    gain.gain.setValueAtTime(0.3, this.ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + 0.22);
    osc.connect(gain);
    gain.connect(this.ctx.destination);
    osc.start();
    osc.stop(this.ctx.currentTime + 0.22);
  }

  tick(high = false) {
    this.init();
    if (!this.ctx) return;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.type = "sine";
    osc.frequency.setValueAtTime(high ? 1050 : 680, this.ctx.currentTime);
    gain.gain.setValueAtTime(0.08, this.ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + 0.04);
    osc.connect(gain);
    gain.connect(this.ctx.destination);
    osc.start();
    osc.stop(this.ctx.currentTime + 0.04);
  }

  alarm() {
    this.init();
    if (!this.ctx) return;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.type = "sawtooth";
    osc.frequency.setValueAtTime(420, this.ctx.currentTime);
    osc.frequency.linearRampToValueAtTime(800, this.ctx.currentTime + 0.16);
    gain.gain.setValueAtTime(0.18, this.ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + 0.22);
    osc.connect(gain);
    gain.connect(this.ctx.destination);
    osc.start();
    osc.stop(this.ctx.currentTime + 0.22);
  }
}

const sfx = new TelemetryAudio();

function formatClock(totalSeconds: number) {
  return `${Math.floor(totalSeconds / 60)}:${String(totalSeconds % 60).padStart(2, "0")}`;
}

export default function Home() {
  const [screen, setScreen] = useState<ScreenView>("entry");
  const [challenger, setChallenger] = useState("Alex");
  const [victim, setVictim] = useState("David");
  const [activeItem, setActiveItem] = useState<DareItem>(WEAPON_DECK[0]);
  const [duration, setDuration] = useState(30);
  const [timeLeft, setTimeLeft] = useState(30);
  const [timerRunning, setTimerRunning] = useState(false);
  const [isReversed, setIsReversed] = useState(false);
  const [showShareDrawer, setShowShareDrawer] = useState(false);
  const [copiedStatus, setCopiedStatus] = useState<string | null>(null);
  const [outcome, setOutcome] = useState<"choked" | "cleared">("choked");

  useEffect(() => {
    const hash = window.location.hash;
    if (!hash.startsWith("#trap=")) return;
    try {
      const decoded = JSON.parse(
        decodeURIComponent(atob(hash.replace("#trap=", ""))),
      ) as {
        from?: string;
        to?: string;
        dare: string;
        script?: string;
        stake?: string;
        reversedDare?: string;
        t?: number;
      };
      setChallenger(decoded.from || "Alex");
      setVictim(decoded.to || "David");
      setDuration(decoded.t || 30);
      setTimeLeft(decoded.t || 30);
      setActiveItem({
        id: "custom",
        channel: "INCOMING AMBUSH",
        tag: "SUDDEN DEATH WAGER",
        dare: decoded.dare,
        script: decoded.script || "EXECUTE LIVE ON CAMERA",
        stake: decoded.stake || "Covers entire bar tab tonight",
        reversedDare:
          decoded.reversedDare || "Double penalty bounces back to challenger.",
        reversedStake: "2X Forfeit Debt",
        theme: WEAPON_DECK[2].theme,
      });
      setScreen("active");
    } catch {
      // Invalid ambush hash
    }
  }, []);

  useEffect(() => {
    if (!timerRunning || timeLeft <= 0) {
      if (timerRunning && timeLeft === 0) {
        setTimerRunning(false);
        setOutcome("choked");
        setScreen("verdict");
      }
      return;
    }

    const interval = setInterval(() => {
      setTimeLeft((prev) => {
        const next = prev - 1;
        if (next <= 5 && next > 0) {
          sfx.alarm();
          navigator.vibrate?.([50, 40, 50]);
        } else if (next > 0) {
          sfx.tick(next <= 10);
        }
        return next;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [timerRunning, timeLeft]);

  const getTrapUrl = () => {
    const payload = {
      from: challenger,
      to: victim,
      dare: activeItem.dare,
      script: activeItem.script,
      stake: activeItem.stake,
      reversedDare: activeItem.reversedDare,
      t: duration,
    };
    const hash = btoa(encodeURIComponent(JSON.stringify(payload)));
    return `${window.location.origin}/#trap=${hash}`;
  };

  const handleSocialShare = async (network: NetworkId) => {
    const url = getTrapUrl();
    const message = `NO PRESSURE FOR @${victim.toUpperCase()}: You've been targeted by @${challenger.toUpperCase()} in a sudden-death wager.\n\nPenalty: ${activeItem.stake}\n\nDO NOT OPEN UNTIL YOU ARE ON CAMERA:\n${url}`;
    const encodedText = encodeURIComponent(message);
    const encodedUrl = encodeURIComponent(url);
    let target: NetworkId = network;

    if (target === "native") {
      if (navigator.share) {
        try {
          await navigator.share({
            title: `NO PRESSURE: @${challenger} vs @${victim}`,
            text: message,
            url,
          });
          setShowShareDrawer(false);
          return;
        } catch {
          // Fall through
        }
      }
      target = "copy";
    }

    switch (target) {
      case "whatsapp":
        window.open(`https://api.whatsapp.com/send?text=${encodedText}`, "_blank");
        break;
      case "telegram":
        window.open(
          `https://t.me/share/url?url=${encodedUrl}&text=${encodedText}`,
          "_blank",
        );
        break;
      case "instagram":
        await navigator.clipboard.writeText(url);
        setCopiedStatus("Copied for IG DM");
        setTimeout(() => setCopiedStatus(null), 2000);
        break;
      case "sms":
        window.open(`sms:?&body=${encodedText}`, "_blank");
        break;
      case "copy":
      default:
        await navigator.clipboard.writeText(url);
        setCopiedStatus("Link Copied");
        setTimeout(() => setCopiedStatus(null), 2000);
        break;
    }
  };

  const isCritical = timeLeft <= 5 && timerRunning;
  const progressPct = (timeLeft / (isReversed ? 15 : duration)) * 100;

  return (
    <div className="relative mx-auto flex h-[100dvh] w-full max-w-md select-none flex-col justify-between overflow-hidden bg-[#07070b] p-4 font-sans text-white sm:p-5">
      <div className="pointer-events-none absolute -top-20 -right-20 h-[360px] w-[360px] rounded-full bg-gradient-to-br from-amber-500/12 via-rose-500/8 to-transparent blur-[120px]" />
      <div className="pointer-events-none absolute -bottom-24 -left-20 h-[380px] w-[380px] rounded-full bg-gradient-to-tr from-blue-600/12 via-indigo-600/8 to-transparent blur-[130px]" />
      {isCritical ? (
        <div className="pointer-events-none absolute top-1/2 left-1/2 h-[420px] w-[420px] -translate-x-1/2 -translate-y-1/2 animate-pulse rounded-full bg-rose-600/25 blur-[140px]" />
      ) : null}

      <header className="relative z-20 flex shrink-0 items-center justify-between gap-3 pt-1 pb-3">
        <div className="flex flex-col">
          <div className="flex items-center gap-2.5">
            <div className="relative flex items-center justify-center">
              <span className="h-2 w-2 rounded-full bg-emerald-400 shadow-[0_0_8px_#34d399]" />
              <span className="absolute h-2 w-2 animate-ping rounded-full bg-emerald-400/40" />
            </div>
            <span className="font-mono text-xs font-bold tracking-[0.26em] text-zinc-200 uppercase">
              NO PRESSURE
            </span>
          </div>
          <span className="pl-4 font-mono text-[9px] tracking-wider text-zinc-500">
            Not all dares are created equal.
          </span>
        </div>
        <div className="flex items-center gap-1.5 rounded-full border border-white/[0.08] bg-white/[0.04] px-3 py-1 font-mono text-xs backdrop-blur-xl">
          <input
            value={challenger}
            onChange={(e) => setChallenger(e.target.value.slice(0, 16))}
            className="w-14 bg-transparent text-right font-semibold text-zinc-300 focus:text-white focus:outline-none"
            title="Challenger"
            aria-label="Challenger"
          />
          <span className="text-[10px] font-bold text-zinc-600">VS</span>
          <input
            value={victim}
            onChange={(e) => setVictim(e.target.value.slice(0, 16))}
            className="w-14 bg-transparent font-semibold text-rose-400 focus:text-rose-300 focus:outline-none"
            title="Victim"
            aria-label="Victim"
          />
        </div>
      </header>

      {screen === "entry" && (
        <main className="relative z-10 flex flex-1 select-none animate-in flex-col justify-between py-2 text-left duration-200 fade-in">
          <div className="space-y-3 pt-1">
            <div className="inline-flex items-center gap-2 rounded-full border border-white/[0.08] bg-white/[0.04] px-3 py-1 backdrop-blur-md">
              <span className="text-xs text-rose-400">✦</span>
              <span className="font-sans text-[11px] font-medium tracking-wide text-zinc-300">
                Social sudden death engine
              </span>
            </div>

            <div className="flex items-center justify-between gap-3">
              <h1 className="text-3xl leading-[1.08] font-bold tracking-[-0.035em] text-white sm:text-[38px]">
                No{" "}
                <span className="bg-gradient-to-r from-rose-500 via-red-500 to-amber-400 bg-clip-text text-transparent drop-shadow-[0_0_25px_rgba(244,63,94,0.45)]">
                  pressure.
                </span>
                <br />
                <span className="text-zinc-200">Not all</span>
                <br />
                <span className="text-zinc-200">dares are</span>
                <br />
                <span className="bg-gradient-to-r from-rose-500 via-red-500 to-amber-400 bg-clip-text text-transparent">
                  created equal.
                </span>
              </h1>

              <div className="relative flex h-28 w-28 shrink-0 items-center justify-center sm:h-32 sm:w-32">
                <div className="pointer-events-none absolute inset-2 animate-pulse rounded-full bg-gradient-to-tr from-red-600/35 to-amber-500/20 blur-xl" />
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src="/gauge.png"
                  alt="Cracked PSI Pressure Gauge"
                  className="relative z-10 h-full w-full object-contain drop-shadow-[0_12px_28px_rgba(0,0,0,0.95)]"
                />
              </div>
            </div>

            <p className="max-w-[310px] pt-1 text-xs leading-relaxed font-normal text-zinc-400">
              Deal 3 lethal channels to a friend. Read-receipt traps, speakerphone
              calls, and camera roll hostages—with 30 seconds before default
              forfeit.
            </p>
          </div>

          <div className="my-auto flex flex-col gap-2 py-2">
            {[
              {
                num: "01",
                title: "3-Channel Weapon Deck",
                desc: "Read-Receipt, Speakerphone, Hostage.",
              },
              {
                num: "02",
                title: "Sudden Death Detonator",
                desc: "30s Blitz, 60s Call, 5m Meeting Mode.",
              },
              {
                num: "03",
                title: "Double & Reverse 2X",
                desc: "Victims can bounce the debt back with halved time.",
              },
            ].map((f) => (
              <div
                key={f.num}
                className="flex items-center gap-3 rounded-2xl border border-white/[0.06] bg-white/[0.025] p-3 shadow-[inset_0_1px_1px_rgba(255,255,255,0.04)] backdrop-blur-xl"
              >
                <span className="rounded-lg border border-white/5 bg-white/[0.03] px-2 py-1 font-mono text-[11px] font-bold text-zinc-500">
                  {f.num}
                </span>
                <div>
                  <h4 className="text-xs font-semibold text-zinc-200">{f.title}</h4>
                  <p className="text-[11px] leading-tight text-zinc-400">{f.desc}</p>
                </div>
              </div>
            ))}
          </div>

          <div className="shrink-0 pt-2">
            <button
              type="button"
              onClick={() => {
                sfx.thud();
                setScreen("deck");
              }}
              className="flex w-full cursor-pointer items-center justify-center gap-2 rounded-full bg-gradient-to-r from-orange-500 via-rose-500 to-amber-500 py-4 text-xs font-semibold tracking-wider text-white uppercase shadow-[inset_0_1px_1px_rgba(255,255,255,0.4),0_12px_28px_rgba(244,63,94,0.3)] transition-all hover:brightness-110 active:scale-[0.99]"
            >
              <span>Enter The Arena</span>
              <span className="text-sm">→</span>
            </button>
            <span className="mt-2 block text-center font-mono text-[10px] text-zinc-500">
              Stateless URL • Encrypted Client-Side
            </span>
          </div>
        </main>
      )}

      {screen === "deck" && (
        <main className="relative z-10 flex flex-1 animate-in flex-col justify-between gap-2.5 py-1 duration-200 fade-in zoom-in-95">
          <div className="flex shrink-0 items-center justify-between px-1">
            <div>
              <span className="block font-mono text-[9px] tracking-[0.2em] text-zinc-500 uppercase">
                STEP 1 OF 2
              </span>
              <h2 className="text-base font-bold tracking-tight text-white sm:text-lg">
                Select {victim}&apos;s Poison
              </h2>
            </div>
            <button
              type="button"
              onClick={() => setScreen("entry")}
              className="font-mono text-xs text-zinc-400 transition-colors hover:text-white"
            >
              Cancel ✕
            </button>
          </div>

          <div className="flex min-h-0 flex-1 flex-col gap-3">
            {WEAPON_DECK.map((item) => (
              <button
                key={item.id}
                type="button"
                onClick={() => {
                  sfx.thud();
                  setActiveItem(item);
                  setTimeLeft(duration);
                  setIsReversed(false);
                  setTimerRunning(false);
                  setScreen("active");
                }}
                className={`group relative flex flex-1 cursor-pointer flex-col justify-between overflow-hidden rounded-[26px] border bg-gradient-to-b from-white/[0.06] via-[#090910] to-[#040407] p-5 text-left shadow-[0_12px_32px_rgba(0,0,0,0.8),inset_0_1px_1px_rgba(255,255,255,0.12)] backdrop-blur-2xl transition-all duration-200 active:scale-[0.985] ${item.theme.border}`}
              >
                <div
                  className={`pointer-events-none absolute -inset-1 bg-gradient-to-r opacity-0 blur-xl transition-opacity group-hover:opacity-100 ${item.theme.glow}`}
                />
                <div className="relative z-10">
                  <div className="mb-2 flex items-center justify-between gap-2">
                    <span
                      className={`rounded-full border px-2.5 py-0.5 font-mono text-[9px] font-bold tracking-widest uppercase ${item.theme.badgeBg} ${item.theme.badgeText}`}
                    >
                      {item.channel} • {item.tag}
                    </span>
                    <span className="shrink-0 font-mono text-[10px] text-zinc-400 transition-colors group-hover:text-white">
                      Arm Challenge →
                    </span>
                  </div>
                  <p className="text-xs leading-snug font-semibold text-zinc-100 sm:text-sm">
                    &quot;{item.dare}&quot;
                  </p>
                </div>
                <div className="relative z-10 flex items-center justify-between border-t border-white/[0.06] pt-2 text-xs">
                  <span className="font-mono text-[10px] tracking-wider text-zinc-500 uppercase">
                    COLLATERAL:
                  </span>
                  <span className="max-w-[220px] truncate text-[11px] font-medium text-zinc-300">
                    {item.stake}
                  </span>
                </div>
              </button>
            ))}
          </div>

          <div className="shrink-0 py-0.5 text-center">
            <span className="font-mono text-[10px] tracking-widest text-zinc-500 uppercase">
              Tap any card to deploy mechanical lock
            </span>
          </div>
        </main>
      )}

      {screen === "active" && (
        <main className="relative z-10 flex flex-1 animate-in flex-col justify-between gap-3 py-1 duration-200 fade-in">
          <div className="relative flex flex-1 flex-col justify-between rounded-[30px] border border-white/[0.1] bg-gradient-to-b from-white/[0.05] via-[#090910] to-black p-5 shadow-[0_20px_50px_rgba(0,0,0,0.85),inset_0_1px_1px_rgba(255,255,255,0.15)] backdrop-blur-2xl sm:p-6">
            <div className="flex items-center justify-between gap-2">
              <span
                className={`rounded-full border px-3 py-0.5 font-mono text-[10px] font-bold tracking-wider uppercase ${activeItem.theme.badgeBg} ${activeItem.theme.badgeText}`}
              >
                {isReversed ? "REVERSED COUNTER-ATTACK" : activeItem.tag}
              </span>
              {!timerRunning ? (
                <button
                  type="button"
                  onClick={() => setScreen("deck")}
                  className="shrink-0 font-mono text-xs text-zinc-400 transition-colors hover:text-white"
                >
                  Change Card ↺
                </button>
              ) : null}
            </div>

            <div className="my-auto space-y-3.5 py-2 text-left">
              <div>
                <span className="mb-1 block font-mono text-[10px] tracking-widest text-zinc-400 uppercase">
                  DEMAND FOR @{(isReversed ? challenger : victim).toUpperCase()}
                </span>
                <h2 className="text-lg leading-snug font-bold tracking-tight text-white sm:text-xl">
                  &quot;{isReversed ? activeItem.reversedDare : activeItem.dare}
                  &quot;
                </h2>
              </div>

              <div className="rounded-r-xl border-l-2 border-amber-400/90 bg-amber-400/[0.05] p-3">
                <span className="mb-0.5 block font-mono text-[9px] tracking-widest text-amber-300 uppercase">
                  MANDATORY LIVE CAPTION
                </span>
                <p className="text-xs font-semibold tracking-wide text-amber-200 italic">
                  {activeItem.script}
                </p>
              </div>

              <div className="flex items-center gap-2 text-xs">
                <span className="font-mono text-[10px] text-zinc-500 uppercase">
                  PENALTY:
                </span>
                <span className="font-medium text-zinc-200">
                  {isReversed ? activeItem.reversedStake : activeItem.stake}
                </span>
              </div>
            </div>

            <div className="space-y-2 border-t border-white/[0.08] pt-3">
              {!timerRunning ? (
                <div className="flex flex-wrap items-center justify-between gap-2 px-1">
                  <span className="font-mono text-[9px] tracking-widest text-zinc-500 uppercase">
                    TIMER:
                  </span>
                  <div className="flex flex-wrap items-center gap-1.5">
                    {[
                      { s: 30, label: "30s" },
                      { s: 60, label: "60s" },
                      { s: 300, label: "5m Meeting" },
                    ].map((p) => (
                      <button
                        key={p.s}
                        type="button"
                        onClick={() => {
                          setDuration(p.s);
                          setTimeLeft(p.s);
                        }}
                        className={`rounded-full px-2.5 py-0.5 font-mono text-[10px] font-medium transition-all ${
                          duration === p.s
                            ? "scale-105 bg-white text-black shadow-md"
                            : "border border-white/10 bg-white/[0.04] text-zinc-400 hover:text-white"
                        }`}
                      >
                        {p.label}
                      </button>
                    ))}
                    <button
                      type="button"
                      onClick={() => {
                        const next = duration + 15 > 600 ? 15 : duration + 15;
                        setDuration(next);
                        setTimeLeft(next);
                      }}
                      className="rounded-full border border-white/10 bg-white/[0.04] px-2 py-0.5 font-mono text-[10px] font-medium text-zinc-400"
                    >
                      +15s
                    </button>
                  </div>
                </div>
              ) : null}

              <div
                className={`text-center font-mono text-6xl leading-none font-black tracking-tighter transition-all ${
                  isCritical ? "scale-105 text-rose-500" : "text-white"
                }`}
              >
                {formatClock(timeLeft)}
              </div>

              <div className="h-1 w-full overflow-hidden rounded-full bg-white/[0.08]">
                <div
                  className={`h-full transition-all duration-1000 ${
                    isCritical
                      ? "bg-rose-500 shadow-[0_0_8px_#f43f5e]"
                      : "bg-gradient-to-r from-orange-400 to-rose-400"
                  }`}
                  style={{ width: `${progressPct}%` }}
                />
              </div>
            </div>
          </div>

          <div className="shrink-0 space-y-2">
            {!timerRunning ? (
              <div className="space-y-2">
                <button
                  type="button"
                  onClick={() => {
                    sfx.thud();
                    setTimerRunning(true);
                  }}
                  className="w-full cursor-pointer rounded-full bg-white py-4 text-xs font-semibold tracking-[0.2em] text-black uppercase shadow-lg transition-all hover:bg-zinc-200 active:scale-[0.99]"
                >
                  Start{" "}
                  {duration >= 60
                    ? `${Math.round((duration / 60) * 10) / 10}m`
                    : `${duration}s`}{" "}
                  Countdown
                </button>
                <button
                  type="button"
                  onClick={() => setShowShareDrawer(true)}
                  className="flex w-full cursor-pointer items-center justify-center gap-2 rounded-full border border-white/[0.08] bg-white/[0.05] py-3.5 font-mono text-xs font-medium tracking-wide text-zinc-300 transition-all hover:bg-white/[0.08] active:scale-[0.99]"
                >
                  <span>Send Ambush Trap to @{victim}</span>
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => {
                    setTimerRunning(false);
                    setOutcome("cleared");
                    setScreen("verdict");
                  }}
                  className="rounded-full border border-white/20 bg-white/[0.1] py-4 text-xs font-semibold tracking-wider text-white uppercase transition-all hover:bg-white/[0.15] active:scale-[0.99]"
                >
                  Survived
                </button>
                <button
                  type="button"
                  disabled={isReversed}
                  onClick={() => {
                    sfx.alarm();
                    setIsReversed(true);
                    setTimeLeft(15);
                  }}
                  className={`rounded-full py-4 text-xs font-semibold tracking-wider uppercase transition-all ${
                    isReversed
                      ? "cursor-not-allowed border border-white/5 bg-zinc-800 text-zinc-500"
                      : "bg-gradient-to-r from-purple-600 to-indigo-600 text-white shadow-[0_0_20px_rgba(168,85,247,0.35)] hover:brightness-110 active:scale-[0.99]"
                  }`}
                >
                  Reverse (2X)
                </button>
              </div>
            )}
            {timerRunning ? (
              <button
                type="button"
                onClick={() => {
                  setTimerRunning(false);
                  setOutcome("choked");
                  setScreen("verdict");
                }}
                className="w-full py-2 font-mono text-[10px] tracking-wider text-zinc-500 uppercase transition-colors hover:text-rose-400"
              >
                Forfeit Wager
              </button>
            ) : null}
          </div>
        </main>
      )}

      {screen === "verdict" && (
        <main className="relative z-10 flex flex-1 animate-in flex-col justify-between space-y-4 rounded-[32px] border border-white/[0.08] bg-white/[0.03] p-6 py-4 text-center backdrop-blur-2xl duration-200 zoom-in-95">
          <div className="pt-2">
            <span
              className={`rounded-full border px-3.5 py-1 font-mono text-[10px] font-semibold tracking-[0.25em] uppercase ${
                outcome === "choked"
                  ? "border-rose-500/25 bg-rose-500/10 text-rose-300"
                  : "border-emerald-500/25 bg-emerald-500/10 text-emerald-300"
              }`}
            >
              {outcome === "choked"
                ? "Official Forfeit Record"
                : "Champion Record"}
            </span>
            <h2 className="mt-4 text-2xl font-bold tracking-tight text-white">
              {outcome === "choked"
                ? "Cracked Under Pressure"
                : "Held The Line"}
            </h2>
            <p className="mt-1 text-xs text-zinc-400">
              {outcome === "choked"
                ? "Defendant failed to meet deadline terms."
                : "Defendant completed the demand on camera."}
            </p>
          </div>

          <div className="my-auto space-y-2.5 rounded-2xl border border-white/[0.06] bg-black/40 p-4 text-left font-mono text-xs">
            <div className="flex justify-between">
              <span className="text-zinc-500">DEFENDANT:</span>
              <span className="font-semibold text-white">
                @{isReversed ? challenger : victim}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-zinc-500">PROSECUTOR:</span>
              <span className="font-semibold text-zinc-300">
                @{isReversed ? victim : challenger}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-zinc-500">VERDICT:</span>
              <span
                className={`font-semibold ${
                  outcome === "choked" ? "text-rose-400" : "text-emerald-400"
                }`}
              >
                {outcome === "choked"
                  ? "SURRENDER // TIMEOUT"
                  : "COMPLETED // CLEAR"}
              </span>
            </div>
            <div className="my-1.5 border-t border-dashed border-white/[0.1]" />
            <div>
              <span className="mb-0.5 block text-zinc-500">COLLATERAL OWED:</span>
              <span className="leading-snug font-semibold text-amber-300">
                {outcome === "choked"
                  ? isReversed
                    ? activeItem.reversedStake
                    : activeItem.stake
                  : "Zero debt."}
              </span>
            </div>
          </div>

          <button
            type="button"
            onClick={() => {
              setScreen("deck");
              setTimeLeft(duration);
              setIsReversed(false);
              setTimerRunning(false);
            }}
            className="w-full cursor-pointer rounded-full bg-white py-4 text-xs font-semibold tracking-wider text-black uppercase shadow-lg transition-all hover:bg-zinc-200"
          >
            Draft Next Wager ↺
          </button>
        </main>
      )}

      {showShareDrawer && (
        <div className="fixed inset-0 z-50 flex animate-in flex-col justify-end bg-black/80 p-4 duration-150 fade-in backdrop-blur-md">
          <div className="mx-auto w-full max-w-md space-y-4 rounded-[32px] border border-white/10 bg-[#0c0c12] p-5 shadow-2xl">
            <div className="flex items-center justify-between border-b border-white/[0.08] pb-2">
              <div>
                <h3 className="text-xs font-bold tracking-wider text-white uppercase">
                  Select Dispatch Route
                </h3>
                <p className="text-[11px] text-zinc-400">
                  Send trap link directly to @{victim}
                </p>
              </div>
              <button
                type="button"
                onClick={() => setShowShareDrawer(false)}
                className="flex h-6 w-6 items-center justify-center rounded-full bg-white/[0.06] font-mono text-xs text-zinc-400 hover:text-white"
              >
                ✕
              </button>
            </div>

            <div className="grid grid-cols-4 gap-2 pt-1">
              <button
                type="button"
                onClick={() => handleSocialShare("whatsapp")}
                className="flex flex-col items-center justify-center gap-1 rounded-2xl border border-emerald-500/30 bg-white/[0.04] py-3 text-xs font-semibold text-emerald-400 transition-all hover:bg-white/[0.08] active:scale-95"
              >
                <span className="text-base">WhatsApp</span>
              </button>
              <button
                type="button"
                onClick={() => handleSocialShare("telegram")}
                className="flex flex-col items-center justify-center gap-1 rounded-2xl border border-sky-500/30 bg-white/[0.04] py-3 text-xs font-semibold text-sky-400 transition-all hover:bg-white/[0.08] active:scale-95"
              >
                <span className="text-base">Telegram</span>
              </button>
              <button
                type="button"
                onClick={() => handleSocialShare("instagram")}
                className="flex flex-col items-center justify-center gap-1 rounded-2xl border border-pink-500/30 bg-white/[0.04] py-3 text-xs font-semibold text-pink-400 transition-all hover:bg-white/[0.08] active:scale-95"
              >
                <span className="text-base">Insta DM</span>
              </button>
              <button
                type="button"
                onClick={() => handleSocialShare("sms")}
                className="flex flex-col items-center justify-center gap-1 rounded-2xl border border-purple-500/30 bg-white/[0.04] py-3 text-xs font-semibold text-purple-400 transition-all hover:bg-white/[0.08] active:scale-95"
              >
                <span className="text-base">iMessage</span>
              </button>
            </div>

            <div className="grid grid-cols-2 gap-2 pt-1">
              <button
                type="button"
                onClick={() => handleSocialShare("native")}
                className="rounded-full bg-white py-3 text-xs font-semibold tracking-wider text-black uppercase transition-all active:scale-95"
              >
                Share Sheet
              </button>
              <button
                type="button"
                onClick={() => handleSocialShare("copy")}
                className="rounded-full border border-white/10 bg-white/[0.06] py-3 text-xs font-semibold tracking-wider text-zinc-300 uppercase transition-all hover:bg-white/[0.1] active:scale-95"
              >
                {copiedStatus || "Copy Link"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
