"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import {
  AlertTriangle,
  Ban,
  CheckCircle2,
  Crown,
  Hourglass,
} from "lucide-react";
import { compressAudioBlob, compressImageFile, compressVideoBlob } from "@/lib/compress";
import { useJuice } from "@/hooks/useJuice";
import { useLocalStats } from "@/hooks/useLocalStats";
import { useSquad } from "@/hooks/useSquad";
import { creatorTokenKey } from "@/lib/storageKeys";
import { STATUS_STAMPS, type DareMode, type DareRecord, type HeatLevel } from "@/lib/types";
import { BrandCorner } from "./BrandCorner";
import { DownloadCardButton } from "./DownloadCardButton";
import { HeatFrame } from "./HeatFrame";
import { iconSm, iconXs } from "./icons";
import { SharePills } from "./SharePills";
import { StatusStamp } from "./StatusStamp";

function formatTtl(expiresAt: number, nowSec: number) {
  const left = Math.max(0, expiresAt - nowSec);
  const h = String(Math.floor(left / 3600)).padStart(2, "0");
  const m = String(Math.floor((left % 3600) / 60)).padStart(2, "0");
  return `${h}:${m}`;
}

function stampForStatus(status: DareRecord["status"]) {
  if (status === "locked") return "locked" as const;
  if (status === "proved") return "cooked" as const;
  if (status === "certified") return "certified" as const;
  if (status === "capped") return "capped" as const;
  return "open" as const;
}

function exportStamp(dare: DareRecord) {
  if (dare.status === "capped") return STATUS_STAMPS.capped;
  if (dare.status === "certified") return STATUS_STAMPS.certified;
  if (dare.status === "proved") return STATUS_STAMPS.cooked;
  if (dare.passes > 0) return STATUS_STAMPS.chickened;
  return STATUS_STAMPS.open;
}

export function DareView({ initialId }: { initialId: string }) {
  const [dare, setDare] = useState<DareRecord | null>(null);
  const [nowSec, setNowSec] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [gone, setGone] = useState(false);
  const [shake, setShake] = useState(false);
  const [burst, setBurst] = useState(false);
  const [slam, setSlam] = useState(false);
  const [role, setRole] = useState<"recipient" | "sender">("recipient");
  const [proofBusy, setProofBusy] = useState(false);
  const cardRef = useRef<HTMLDivElement>(null);
  const { juice } = useJuice();
  const { lockIn, cook, certify } = useLocalStats();
  const { upsert } = useSquad();

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const res = await fetch(`/api/dares/${initialId}`);
        if (cancelled) return;
        if (res.status === 410) {
          setGone(true);
          return;
        }
        if (!res.ok) {
          setError("Could not load dare");
          return;
        }
        setDare(await res.json());
      } catch {
        if (!cancelled) setError("Could not load dare");
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [initialId]);

  // Date.now() only on the client after mount (countdown tick)
  useEffect(() => {
    const tick = () => setNowSec(Math.floor(Date.now() / 1000));
    tick();
    const id = window.setInterval(tick, 1000);
    return () => clearInterval(id);
  }, []);

  const patch = async (body: Record<string, unknown>) => {
    let creatorToken: string | undefined;
    try {
      creatorToken = localStorage.getItem(creatorTokenKey(initialId)) || undefined;
    } catch {
      creatorToken = undefined;
    }
    const res = await fetch(`/api/dares/${initialId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        ...body,
        ...(creatorToken ? { creatorToken } : {}),
        _hp: "",
      }),
    });
    if (res.status === 410) {
      setGone(true);
      return null;
    }
    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      throw new Error(data.error || "Update failed");
    }
    const next = (await res.json()) as DareRecord;
    setDare(next);
    return next;
  };

  const impact = async (kind: "boom" | "cap" | "pop" | "lock") => {
    setShake(true);
    setSlam(true);
    setBurst(kind === "boom" || kind === "pop");
    await juice(kind);
    window.setTimeout(() => setShake(false), 280);
    window.setTimeout(() => setBurst(false), 700);
    window.setTimeout(() => setSlam(false), 500);
  };

  if (gone) {
    return (
      <div className="mx-auto max-w-lg p-6 text-center">
        <h1 className="font-[family-name:var(--font-display)] text-3xl font-black">
          Link wiped
        </h1>
        <p className="mt-2 text-sm text-[#9aa3b8]">
          This dare self-destructed after 24 hours (or was reported).
        </p>
      </div>
    );
  }

  if (!dare) {
    return (
      <div className="mx-auto max-w-lg p-6 text-center text-sm text-[#9aa3b8]">
        {error || "Loading dare…"}
      </div>
    );
  }

  const url = typeof window !== "undefined" ? window.location.href : "";

  return (
    <div className={`heat-stage heat-stage-${dare.level} min-h-full`}>
      <div className={`mx-auto max-w-lg space-y-4 p-4 ${shake ? "screen-shake" : ""}`}>
        <div className="flex items-center justify-between gap-2">
        <Link href="/" className="pill-3d bg-white/10 px-3 py-1.5 text-xs">
          ← Home
        </Link>
          <div className="flex gap-2">
            <button
              type="button"
              className={`pill-3d px-3 py-1.5 text-[10px] ${role === "recipient" ? "bg-rose-600 text-white" : "bg-white/10"}`}
              onClick={() => setRole("recipient")}
            >
              I&apos;m Challenged
            </button>
            <button
              type="button"
              className={`pill-3d px-3 py-1.5 text-[10px] ${role === "sender" ? "bg-amber-500 text-black" : "bg-white/10"}`}
              onClick={() => setRole("sender")}
            >
              I Sent This
            </button>
          </div>
        </div>

        <div
          ref={cardRef}
          className={burst ? "animate-ember-burst" : ""}
          data-np-level={dare.level}
          data-np-title={`LVL ${dare.level} · ${dare.level_label}`}
          data-np-body={dare.dare_text || ""}
          data-np-stamp={exportStamp(dare)}
        >
          <HeatFrame level={dare.level as HeatLevel} className="receipt-card space-y-3 p-4">
            <div className="flex items-start justify-between gap-2">
              <div>
                <BrandCorner />
                <p className="mt-1 text-[10px] font-black tracking-widest text-[#9aa3b8]">
                  FROM {dare.sender_name.toUpperCase()}
                  {dare.target_name ? ` → ${dare.target_name.toUpperCase()}` : ""}
                </p>
                <p
                  data-export-title
                  className="font-[family-name:var(--font-display)] text-xl font-black tracking-tight tabular-nums"
                >
                  LVL {dare.level} · {dare.level_label}
                </p>
              </div>
              <StatusStamp
                kind={
                  dare.passes > 0 &&
                  (dare.status === "open" || dare.status === "locked")
                    ? "chickened"
                    : stampForStatus(dare.status)
                }
                slam={slam}
              />
            </div>

            <div className="flex flex-wrap gap-2 text-[11px] font-bold">
              <span className="inline-flex items-center gap-1.5 rounded-full border border-white/10 bg-black/40 px-2 py-1 tabular-nums">
                <Hourglass {...iconXs} />
                Self-destructs in{" "}
                {nowSec > 0 ? formatTtl(dare.expires_at, nowSec) : "--:--"}
              </span>
              <span className="inline-flex items-center gap-1.5 rounded-full border border-[#FFD600] bg-[#FFD600] px-2 py-1 font-black tabular-nums text-[#111]">
                <AlertTriangle {...iconXs} />
                PASSED {dare.passes}x
              </span>
            </div>

            {dare.dare_text && (
              <p data-export-body className="text-sm leading-relaxed">
                {dare.dare_text}
              </p>
            )}
            {dare.forfeit && (
              <p className="text-xs text-[#9aa3b8]">Forfeit: {dare.forfeit}</p>
            )}

            <MediaBlock mode={dare.mode} data={dare.media_data} />

            {dare.proof_data && (
              <div className="rounded-xl border border-emerald-400/30 bg-emerald-500/5 p-3">
                <p className="mb-2 text-[10px] font-black tracking-widest text-emerald-300">
                  PROOF
                </p>
                <MediaBlock mode={dare.proof_mode || "photo"} data={dare.proof_data} />
              </div>
            )}
            <div className="border-t border-white/10 pt-2">
              <BrandCorner align="right" />
            </div>
          </HeatFrame>
        </div>

        <DownloadCardButton targetRef={cardRef} filename="no-pressure-dare.png" />

        {role === "recipient" && (
          <div className="space-y-2">
            {(dare.status === "open" || dare.status === "capped") && (
              <>
                <button
                  type="button"
                  className="pill-3d w-full bg-gradient-to-b from-amber-300 to-orange-600 px-4 py-3 text-sm text-black"
                  onClick={async () => {
                    await patch({ action: "lock" });
                    lockIn();
                    await impact("lock");
                  }}
                >
                  Lock In Dare
                </button>
                <button
                  type="button"
                  className="pill-3d inline-flex w-full items-center justify-center gap-2 bg-gradient-to-b from-orange-500 to-rose-700 px-4 py-3 text-sm text-white"
                  disabled={dare.level >= 5}
                  onClick={async () => {
                    await patch({ action: "chicken" });
                    await impact("cap");
                  }}
                >
                  <AlertTriangle {...iconSm} />
                  Chicken Out & Raise +1 Heat
                </button>
              </>
            )}

            {(dare.status === "open" ||
              dare.status === "locked" ||
              dare.status === "capped") && (
              <ProofDropper
                busy={proofBusy}
                onProof={async (proof_mode, proof_data) => {
                  setProofBusy(true);
                  try {
                    await patch({ action: "proof", proof_mode, proof_data });
                    cook();
                    await impact("boom");
                  } finally {
                    setProofBusy(false);
                  }
                }}
              />
            )}

            {dare.status === "proved" && (
              <div className="space-y-2 rounded-2xl border border-white/10 p-3">
                <p className="text-sm font-bold">Send for Verdict</p>
                <SharePills
                  url={url}
                  caption="COOKED — PROVED IT · Sender, certify or call cap — No Pressure"
                />
              </div>
            )}
          </div>
        )}

        {role === "sender" && dare.status === "proved" && (
          <div className="grid gap-2 sm:grid-cols-2">
            <button
              type="button"
              className="pill-3d inline-flex items-center justify-center gap-2 bg-gradient-to-b from-yellow-300 to-amber-600 px-4 py-4 text-sm text-black"
              onClick={async () => {
                await patch({ action: "certify" });
                certify();
                upsert(dare.target_name || "Challenger", {
                  certified: 1,
                  maxHeat: dare.level as HeatLevel,
                });
                upsert(dare.sender_name, { maxHeat: dare.level as HeatLevel });
                await impact("pop");
              }}
            >
              <Crown {...iconSm} />
              NO CAP — CERTIFY
              <CheckCircle2 {...iconSm} />
            </button>
            <button
              type="button"
              className="pill-3d inline-flex items-center justify-center gap-2 bg-gradient-to-b from-slate-500 to-slate-800 px-4 py-4 text-sm text-white"
              onClick={async () => {
                await patch({ action: "cap" });
                upsert(dare.target_name || "Challenger", { capsCalled: 1 });
                await impact("cap");
              }}
            >
              <Ban {...iconSm} />
              CALL CAP (Redo)
            </button>
          </div>
        )}

        {dare.status === "certified" && (
          <SharePills
            url={url}
            caption={`NO CAP — CERTIFIED · LVL ${dare.level} — No Pressure`}
          />
        )}

        <button
          type="button"
          className="w-full text-center text-[11px] text-[#9aa3b8] underline"
          onClick={async () => {
            if (!confirm("Report / wipe this dare permanently?")) return;
            await patch({ action: "wipe" });
            setGone(true);
          }}
        >
          Report / Wipe
        </button>
      </div>
    </div>
  );
}

function MediaBlock({
  mode,
  data,
}: {
  mode: DareMode | string;
  data: string | null;
}) {
  if (!data) return null;
  if (mode === "video") {
    return <video src={data} controls className="w-full rounded-xl bg-black" />;
  }
  if (mode === "voice") {
    return <audio src={data} controls className="w-full" />;
  }
  if (mode === "photo") {
    // eslint-disable-next-line @next/next/no-img-element
    return <img src={data} alt="Dare media" className="w-full rounded-xl" />;
  }
  return null;
}

function ProofDropper({
  busy,
  onProof,
}: {
  busy: boolean;
  onProof: (mode: DareMode, data: string) => Promise<void>;
}) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [mode, setMode] = useState<DareMode>("photo");

  return (
    <div className="space-y-2 rounded-2xl border border-white/10 p-3">
      <p className="text-[10px] font-black tracking-widest text-[#9aa3b8]">
        DROP PROOF
      </p>
      <div className="flex flex-wrap gap-2">
        {(["photo", "video", "voice"] as DareMode[]).map((m) => (
          <button
            key={m}
            type="button"
            className={`pill-3d px-3 py-1.5 text-[11px] ${mode === m ? "bg-emerald-600 text-white" : "bg-white/10"}`}
            onClick={() => setMode(m)}
          >
            {m}
          </button>
        ))}
      </div>
      <input
        ref={inputRef}
        type="file"
        accept={
          mode === "photo" ? "image/*" : mode === "video" ? "video/*" : "audio/*"
        }
        capture={mode === "photo" ? "environment" : mode === "video" ? "user" : undefined}
        className="hidden"
        onChange={async (e) => {
          const file = e.target.files?.[0];
          if (!file) return;
          let data: string;
          if (mode === "photo") data = await compressImageFile(file);
          else if (mode === "video") data = await compressVideoBlob(file);
          else data = await compressAudioBlob(file);
          await onProof(mode, data);
        }}
      />
      <button
        type="button"
        disabled={busy}
        className="pill-3d w-full bg-gradient-to-b from-emerald-400 to-emerald-700 px-4 py-3 text-sm text-white"
        onClick={() => inputRef.current?.click()}
      >
        {busy ? "Uploading…" : "Drop Proof (Photo/Video/Voice)"}
      </button>
    </div>
  );
}
