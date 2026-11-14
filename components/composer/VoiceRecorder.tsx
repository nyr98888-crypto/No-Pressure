"use client";

import { useEffect, useRef, useState } from "react";
import { compressAudioBlob } from "@/lib/compress";
import { HEAT_COLORS, type HeatLevel } from "@/lib/types";
import { HeatFrame } from "../HeatFrame";

const MAX_MS = 12_000;

export function VoiceRecorder({
  level,
  onReady,
}: {
  level: HeatLevel;
  onReady: (dataUrl: string) => void;
}) {
  const recorderRef = useRef<MediaRecorder | null>(null);
  const chunks = useRef<Blob[]>([]);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const rafRef = useRef<number>(0);
  const [recording, setRecording] = useState(false);
  const [elapsed, setElapsed] = useState(0);
  const [bars, setBars] = useState<number[]>(Array(24).fill(4));
  const [preview, setPreview] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!recording) return;
    const start = Date.now();
    const id = window.setInterval(() => {
      const e = Date.now() - start;
      setElapsed(e);
      if (e >= MAX_MS) stop();
    }, 100);
    return () => clearInterval(id);
  }, [recording]);

  const start = async () => {
    setError(null);
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const ctx = new AudioContext();
      const source = ctx.createMediaStreamSource(stream);
      const analyser = ctx.createAnalyser();
      analyser.fftSize = 64;
      source.connect(analyser);
      analyserRef.current = analyser;

      const tick = () => {
        const data = new Uint8Array(analyser.frequencyBinCount);
        analyser.getByteFrequencyData(data);
        setBars(Array.from({ length: 24 }, (_, i) => 4 + (data[i % data.length] / 255) * 28));
        rafRef.current = requestAnimationFrame(tick);
      };
      rafRef.current = requestAnimationFrame(tick);

      const mime = MediaRecorder.isTypeSupported("audio/webm;codecs=opus")
        ? "audio/webm;codecs=opus"
        : "audio/webm";
      const rec = new MediaRecorder(stream, { mimeType: mime, audioBitsPerSecond: 48_000 });
      recorderRef.current = rec;
      chunks.current = [];
      rec.ondataavailable = (e) => {
        if (e.data.size) chunks.current.push(e.data);
      };
      rec.onstop = async () => {
        cancelAnimationFrame(rafRef.current);
        stream.getTracks().forEach((t) => t.stop());
        void ctx.close();
        try {
          const blob = new Blob(chunks.current, { type: mime });
          const dataUrl = await compressAudioBlob(blob);
          setPreview(dataUrl);
          onReady(dataUrl);
        } catch (err) {
          setError(err instanceof Error ? err.message : "Audio failed");
        }
      };
      setElapsed(0);
      setRecording(true);
      rec.start(100);
    } catch {
      setError("Mic permission needed.");
    }
  };

  const stop = () => {
    setRecording(false);
    recorderRef.current?.state === "recording" && recorderRef.current.stop();
  };

  return (
    <HeatFrame level={level} className="space-y-3 p-4">
      <div className="flex h-16 items-end justify-center gap-1">
        {bars.map((h, i) => (
          <span
            key={i}
            className="w-1.5 rounded-full"
            style={{ height: h, background: HEAT_COLORS[level] }}
          />
        ))}
      </div>
      <p className="text-center text-xs text-[#9aa3b8]">
        {recording ? `${Math.ceil((MAX_MS - elapsed) / 1000)}s left` : "12s max · Opus"}
      </p>
      {preview && <audio src={preview} controls className="w-full" />}
      {!recording ? (
        <button
          type="button"
          className="pill-3d w-full bg-gradient-to-b from-violet-400 to-violet-700 px-4 py-3 text-sm text-white"
          onClick={start}
        >
          🎙️ Record Voice
        </button>
      ) : (
        <button
          type="button"
          className="pill-3d w-full bg-gradient-to-b from-amber-400 to-amber-700 px-4 py-3 text-sm text-white"
          onClick={stop}
        >
          Stop
        </button>
      )}
      {error && <p className="text-xs text-rose-300">{error}</p>}
    </HeatFrame>
  );
}
