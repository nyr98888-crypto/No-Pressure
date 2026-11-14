"use client";

import { useEffect, useRef, useState } from "react";
import { Camera } from "lucide-react";
import { compressImageFile, stampIDareYou } from "@/lib/compress";
import { HEAT_COLORS, type HeatLevel } from "@/lib/types";
import { HeatFrame } from "../HeatFrame";
import { iconSm } from "../icons";

export function PhotoDare({
  level,
  onReady,
}: {
  level: HeatLevel;
  onReady: (dataUrl: string) => void;
}) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [banner, setBanner] = useState("I DARE YOU...");
  const [baseImage, setBaseImage] = useState<string | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const onReadyRef = useRef(onReady);
  onReadyRef.current = onReady;

  useEffect(() => {
    if (!baseImage) return;
    let cancelled = false;
    (async () => {
      try {
        const stamped = await stampIDareYou(
          baseImage,
          banner || "I DARE YOU...",
          HEAT_COLORS[level]
        );
        if (cancelled) return;
        setPreview(stamped);
        onReadyRef.current(stamped);
      } catch (err) {
        if (!cancelled) {
          setError(err instanceof Error ? err.message : "Stamp failed");
        }
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [baseImage, banner, level]);

  const process = async (file: File) => {
    setBusy(true);
    setError(null);
    try {
      const compressed = await compressImageFile(file);
      setBaseImage(compressed);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Photo failed");
    } finally {
      setBusy(false);
    }
  };

  return (
    <HeatFrame level={level} className="space-y-3 p-3">
      <label className="block text-[10px] font-bold tracking-widest text-[#9aa3b8]">
        MEME BANNER
        <input
          className="mt-1 w-full rounded-xl border border-white/10 bg-[#05070D] px-3 py-2 font-[family-name:var(--font-display)] text-lg font-black uppercase outline-none focus:border-rose-400"
          value={banner}
          onChange={(e) => setBanner(e.target.value)}
          style={{ color: HEAT_COLORS[level] }}
        />
      </label>
      {preview ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={preview} alt="Dare photo" className="w-full rounded-xl" />
      ) : (
        <div className="flex aspect-[4/5] items-center justify-center rounded-xl border border-dashed border-white/15 bg-black/30 text-sm text-[#9aa3b8]">
          Snap or upload a photo
        </div>
      )}
      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        capture="environment"
        className="hidden"
        onChange={(e) => {
          const file = e.target.files?.[0];
          if (file) void process(file);
        }}
      />
      <button
        type="button"
        className="pill-3d w-full bg-gradient-to-b from-cyan-400 to-cyan-700 px-3 py-3 text-xs text-white"
        disabled={busy}
        onClick={() => inputRef.current?.click()}
      >
        {busy ? (
          "Compressing…"
        ) : (
          <span className="inline-flex items-center justify-center gap-2">
            <Camera {...iconSm} />
            Camera / Upload
          </span>
        )}
      </button>
      {error && <p className="text-xs text-rose-300">{error}</p>}
    </HeatFrame>
  );
}
