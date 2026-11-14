"use client";

import { containsBlockedTerms } from "@/lib/blocklist";
import type { HeatLevel } from "@/lib/types";
import { HeatFrame } from "../HeatFrame";

export function TextDare({
  level,
  text,
  forfeit,
  onText,
  onForfeit,
}: {
  level: HeatLevel;
  text: string;
  forfeit: string;
  onText: (v: string) => void;
  onForfeit: (v: string) => void;
}) {
  const blocked = containsBlockedTerms(text) || containsBlockedTerms(forfeit);

  return (
    <HeatFrame level={level} className="space-y-3 p-4">
      <label className="block text-[10px] font-bold tracking-widest text-[#9aa3b8]">
        DARE TEXT
        <textarea
          className="mt-1 min-h-28 w-full rounded-xl border border-white/10 bg-[#070A12] px-3 py-2 text-sm outline-none focus:border-rose-400"
          placeholder="Bet you won't…"
          value={text}
          onChange={(e) => onText(e.target.value)}
          maxLength={500}
        />
      </label>
      <label className="block text-[10px] font-bold tracking-widest text-[#9aa3b8]">
        FORFEIT / STAKE (OPTIONAL)
        <input
          className="mt-1 w-full rounded-xl border border-white/10 bg-[#070A12] px-3 py-2 text-sm outline-none focus:border-rose-400"
          placeholder="If they chicken out…"
          value={forfeit}
          onChange={(e) => onForfeit(e.target.value)}
          maxLength={200}
        />
      </label>
      {blocked && (
        <p className="text-xs text-rose-300">
          That wording is blocked. Keep it fun, comedy, and social — no harm.
        </p>
      )}
    </HeatFrame>
  );
}
