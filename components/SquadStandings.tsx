"use client";

import { useRef, useState } from "react";
import { Ban, Crown, Flame, Medal, Snowflake, Trophy, Zap } from "lucide-react";
import { streetCredRank, type RankId } from "@/lib/rank";
import type { SquadMember } from "@/lib/types";
import { BrandCorner } from "./BrandCorner";
import { DownloadCardButton } from "./DownloadCardButton";
import { iconSm, iconXs } from "./icons";
import { SharePills } from "./SharePills";

function RankMark({ id }: { id: RankId }) {
  if (id === "legend") return <Crown {...iconXs} />;
  if (id === "menace") return <Flame {...iconXs} />;
  if (id === "nofear") return <Zap {...iconXs} />;
  return <Snowflake {...iconXs} />;
}

function PlaceMark({ place }: { place: number }) {
  if (place === 0) return <Crown {...iconXs} className="h-3.5 w-3.5 text-yellow-300" />;
  if (place === 1) return <Medal {...iconXs} className="h-3.5 w-3.5 text-slate-300" />;
  if (place === 2) return <Medal {...iconXs} className="h-3.5 w-3.5 text-amber-700" />;
  return (
    <span className="text-[11px] font-black tabular-nums text-[#9aa3b8]">
      #{place + 1}
    </span>
  );
}

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
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editDraft, setEditDraft] = useState("");
  const sorted = [...squad].sort(
    (a, b) => b.certified - a.certified || b.maxHeat - a.maxHeat
  );

  if (!open) return null;

  const shareUrl = typeof window !== "undefined" ? window.location.origin : "";

  const commitEdit = (id: string) => {
    const trimmed = editDraft.trim();
    if (trimmed) onEdit(id, trimmed);
    setEditingId(null);
    setEditDraft("");
  };

  return (
    <div className="modal-backdrop fixed inset-0 z-50 flex items-end justify-center sm:items-center sm:p-4">
      <div className="glass-panel max-h-[92vh] w-full max-w-lg overflow-y-auto rounded-t-3xl p-5 sm:rounded-3xl">
        <div className="flex items-center justify-between">
          <h2 className="inline-flex items-center gap-2 font-[family-name:var(--font-display)] text-2xl font-black">
            <Trophy {...iconSm} />
            The Drop
          </h2>
          <button type="button" className="pill-3d bg-white/10 px-3 py-1.5 text-xs" onClick={onClose}>
            Close
          </button>
        </div>

        <div
          ref={cardRef}
          data-np-level="5"
          data-np-title="Drop Standings"
          data-np-body={sorted
            .slice(0, 8)
            .map(
              (m, i) =>
                `#${i + 1} ${m.nickname} — ${m.certified} certified`
            )
            .join(" · ")}
          data-np-stamp="THE DROP"
          className="receipt-card mt-4 overflow-hidden rounded-2xl border border-white/10 bg-gradient-to-b from-[#121018] to-[#05070D] p-4 shadow-[0_0_40px_rgba(255,109,0,0.12)]"
        >
          <div className="flex items-start justify-between">
            <BrandCorner />
            <p className="inline-flex items-center gap-1.5 font-[family-name:var(--font-display)] text-[10px] font-black tracking-[0.22em] text-orange-300/90">
              <Trophy {...iconXs} />
              THE DROP
            </p>
          </div>
          <p
            data-export-title
            className="mt-2 text-center font-[family-name:var(--font-display)] text-xl font-black tracking-tight"
          >
            Drop Standings
          </p>
          <div className="mt-3 space-y-2">
            {sorted.length === 0 && (
              <p className="text-center text-sm text-[#9aa3b8]">No squad yet — add nicknames.</p>
            )}
            {sorted.map((m, i) => {
              const rank = streetCredRank(m.certified);
              return (
                <div
                  key={m.id}
                  className={`flex items-center justify-between rounded-xl border px-3 py-2 ${
                    i === 0
                      ? "border-yellow-400/50 bg-yellow-400/10 shadow-[0_0_24px_rgba(255,214,0,0.2)]"
                      : "border-white/10 bg-black/40"
                  }`}
                >
                  <div>
                    <p className="inline-flex items-center gap-1.5 font-black tracking-tight">
                      <PlaceMark place={i} />
                      {m.nickname}
                    </p>
                    <p className="mt-0.5 inline-flex flex-wrap items-center gap-1 text-[10px] text-[#9aa3b8]">
                      <RankMark id={rank.id} />
                      {rank.label} · Max Heat LVL {m.maxHeat} ·
                      <Ban {...iconXs} />
                      {m.capsCalled}
                    </p>
                  </div>
                  <p className="text-lg font-black tabular-nums text-yellow-200">
                    {m.certified}
                  </p>
                </div>
              );
            })}
          </div>
          <div className="mt-3 border-t border-white/10 pt-2">
            <BrandCorner align="right" />
          </div>
        </div>

        <div className="mt-3 space-y-2">
          <DownloadCardButton
            targetRef={cardRef}
            filename="no-pressure-scoreboard.png"
          />
          <SharePills
            url={shareUrl}
            caption="The Drop — Drop Standings — No Pressure. Who's certified?"
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
              const trimmed = name.trim();
              if (!trimmed) return;
              onAdd(trimmed);
              setName("");
            }}
          >
            Add
          </button>
        </div>

        <ul className="mt-3 space-y-2">
          {sorted.map((m) => (
            <li key={m.id} className="flex items-center gap-2 text-sm">
              {editingId === m.id ? (
                <input
                  className="flex-1 rounded-lg border border-white/10 bg-black/20 px-2 py-1"
                  value={editDraft}
                  autoFocus
                  onChange={(e) => setEditDraft(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") commitEdit(m.id);
                    if (e.key === "Escape") {
                      setEditingId(null);
                      setEditDraft("");
                    }
                  }}
                />
              ) : (
                <span className="flex-1 truncate px-1 font-semibold">{m.nickname}</span>
              )}
              {editingId === m.id ? (
                <button
                  type="button"
                  className="pill-3d bg-emerald-600/80 px-2.5 py-1 text-[10px] text-white"
                  onClick={() => commitEdit(m.id)}
                >
                  Save
                </button>
              ) : (
                <button
                  type="button"
                  className="pill-3d bg-white/10 px-2.5 py-1 text-[10px] text-white"
                  onClick={() => {
                    setEditingId(m.id);
                    setEditDraft(m.nickname);
                  }}
                >
                  Edit
                </button>
              )}
              <button
                type="button"
                className="pill-3d bg-rose-700/80 px-2.5 py-1 text-[10px] text-white"
                onClick={() => {
                  if (editingId === m.id) {
                    setEditingId(null);
                    setEditDraft("");
                  }
                  onRemove(m.id);
                }}
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
