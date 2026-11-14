"use client";

import { useRef, useState } from "react";
import { streetCredRank } from "@/lib/rank";
import type { SquadMember } from "@/lib/types";
import { DownloadCardButton } from "./DownloadCardButton";
import { SharePills } from "./SharePills";

export function SquadStandings({
  open,
  onClose,
  squad,
  onAdd,
  onEdit,
  onRemove,
}: {
  open: boolean;
  onClose: () => void;
  squad: SquadMember[];
  onAdd: (nickname: string) => void;
  onEdit: (id: string, nickname: string) => void;
  onRemove: (id: string) => void;
}) {
  const cardRef = useRef<HTMLDivElement>(null);
  const [name, setName] = useState("");
  const sorted = [...squad].sort(
    (a, b) => b.certified - a.certified || b.maxHeat - a.maxHeat
  );

  if (!open) return null;

  const shareUrl = typeof window !== "undefined" ? window.location.origin : "";

  return (
    <div className="modal-backdrop fixed inset-0 z-50 flex items-end justify-center sm:items-center sm:p-4">
      <div className="glass-panel max-h-[92vh] w-full max-w-lg overflow-y-auto rounded-t-3xl p-5 sm:rounded-3xl">
        <div className="flex items-center justify-between">
          <h2 className="font-[family-name:var(--font-display)] text-2xl font-black">
            🏆 Squad Standings
          </h2>
          <button type="button" className="pill-3d bg-white/10 px-3 py-1.5 text-xs" onClick={onClose}>
            Close
          </button>
        </div>

        <div
          ref={cardRef}
          className="mt-4 overflow-hidden rounded-2xl border border-orange-500/40 bg-gradient-to-b from-[#1a0a0a] to-[#070A12] p-4"
        >
          <p className="text-center font-[family-name:var(--font-display)] text-xs font-black tracking-[0.25em] text-orange-300">
            NO PRESSURE · SCOREBOARD
          </p>
          <div className="mt-3 space-y-2">
            {sorted.length === 0 && (
              <p className="text-center text-sm text-[#9aa3b8]">No squad yet — add nicknames.</p>
            )}
            {sorted.map((m, i) => {
              const rank = streetCredRank(m.certified);
              const crown = i === 0 ? "👑" : i === 1 ? "🥈" : i === 2 ? "🥉" : `#${i + 1}`;
              return (
                <div
                  key={m.id}
                  className={`flex items-center justify-between rounded-xl border px-3 py-2 ${
                    i === 0
                      ? "border-yellow-400/50 bg-yellow-400/10 shadow-[0_0_24px_rgba(255,214,0,0.2)]"
                      : "border-white/10 bg-black/30"
                  }`}
                >
                  <div>
                    <p className="font-black">
                      {crown} {m.nickname}
                    </p>
                    <p className="text-[10px] text-[#9aa3b8]">
                      {rank.badge} {rank.label} · Max Heat LVL {m.maxHeat} · 🧢 {m.capsCalled}
                    </p>
                  </div>
                  <p className="text-lg font-black tabular-nums text-yellow-200">
                    {m.certified}
                  </p>
                </div>
              );
            })}
          </div>
        </div>

        <div className="mt-3 space-y-2">
          <DownloadCardButton targetRef={cardRef} filename="squad-standings.png" />
          <SharePills
            url={shareUrl}
            caption="🏆 Squad Standings — No Pressure. Who's certified?"
          />
        </div>

        <div className="mt-4 flex gap-2">
          <input
            className="flex-1 rounded-xl border border-white/10 bg-[#070A12] px-3 py-2 text-sm outline-none focus:border-rose-400"
            placeholder="Add nickname"
            value={name}
            onChange={(e) => setName(e.target.value)}
          />
          <button
            type="button"
            className="pill-3d bg-gradient-to-b from-rose-500 to-rose-700 px-4 py-2 text-xs text-white"
            onClick={() => {
              onAdd(name);
              setName("");
            }}
          >
            Add
          </button>
        </div>

        <ul className="mt-3 space-y-2">
          {sorted.map((m) => (
            <li key={m.id} className="flex items-center gap-2 text-sm">
              <input
                className="flex-1 rounded-lg border border-white/10 bg-black/20 px-2 py-1"
                value={m.nickname}
                onChange={(e) => onEdit(m.id, e.target.value)}
              />
              <button
                type="button"
                className="text-xs text-rose-300"
                onClick={() => onRemove(m.id)}
              >
                Remove
              </button>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
