"use client";

import { useState } from "react";
import type { TierConfig } from "@/lib/types";

export function CustomizeTiersModal({
  open,
  tiers,
  onClose,
  onSave,
}: {
  open: boolean;
  tiers: TierConfig[];
  onClose: () => void;
  onSave: (tiers: TierConfig[]) => void;
}) {
  const [draft, setDraft] = useState(tiers);
  const [wasOpen, setWasOpen] = useState(open);

  // Sync draft when the modal opens (React-approved props→state adjust during render)
  if (open !== wasOpen) {
    setWasOpen(open);
    if (open) setDraft(tiers);
  }

  if (!open) return null;

  return (
    <div className="modal-backdrop fixed inset-0 z-50 flex items-end justify-center p-4 sm:items-center">
      <div className="glass-panel w-full max-w-md rounded-3xl p-5">
        <h2 className="font-[family-name:var(--font-display)] text-2xl font-black">
          Customize Tiers
        </h2>
        <p className="mt-1 text-xs text-[#9aa3b8]">Saved on this device only.</p>
        <div className="mt-4 space-y-3">
          {draft.map((t, i) => (
            <div key={t.level} className="rounded-xl border border-white/10 bg-black/20 p-3">
              <p className="text-[10px] font-black tracking-widest text-[#9aa3b8]">
                LEVEL {t.level}
              </p>
              <input
                className="mt-1 w-full rounded-lg border border-white/10 bg-[#070A12] px-3 py-2 text-sm outline-none focus:border-rose-400"
                value={t.name}
                onChange={(e) => {
                  const next = [...draft];
                  next[i] = { ...t, name: e.target.value };
                  setDraft(next);
                }}
              />
              <input
                className="mt-2 w-full rounded-lg border border-white/10 bg-[#070A12] px-3 py-2 text-sm outline-none focus:border-rose-400"
                value={t.forfeit}
                placeholder="Default forfeit"
                onChange={(e) => {
                  const next = [...draft];
                  next[i] = { ...t, forfeit: e.target.value };
                  setDraft(next);
                }}
              />
            </div>
          ))}
        </div>
        <div className="mt-4 flex gap-2">
          <button
            type="button"
            className="pill-3d flex-1 bg-white/10 px-4 py-3 text-sm text-white"
            onClick={onClose}
          >
            Cancel
          </button>
          <button
            type="button"
            className="pill-3d flex-1 bg-gradient-to-b from-rose-500 to-rose-700 px-4 py-3 text-sm text-white"
            onClick={() => {
              onSave(draft);
              onClose();
            }}
          >
            Save Tiers
          </button>
        </div>
      </div>
    </div>
  );
}
