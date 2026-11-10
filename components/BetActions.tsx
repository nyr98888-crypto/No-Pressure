"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import type { Bet } from "@/lib/types";
import ReceiptCard from "@/components/ReceiptCard";
import StampBadge from "@/components/StampBadge";

type BetActionsProps = {
  bet: Bet;
};

export default function BetActions({ bet }: BetActionsProps) {
  const router = useRouter();
  const [opponentName, setOpponentName] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

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
      setError(data.error || "Something went wrong");
      return;
    }

    router.refresh();
  }

  if (bet.status === "PENDING") {
    return (
      <div className="space-y-4">
        <div className="flex justify-center">
          <StampBadge label="PENDING" tone="zinc" />
        </div>
        <div>
          <label className="mb-1 block text-xs uppercase tracking-wider text-zinc-400">
            Your Name
          </label>
          <input
            required
            value={opponentName}
            onChange={(e) => setOpponentName(e.target.value)}
            placeholder="Opponent"
            className="w-full border border-zinc-800 bg-zinc-900 p-3 text-white focus:border-red-500 focus:outline-none"
          />
        </div>
        <button
          type="button"
          disabled={loading || !opponentName.trim()}
          onClick={() => patch({ action: "accept", opponentName })}
          className="w-full bg-red-600 py-4 text-lg font-black uppercase tracking-wider text-black transition-transform hover:bg-red-700 active:translate-y-1 disabled:opacity-50"
        >
          {loading ? "Locking..." : "Accept Bet (Prove Them Wrong)"}
        </button>
        {error ? <p className="text-sm text-red-400">{error}</p> : null}
      </div>
    );
  }

  if (bet.status === "LOCKED") {
    return (
      <div className="space-y-4">
        <div className="flex justify-center">
          <StampBadge label="LOCKED" tone="yellow" />
        </div>
        <div className="border border-zinc-800 bg-zinc-900/50 p-4">
          <p className="mb-1 text-xs uppercase tracking-widest text-zinc-400">Locked between</p>
          <p className="text-lg font-black text-white">
            {bet.creator_name} <span className="text-red-500">vs</span> {bet.opponent_name}
          </p>
        </div>
        <p className="text-xs uppercase tracking-wider text-zinc-500">Who won?</p>
        <div className="grid grid-cols-1 gap-2">
          <button
            type="button"
            disabled={loading}
            onClick={() => patch({ action: "resolve", winner: "CREATOR" })}
            className="w-full border border-zinc-700 bg-zinc-900 py-3 font-black uppercase tracking-wider text-white hover:border-red-500 disabled:opacity-50"
          >
            {bet.creator_name} wins
          </button>
          <button
            type="button"
            disabled={loading}
            onClick={() => patch({ action: "resolve", winner: "OPPONENT" })}
            className="w-full border border-zinc-700 bg-zinc-900 py-3 font-black uppercase tracking-wider text-white hover:border-yellow-400 disabled:opacity-50"
          >
            {bet.opponent_name} wins
          </button>
        </div>
        {error ? <p className="text-sm text-red-400">{error}</p> : null}
      </div>
    );
  }

  const paid = Boolean(bet.paid_receipt);

  return (
    <div className="space-y-4">
      <div className="flex justify-center">
        <StampBadge label={paid ? "SETTLED" : "PAY UP"} tone={paid ? "zinc" : "red"} />
      </div>
      <ReceiptCard bet={bet} />
      {!paid ? (
        <button
          type="button"
          disabled={loading}
          onClick={() => patch({ action: "mark_paid" })}
          className="w-full bg-red-600 py-3 font-black uppercase tracking-wider text-black hover:bg-red-700 disabled:opacity-50"
        >
          {loading ? "Marking..." : "Mark as Paid"}
        </button>
      ) : (
        <p className="text-center text-sm font-bold uppercase tracking-widest text-green-400">
          Debt cleared.
        </p>
      )}
      {error ? <p className="text-sm text-red-400">{error}</p> : null}
    </div>
  );
}
