"use client";

import { RefObject, useState } from "react";
import { Download } from "lucide-react";
import { downloadCardPng } from "@/lib/exportCard";
import { iconSm } from "./icons";

export function DownloadCardButton({
  targetRef,
  filename = "no-pressure-dare.png",
}: {
  targetRef: RefObject<HTMLElement | null>;
  filename?: string;
}) {
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  return (
    <div className="space-y-1">
      <button
        type="button"
        className="pill-3d inline-flex w-full items-center justify-center gap-2 bg-gradient-to-b from-emerald-400 to-emerald-700 px-4 py-3 text-sm text-white"
        disabled={busy}
        onClick={async () => {
          if (!targetRef.current) return;
          setBusy(true);
          setError(null);
          try {
            const safe = filename.toLowerCase().endsWith(".png")
              ? filename
              : "no-pressure-dare.png";
            await downloadCardPng(targetRef.current, safe);
          } catch {
            setError("Could not export PNG — try again.");
          } finally {
            setBusy(false);
          }
        }}
      >
        {busy ? (
          "Saving PNG…"
        ) : (
          <>
            <Download {...iconSm} />
            Download Locally
          </>
        )}
      </button>
      {error && <p className="text-center text-[11px] text-rose-300">{error}</p>}
    </div>
  );
}
