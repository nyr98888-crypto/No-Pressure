"use client";

import { useEffect, useRef, useState } from "react";
import { compressVideoBlob } from "@/lib/compress";
import type { HeatLevel } from "@/lib/types";
import { HeatFrame } from "../HeatFrame";

const MAX_MS = 10_000;

export function VideoRecorder({
  level,
  onReady,
}: {
  level: HeatLevel;
  onReady: (dataUrl: string) => void;
}) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const mediaRef = useRef<MediaStream | null>(null);
  const recorderRef = useRef<MediaRecorder | null>(null);
  const chunks = useRef<Blob[]>([]);
  const [facing, setFacing] = useState<"user" | "environment">("user");
  const [recording, setRecording] = useState(false);
  const [elapsed, setElapsed] = useState(0);
  const [preview, setPreview] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        mediaRef.current?.getTracks().forEach((t) => t.stop());
        const stream = await navigator.mediaDevices.getUserMedia({
          video: { facingMode: facing },
          audio: true,
        });
        if (cancelled) {
          stream.getTracks().forEach((t) => t.stop());
          return;
        }
        mediaRef.current = stream;
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          await videoRef.current.play();
        }
      } catch {
        setError("Camera permission needed.");
      }
    })();
    return () => {
      cancelled = true;
      mediaRef.current?.getTracks().forEach((t) => t.stop());
    };
  }, [facing]);

  const stop = () => {
    setRecording(false);
    if (recorderRef.current?.state === "recording") {
      recorderRef.current.stop();
    }
  };

  useEffect(() => {
    if (!recording) return;
    const startAt = Date.now();
    const id = window.setInterval(() => {
      const e = Date.now() - startAt;
      setElapsed(e);
      if (e >= MAX_MS) {
        setRecording(false);
        if (recorderRef.current?.state === "recording") {
          recorderRef.current.stop();
        }
      }
    }, 100);
    return () => clearInterval(id);
  }, [recording]);

  const start = () => {
    if (!mediaRef.current) return;
    chunks.current = [];
    const mime = MediaRecorder.isTypeSupported("video/webm;codecs=vp9,opus")
      ? "video/webm;codecs=vp9,opus"
      : "video/webm";
    const rec = new MediaRecorder(mediaRef.current, { mimeType: mime, videoBitsPerSecond: 600_000 });
    recorderRef.current = rec;
    rec.ondataavailable = (e) => {
      if (e.data.size) chunks.current.push(e.data);
    };
    rec.onstop = async () => {
      try {
        const blob = new Blob(chunks.current, { type: "video/webm" });
        const dataUrl = await compressVideoBlob(blob);
        setPreview(dataUrl);
        onReady(dataUrl);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Compress failed");
      }
    };
    setElapsed(0);
    setRecording(true);
    rec.start(100);
  };

  const progress = Math.min(1, elapsed / MAX_MS);
  const r = 42;
  const c = 2 * Math.PI * r;
  const offset = c * (1 - progress);

  return (
    <HeatFrame level={level} className="p-3">
      {preview ? (
        <div className="space-y-3">
          <video src={preview} controls className="aspect-[9/16] w-full rounded-xl bg-black object-cover" />
          <button
            type="button"
            className="pill-3d w-full bg-white/10 px-4 py-3 text-sm"
            onClick={() => {
              setPreview(null);
              onReady("");
            }}
          >
            Retake
          </button>
        </div>
      ) : (
        <div className="relative">
          <video
            ref={videoRef}
            muted
            playsInline
            className="aspect-[9/16] w-full rounded-xl bg-black object-cover"
          />
          <svg className="pointer-events-none absolute left-3 top-3 h-24 w-24" viewBox="0 0 100 100">
            <circle cx="50" cy="50" r={r} fill="none" stroke="rgba(255,255,255,0.15)" strokeWidth="6" />
            <circle
              className="countdown-ring"
              cx="50"
              cy="50"
              r={r}
              fill="none"
              stroke={recording ? "#FF1744" : "#00E676"}
              strokeWidth="6"
              strokeDasharray={c}
              strokeDashoffset={offset}
            />
            <text x="50" y="54" textAnchor="middle" fill="white" fontSize="14" fontWeight="800">
              {Math.ceil((MAX_MS - elapsed) / 1000)}s
            </text>
          </svg>
          <div className="mt-3 flex gap-2">
            <button
              type="button"
              className="pill-3d flex-1 bg-white/10 px-3 py-3 text-xs"
              onClick={() => setFacing((f) => (f === "user" ? "environment" : "user"))}
            >
              Flip Cam
            </button>
            {!recording ? (
              <button
                type="button"
                className="pill-3d flex-1 bg-gradient-to-b from-rose-500 to-rose-700 px-3 py-3 text-xs text-white"
                onClick={start}
              >
                Record (10s max)
              </button>
            ) : (
              <button
                type="button"
                className="pill-3d flex-1 bg-gradient-to-b from-amber-400 to-amber-700 px-3 py-3 text-xs text-white"
                onClick={stop}
              >
                Stop
              </button>
            )}
          </div>
        </div>
      )}
      {error && <p className="mt-2 text-xs text-rose-300">{error}</p>}
    </HeatFrame>
  );
}
