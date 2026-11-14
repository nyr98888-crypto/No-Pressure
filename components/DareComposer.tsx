"use client";

import { useMemo, useRef, useState, type ReactNode } from "react";
import { Camera, Mic, Send, Type, Video } from "lucide-react";
import { containsBlockedTerms } from "@/lib/blocklist";
import { LS, creatorTokenKey } from "@/lib/storageKeys";
import { STATUS_STAMPS, type DareMode, type HeatLevel, type TierConfig } from "@/lib/types";
import { BrandCorner } from "./BrandCorner";
import { DownloadCardButton } from "./DownloadCardButton";
import { HeatFrame } from "./HeatFrame";
import { iconSm } from "./icons";
import { SharePills } from "./SharePills";
import { StatusStamp } from "./StatusStamp";
import { PhotoDare } from "./composer/PhotoDare";
import { TextDare } from "./composer/TextDare";
import { VideoRecorder } from "./composer/VideoRecorder";
import { VoiceRecorder } from "./composer/VoiceRecorder";

const MODES: { id: DareMode; label: string; icon: ReactNode }[] = [
  { id: "video", label: "Video", icon: <Video {...iconSm} className="h-4 w-4 stroke-[2]" /> },
  { id: "photo", label: "Photo", icon: <Camera {...iconSm} className="h-4 w-4 stroke-[2]" /> },
  { id: "voice", label: "Voice", icon: <Mic {...iconSm} className="h-4 w-4 stroke-[2]" /> },
  { id: "text", label: "Text", icon: <Type {...iconSm} className="h-4 w-4 stroke-[2]" /> },
];

export function DareComposer({
  level,
  tiers,
  initialText,
  onCreated,
  juiceBoom,
  onBeforeSend,
  onPaywallRequired,
}: {
  level: HeatLevel;
  tiers: TierConfig[];
  initialText?: string;
  onCreated: (dare: { id: string; url: string }) => void;
  juiceBoom: () => void;
  onBeforeSend?: () => boolean;
  onPaywallRequired?: () => void;
}) {
  const [mode, setMode] = useState<DareMode>("text");
  const [dareText, setDareText] = useState(initialText ?? "");
  const [forfeit, setForfeit] = useState("");
  const [media, setMedia] = useState<string>("");
  const [sender, setSender] = useState("");
  const [target, setTarget] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [share, setShare] = useState<{ id: string; url: string } | null>(null);
  const [lastInitial, setLastInitial] = useState(initialText);
  const cardRef = useRef<HTMLDivElement>(null);
  const tier = useMemo(
    () => tiers.find((t) => t.level === level)!,
    [tiers, level]
  );

  if (initialText !== lastInitial) {
    setLastInitial(initialText);
    if (initialText) setDareText(initialText);
  }

  const send = async () => {
    setError(null);
    if (onBeforeSend && !onBeforeSend()) return;
    const name = sender.trim() || localStorage.getItem(LS.nickname) || "Anon";
    localStorage.setItem(LS.nickname, name);

    const needsMedia = mode === "video" || mode === "photo" || mode === "voice";
    if (mode === "text") {
      if (!dareText.trim()) {
        setError("Write a dare first.");
        return;
      }
    } else if (needsMedia && !media) {
      setError("Capture media first.");
      return;
    }
    if (containsBlockedTerms(dareText) || containsBlockedTerms(forfeit)) {
      setError("Blocked wording — keep it comedy/social.");
      return;
    }

    setBusy(true);
    try {
      const res = await fetch("/api/dares", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          sender_name: name,
          target_name: target.trim() || null,
          mode,
          dare_text: dareText.trim() || null,
          media_data: media || null,
          level,
          level_label: tier.name,
          forfeit: forfeit.trim() || tier.forfeit,
          _hp: "",
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        if (res.status === 402 || data.code === "PAYWALL") {
          onPaywallRequired?.();
        }
        throw new Error(data.error || "Create failed");
      }
      if (typeof data.creatorToken === "string" && data.creatorToken) {
        try {
          localStorage.setItem(creatorTokenKey(data.id), data.creatorToken);
        } catch {
          /* ignore quota / private mode */
        }
      }
      juiceBoom();
      const url = `${window.location.origin}/d/${data.id}`;
      setShare({ id: data.id, url });
      onCreated({ id: data.id, url });
    } catch (err) {
      setError(err instanceof Error ? err.message : "Create failed");
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="space-y-3">
      <div
        ref={cardRef}
        data-np-level={level}
        data-np-title={`LVL ${level} · ${tier.name}`}
        data-np-body={dareText || "Your dare preview lands here."}
        data-np-stamp={STATUS_STAMPS.open}
      >
        <HeatFrame level={level} className="receipt-card space-y-3 p-4">
          <div className="flex items-start justify-between gap-2">
            <div>
              <BrandCorner />
              <p
                data-export-title
                className="mt-1 font-[family-name:var(--font-display)] text-2xl font-black tracking-tight"
              >
                LVL {level} · {tier.name}
              </p>
            </div>
            <StatusStamp kind="open" />
          </div>
          <p data-export-body className="text-sm leading-relaxed text-white/95">
            {dareText || "Your dare preview lands here."}
          </p>
          {forfeit || tier.forfeit ? (
            <p className="text-xs text-[#9aa3b8]">
              Forfeit: <span className="text-white/85">{forfeit || tier.forfeit}</span>
            </p>
          ) : null}
          <div className="flex items-center justify-between border-t border-white/10 pt-2">
            <p className="text-[10px] font-bold tracking-wide text-white/35">
              24H SELF-DESTRUCT
            </p>
            <BrandCorner align="right" />
          </div>
        </HeatFrame>
      </div>

      <div className="flex flex-wrap gap-2">
        {MODES.map((m) => (
          <button
            key={m.id}
            type="button"
            className={`pill-3d inline-flex items-center gap-1.5 px-3 py-2 text-xs ${
              mode === m.id
                ? "bg-gradient-to-b from-rose-500 to-rose-700 text-white"
                : "bg-white/10 text-white"
            }`}
            onClick={() => {
              setMode(m.id);
              setMedia("");
              setShare(null);
            }}
          >
            {m.icon}
            {m.label}
          </button>
        ))}
      </div>

      {mode === "video" && <VideoRecorder level={level} onReady={setMedia} />}
      {mode === "photo" && <PhotoDare level={level} onReady={setMedia} />}
      {mode === "voice" && <VoiceRecorder level={level} onReady={setMedia} />}
      {mode === "text" && (
        <TextDare
          level={level}
          text={dareText}
          forfeit={forfeit}
          onText={setDareText}
          onForfeit={setForfeit}
        />
      )}

      {(mode === "video" || mode === "photo" || mode === "voice") && (
        <input
          className="w-full rounded-xl border border-white/10 bg-[#05070D]/80 px-3 py-2 text-sm outline-none backdrop-blur-xl focus:border-rose-400"
          placeholder="Optional caption / dare text"
          value={dareText}
          onChange={(e) => setDareText(e.target.value)}
        />
      )}

      <div className="grid grid-cols-2 gap-2">
        <input
          className="rounded-xl border border-white/10 bg-[#05070D]/80 px-3 py-2 text-sm outline-none backdrop-blur-xl focus:border-rose-400"
          placeholder="Your name"
          value={sender}
          onChange={(e) => setSender(e.target.value)}
        />
        <input
          className="rounded-xl border border-white/10 bg-[#05070D]/80 px-3 py-2 text-sm outline-none backdrop-blur-xl focus:border-rose-400"
          placeholder="Target nickname"
          value={target}
          onChange={(e) => setTarget(e.target.value)}
        />
      </div>

      <button
        type="button"
        disabled={busy}
        className="pill-3d inline-flex w-full items-center justify-center gap-2 bg-gradient-to-b from-rose-400 to-rose-700 px-4 py-3.5 text-sm text-white shadow-[0_0_28px_rgba(255,23,68,0.25)]"
        onClick={send}
      >
        {busy ? (
          "Sending…"
        ) : (
          <>
            <Send {...iconSm} />
            Send Dare Link (24h)
          </>
        )}
      </button>

      {error && <p className="text-xs text-rose-300">{error}</p>}

      {share && (
        <div className="space-y-3 rounded-2xl border border-white/10 bg-black/30 p-3 backdrop-blur-2xl">
          <p className="text-sm font-bold tabular-nums text-emerald-200">
            Live for 24h
          </p>
          <p className="truncate text-[11px] text-[#9aa3b8]">{share.url}</p>
          <DownloadCardButton
            targetRef={cardRef}
            filename="no-pressure-dare.png"
          />
          <SharePills
            url={share.url}
            caption={`BET YOU WON'T · LVL ${level} ${tier.name} — No Pressure`}
          />
        </div>
      )}
    </div>
  );
}
