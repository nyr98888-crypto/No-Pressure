"use client";

import confetti from "canvas-confetti";
import { AnimatePresence, motion } from "framer-motion";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useState } from "react";
import type { Bet } from "@/lib/types";
import { playBuzzer, playDetonation, playJackpot } from "@/lib/sounds";

type CasinoBetScreenProps = {
  bet: Bet;
};

const primaryBtn =
  "relative w-full py-4 px-6 rounded-xl font-black text-sm uppercase tracking-widest text-white bg-gradient-to-b from-red-500 to-red-700 border-t border-red-400/40 shadow-[0_6px_0_#7f1d1d,0_12px_24px_rgba(239,68,68,0.35)] transition-all duration-75 ease-out active:translate-y-[4px] active:shadow-[0_2px_0_#7f1d1d,0_4px_10px_rgba(239,68,68,0.2)] focus:outline-none select-none cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed disabled:active:translate-y-0 disabled:active:shadow-[0_6px_0_#7f1d1d,0_12px_24px_rgba(239,68,68,0.35)]";

const secondaryBtn =
  "relative w-full py-4 px-6 rounded-xl font-bold text-sm uppercase tracking-wider text-neutral-400 bg-[#1a1b22] border-t border-white/5 shadow-[0_6px_0_#0f1015] transition-all duration-75 ease-out active:translate-y-[4px] active:shadow-[0_2px_0_#0f1015] hover:text-white select-none cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed disabled:active:translate-y-0";

function fireCashRain() {
  const dollar = confetti.shapeFromText({ text: "$", scalar: 1.5 });
  confetti({
    particleCount: 90,
    spread: 80,
    startVelocity: 35,
    origin: { y: 0.2 },
    colors: ["#fbbf24", "#22c55e", "#fef08a", "#86efac"],
  });
  confetti({
    particleCount: 30,
    spread: 100,
    origin: { y: 0.15 },
    shapes: [dollar],
    colors: ["#facc15", "#fef08a"],
  });
}

function PayUpStamp() {
  return (
    <div className="stamp-in pointer-events-none absolute -right-2 -top-5 z-30 w-[132px] sm:w-[148px]">
      <Image
        src="/brand/pay-up-stamp.png"
        alt="PAY UP."
        width={296}
        height={160}
        className="h-auto w-full mix-blend-screen drop-shadow-[0_8px_20px_rgba(220,38,38,0.35)]"
        priority
      />
    </div>
  );
}

export default function CasinoBetScreen({ bet }: CasinoBetScreenProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [declined, setDeclined] = useState(false);
  const [mode, setMode] = useState<"winner" | "loser" | null>(
    bet.status === "resolved" ? (bet.winner === "CREATOR" ? "winner" : "loser") : null
  );

  async function patch(body: Record<string, string>) {
    setLoading(true);
    setError("");
    const res = await fetch(`/api/bets/${bet.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
    const data = await res.json();
    setLoading(false);
    if (!res.ok) {
      setError(data.error || "Failed");
      return false;
    }
    router.refresh();
    return true;
  }

  async function handleAccept() {
    navigator.vibrate?.([40]);
    playDetonation();
    await patch({ action: "accept" });
  }

  function handleDecline() {
    navigator.vibrate?.([40]);
    setDeclined(true);
  }

  async function handleIWon() {
    navigator.vibrate?.([40]);
    setMode("winner");
    playJackpot();
    fireCashRain();
    await patch({ action: "resolve", winner: "CREATOR" });
  }

  async function handleILost() {
    navigator.vibrate?.([40]);
    setMode("loser");
    playBuzzer();
    await patch({ action: "resolve", winner: "OPPONENT" });
  }

  function sharePayUp() {
    navigator.vibrate?.([40]);
    const text = `PAY UP.\nBet You Lose: "${bet.challenge_text}"\nStake: ${bet.stake_text}\n${window.location.href}`;
    window.open(`https://wa.me/?text=${encodeURIComponent(text)}`, "_blank", "noopener,noreferrer");
  }

  const showWinner =
    mode === "winner" || (bet.status === "resolved" && bet.winner === "CREATOR");
  const showLoser =
    mode === "loser" || (bet.status === "resolved" && bet.winner === "OPPONENT");

  return (
    <main className="relative flex min-h-screen w-full items-center justify-center overflow-hidden bg-[#070709] p-4">
      <Image
        src="/brand/ambient-glow.jpg"
        alt=""
        fill
        priority
        className="pointer-events-none object-cover opacity-80"
        aria-hidden
      />

      <div className="relative z-10 w-full max-w-sm">
        <div className="relative rounded-3xl border border-white/10 bg-[#121318]/90 p-6 shadow-[0_20px_50px_rgba(0,0,0,0.8),0_0_40px_rgba(220,38,38,0.1)] backdrop-blur-xl">
          <PayUpStamp />

          <div className="pr-16">
            <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-neutral-500">
              Bet You Lose
            </p>
            <h1 className="mt-3 text-2xl font-black tracking-tight text-white sm:text-3xl">
              {bet.challenge_text}
            </h1>
            <p className="mt-4 inline-flex rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs font-bold tracking-wide text-neutral-300">
              Stake · {bet.stake_text}
            </p>
          </div>

          <div className="mt-8 space-y-3">
            {declined ? (
              <p className="rounded-xl border border-white/10 bg-black/30 px-4 py-5 text-center text-sm font-medium text-neutral-400">
                Challenge declined.
              </p>
            ) : null}

            {!declined && bet.status === "pending_approval" ? (
              <>
                <button
                  type="button"
                  disabled={loading}
                  onClick={handleAccept}
                  className={primaryBtn}
                >
                  {loading ? "Locking..." : "Accept Bet"}
                </button>
                <button
                  type="button"
                  disabled={loading}
                  onClick={handleDecline}
                  className={secondaryBtn}
                >
                  Decline
                </button>
              </>
            ) : null}

            {!declined && bet.status === "locked" && !mode ? (
              <>
                <p className="pb-1 text-center text-[11px] font-semibold uppercase tracking-[0.2em] text-amber-400/80">
                  Locked In
                </p>
                <button
                  type="button"
                  disabled={loading}
                  onClick={handleIWon}
                  className={primaryBtn}
                >
                  {loading ? "Syncing..." : "I Won · Pay Up"}
                </button>
                <button
                  type="button"
                  disabled={loading}
                  onClick={handleILost}
                  className={secondaryBtn}
                >
                  I Lost
                </button>
              </>
            ) : null}

            {(showWinner || showLoser) && (bet.status === "resolved" || mode) ? (
              <AnimatePresence mode="wait">
                {showWinner ? (
                  <motion.div
                    key="win"
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="space-y-3"
                  >
                    <p className="text-center text-lg font-black tracking-tight text-white">
                      Collect your stake
                    </p>
                    <button type="button" onClick={sharePayUp} className={primaryBtn}>
                      Pay Up · Share
                    </button>
                    <button
                      type="button"
                      onClick={() => router.push("/")}
                      className={secondaryBtn}
                    >
                      New Bet
                    </button>
                  </motion.div>
                ) : (
                  <motion.div
                    key="lose"
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="space-y-3 grayscale"
                  >
                    <p className="text-center text-lg font-black tracking-tight text-neutral-300">
                      Busted
                    </p>
                    <button type="button" onClick={sharePayUp} className={primaryBtn}>
                      Pay Up
                    </button>
                    <button
                      type="button"
                      onClick={() => router.push("/")}
                      className={secondaryBtn}
                    >
                      New Bet
                    </button>
                  </motion.div>
                )}
              </AnimatePresence>
            ) : null}
          </div>

          {error ? (
            <p className="mt-4 text-center text-sm text-red-400" role="alert">
              {error}
            </p>
          ) : null}
        </div>
      </div>
    </main>
  );
}
