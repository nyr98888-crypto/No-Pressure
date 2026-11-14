"use client";

import { useRef, useState } from "react";
import { compressImageFile, stampIDareYou } from "@/lib/compress";
import type { HeatLevel } from "@/lib/types";
import { HeatFrame } from "../HeatFrame";

export function PhotoDare({
  level,
  onReady,
}: {
  level: HeatLevel;
  onReady: (dataUrl: string) => void;
}) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [banner, setBanner] = useState("I DARE YOU...");
  const [preview, setPreview] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  const process = async (file: File) => {
    setBusy(true);
    setError(null);
    try {
      const compressed = await compressImageFile(file);
      const stamped = await stampIDareYou(compressed, banner || "I DARE YOU...");
      setPreview(stamped);
      onReady(stamped);
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
          className="mt-1 w-full rounded-xl border border-white/10 bg-[#070A12] px-3 py-2 font-[family-name:var(--font-display)] text-lg font-black uppercase outline-none focus:border-rose-400"
          value={banner}
          onChange={(e) => setBanner(e.target.value)}
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
      <div className="flex gap-2">
        <button
          type="button"
          className="pill-3d flex-1 bg-gradient-to-b from-cyan-400 to-cyan-700 px-3 py-3 text-xs text-white"
          disabled={busy}
          onClick={() => inputRef.current?.click()}
        >
          {busy ? "Compressing…" : "📸 Camera / Upload"}
        </button>
        {preview && (
          <button
            type="button"
            className="pill-3d bg-white/10 px-3 py-3 text-xs"
            onClick={async () => {
              if (!preview) return;
              const stamped = await stampIDareYou(preview, banner || "I DARE YOU...");
              setPreview(stamped);
              onReady(stamped);
            }}
          >
            Re-stamp
          </button>
        )}
      </div>
      {error && <p className="text-xs text-rose-300">{error}</p>}
    </HeatFrame>
  );
}
