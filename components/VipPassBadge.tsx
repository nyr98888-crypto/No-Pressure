"use client";

import { useState } from "react";
import { Check, Copy, Crown } from "lucide-react";
import { iconXs } from "./icons";

export function VipPassBadge({ vipCode }: { vipCode: string }) {
  const [copied, setCopied] = useState(false);

  return (
    <button
      type="button"
      title="Copy VIP Pass recovery code"
      className="pill-3d inline-flex max-w-full items-center gap-1.5 bg-gradient-to-b from-amber-300/90 to-amber-600 px-2.5 py-1.5 text-[10px] font-black tracking-wide text-black"
      onClick={async () => {
        try {
          await navigator.clipboard.writeText(vipCode);
          setCopied(true);
          window.setTimeout(() => setCopied(false), 1600);
        } catch {
          /* ignore */
        }
      }}
    >
      <Crown {...iconXs} />
      <span>VIP PASS</span>
      <span className="truncate font-mono text-[9px] opacity-90">{vipCode}</span>
      {copied ? <Check {...iconXs} /> : <Copy {...iconXs} />}
    </button>
  );
}
