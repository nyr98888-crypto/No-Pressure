"use client";

import { toPng } from "html-to-image";
import { RefObject, useState } from "react";

export function DownloadCardButton({
  targetRef,
  filename = "no-pressure-card.png",
}: {
  targetRef: RefObject<HTMLElement | null>;
  filename?: string;
}) {
  const [busy, setBusy] = useState(false);

  return (
    <button
      type="button"
      className="pill-3d w-full bg-gradient-to-b from-emerald-400 to-emerald-700 px-4 py-3 text-sm text-white"
      disabled={busy}
      onClick={async () => {
        if (!targetRef.current) return;
        setBusy(true);
        try {
          const dataUrl = await toPng(targetRef.current, {
            cacheBust: true,
            pixelRatio: 2,
            backgroundColor: "#070A12",
          });
          const a = document.createElement("a");
          a.href = dataUrl;
          a.download = filename;
          a.click();
        } catch {
          /* ignore */
        } finally {
          setBusy(false);
        }
      }}
    >
      {busy ? "Saving…" : "⬇ Download Locally"}
    </button>
  );
}
