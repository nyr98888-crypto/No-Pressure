"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { containsBlockedTerms } from "@/lib/blocklist";
import { LS } from "@/lib/storageKeys";
import type { DareMode, HeatLevel, TierConfig } from "@/lib/types";
import { DownloadCardButton } from "./DownloadCardButton";
import { HeatFrame } from "./HeatFrame";
import { SharePills } from "./SharePills";
import { StatusStamp } from "./StatusStamp";
import { PhotoDare } from "./composer/PhotoDare";
import { TextDare } from "./composer/TextDare";
import { VideoRecorder } from "./composer/VideoRecorder";
import { VoiceRecorder } from "./composer/VoiceRecorder";

const MODES: { id: DareMode; label: string }[] = [
  { id: "video", label: "🎥 Video" },
  { id: "photo", label: "📸 Photo" },
  { id: "voice", label: "🎙️ Voice" },
  { id: "text", label: "✍️ Text" },
];

export function DareComposer({
  level,
  tiers,
  initialText,
  onCreated,
  juiceBoom,
}: {
  level: HeatLevel;
  tiers: TierConfig[];
  initialText?: string;
  onCreated: (dare: { id: string; url: string }) => void;
  juiceBoom: () => void;
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
  const cardRef = useRef<HTMLDivElement>(null);
  const tier = useMemo(
    () => tiers.find((t) => t.level === level)!,
    [tiers, level]
  );

  useEffect(() => {
    if (initialText) setDareText(initialText);
  }, [initialText]);

  const send = async () => {
    setError(null);
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
      if (!res.ok) throw new Error(data.error || "Create failed");
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
      <div className="flex flex-wrap gap-2">
        {MODES.map((m) => (
          <button
            key={m.id}
            type="button"
            className={`pill-3d px-3 py-2 text-xs ${
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
          className="w-full rounded-xl border border-white/10 bg-[#070A12] px-3 py-2 text-sm outline-none focus:border-rose-400"
          placeholder="Optional caption / dare text"
          value={dareText}
          onChange={(e) => setDareText(e.target.value)}
        />
      )}

      <div className="grid grid-cols-2 gap-2">
        <input
          className="rounded-xl border border-white/10 bg-[#070A12] px-3 py-2 text-sm outline-none focus:border-rose-400"
          placeholder="Your name"
          value={sender}
          onChange={(e) => setSender(e.target.value)}
        />
        <input
          className="rounded-xl border border-white/10 bg-[#070A12] px-3 py-2 text-sm outline-none focus:border-rose-400"
          placeholder="Target nickname"
          value={target}
          onChange={(e) => setTarget(e.target.value)}
        />
      </div>

      <div ref={cardRef}>
        <HeatFrame level={level} className="space-y-3 p-4">
          <div className="flex items-start justify-between gap-2">
            <div>
              <p className="text-[10px] font-black tracking-widest text-[#9aa3b8]">
                NO PRESSURE
              </p>
              <p className="font-[family-name:var(--font-display)] text-lg font-black">
                LVL {level} · {tier.name}
              </p>
            </div>
            <StatusStamp kind="open" />
          </div>
          <p className="text-sm leading-relaxed">
            {dareText || "Your dare preview lands here."}
          </p>
          {forfeit || tier.forfeit ? (
            <p className="text-xs text-[#9aa3b8]">
              Forfeit: {forfeit || tier.forfeit}
            </p>
          ) : null}
        </HeatFrame>
      </div>

      <button
        type="button"
        disabled={busy}
        className="pill-3d w-full bg-gradient-to-b from-rose-400 to-rose-700 px-4 py-3.5 text-sm text-white"
        onClick={send}
      >
        {busy ? "Sending…" : "Send Dare Link (24h)"}
      </button>

      {error && <p className="text-xs text-rose-300">{error}</p>}

      {share && (
        <div className="space-y-2 rounded-2xl border border-emerald-400/30 bg-emerald-500/5 p-3">
          <p className="text-sm font-bold text-emerald-200">Live for 24h · {share.url}</p>
          <DownloadCardButton targetRef={cardRef} filename={`dare-${share.id}.png`} />
          <SharePills
            url={share.url}
            caption={`BET YOU WON'T 👀 LVL ${level} ${tier.name} — No Pressure`}
          />
        </div>
      )}
    </div>
  );
}
