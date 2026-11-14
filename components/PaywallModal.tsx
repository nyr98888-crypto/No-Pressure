"use client";

import { useCallback, useEffect, useState } from "react";
import Script from "next/script";
import { Crown, Flame, KeyRound, Sparkles } from "lucide-react";
import { iconSm } from "./icons";

declare global {
  interface Window {
    createLemonSqueezy?: () => void;
    LemonSqueezy?: {
      Url?: { Open: (url: string) => void };
      Setup?: (opts: {
        eventHandler: (event: { event: string }) => void;
      }) => void;
    };
  }
}

export function PaywallModal({
  open,
  onClose,
  sessionId,
  checkoutUrl,
  testMode,
  onUnlocked,
  juicePop,
}: {
  open: boolean;
  onClose: () => void;
  sessionId: string;
  checkoutUrl: string;
  testMode: boolean;
  onUnlocked: (vipCode: string | null) => void;
  juicePop: () => void;
}) {
  const [vipInput, setVipInput] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [revealedVip, setRevealedVip] = useState<string | null>(null);
  const [polling, setPolling] = useState(false);

  const pollUntilUnlocked = useCallback(async () => {
    setPolling(true);
    try {
      for (let i = 0; i < 10; i++) {
        const res = await fetch("/api/session", {
          credentials: "same-origin",
          cache: "no-store",
        });
        if (res.ok) {
          const data = (await res.json()) as {
            isUnlocked?: boolean;
            vipCode?: string | null;
          };
          if (data.isUnlocked) {
            const code = data.vipCode || null;
            setRevealedVip(code);
            juicePop();
            onUnlocked(code);
            return;
          }
        }
        await new Promise((r) => window.setTimeout(r, 1000));
      }
      setError("Payment received — refresh in a moment if unlock is slow.");
    } finally {
      setPolling(false);
    }
  }, [juicePop, onUnlocked]);

  useEffect(() => {
    if (!open) return;

    const setup = () => {
      try {
        window.createLemonSqueezy?.();
        window.LemonSqueezy?.Setup?.({
          eventHandler: (event) => {
            if (event?.event === "Checkout.Success") {
              void pollUntilUnlocked();
            }
          },
        });
      } catch {
        /* lemon.js optional until loaded */
      }
    };

    setup();
    const id = window.setInterval(setup, 500);
    window.setTimeout(() => window.clearInterval(id), 4000);
    return () => window.clearInterval(id);
  }, [open, pollUntilUnlocked]);

  if (!open) return null;

  const openCheckout = () => {
    setError(null);
    if (!checkoutUrl) {
      setError(
        testMode
          ? "No Lemon checkout URL yet — use Simulate Paid Order."
          : "Checkout URL not configured."
      );
      return;
    }
    try {
      const url = new URL(checkoutUrl);
      url.searchParams.set("embed", "1");
      url.searchParams.set("dark", "1");
      url.searchParams.set("checkout[custom][session_id]", sessionId);
      const href = url.toString();
      if (window.LemonSqueezy?.Url?.Open) {
        window.LemonSqueezy.Url.Open(href);
      } else {
        window.open(href, "_blank", "noopener,noreferrer");
      }
    } catch {
      setError("Could not open checkout.");
    }
  };

  const restoreVip = async () => {
    setBusy(true);
    setError(null);
    try {
      const res = await fetch("/api/session/restore", {
        method: "POST",
        credentials: "same-origin",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ code: vipInput }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Restore failed");
      const code = typeof data.vipCode === "string" ? data.vipCode : vipInput;
      setRevealedVip(code);
      juicePop();
      onUnlocked(code);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Restore failed");
    } finally {
      setBusy(false);
    }
  };

  const simulate = async () => {
    setBusy(true);
    setError(null);
    try {
      const res = await fetch("/api/webhooks/lemonsqueezy/simulate", {
        method: "POST",
        credentials: "same-origin",
        headers: { "Content-Type": "application/json" },
        body: "{}",
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Simulate failed");
      const code = typeof data.vipCode === "string" ? data.vipCode : null;
      setRevealedVip(code);
      juicePop();
      onUnlocked(code);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Simulate failed");
    } finally {
      setBusy(false);
    }
  };

  return (
    <>
      <Script
        src="https://app.lemonsqueezy.com/js/lemon.js"
        strategy="lazyOnload"
      />
      <div className="modal-backdrop fixed inset-0 z-[110] flex items-end justify-center sm:items-center sm:p-4">
        <div className="glass-panel max-h-[92vh] w-full max-w-md overflow-y-auto rounded-t-3xl p-5 shadow-2xl sm:rounded-3xl">
          <div className="flex items-start justify-between gap-3">
            <div>
              <p className="inline-flex items-center gap-1.5 text-[10px] font-black tracking-[0.22em] text-amber-300">
                <Crown {...iconSm} /> ALL-ACCESS PASS
              </p>
              <h2 className="mt-1 font-[family-name:var(--font-display)] text-3xl font-black tracking-tight">
                Unlock the Inferno
              </h2>
              <p className="mt-1 text-sm text-[#9aa3b8]">
                One-time pass for Levels 4–5 and unlimited dares. Keep your VIP
                code for any device.
              </p>
            </div>
            <button
              type="button"
              className="pill-3d bg-white/10 px-3 py-1.5 text-xs text-white"
              onClick={onClose}
            >
              Close
            </button>
          </div>

          {revealedVip ? (
            <div className="mt-5 rounded-2xl border border-amber-400/40 bg-amber-400/10 p-4">
              <p className="text-[10px] font-black tracking-[0.2em] text-amber-200">
                YOUR VIP PASS CODE
              </p>
              <p className="mt-2 font-mono text-lg font-black tracking-wider text-amber-100">
                {revealedVip}
              </p>
              <p className="mt-2 text-xs text-[#9aa3b8]">
                Save this code — you&apos;ll need it to restore All-Access on
                another device.
              </p>
            </div>
          ) : (
            <>
              <button
                type="button"
                disabled={busy || polling}
                className="pill-3d mt-5 inline-flex w-full items-center justify-center gap-2 bg-gradient-to-b from-rose-400 to-rose-700 px-4 py-3.5 text-sm text-white"
                onClick={openCheckout}
              >
                <Flame {...iconSm} />
                {polling
                  ? "Confirming unlock…"
                  : "Unlock Inferno & Unlimited Dares"}
              </button>

              <div className="mt-5 border-t border-white/10 pt-4">
                <p className="inline-flex items-center gap-1.5 text-[10px] font-black tracking-[0.18em] text-[#9aa3b8]">
                  <KeyRound {...iconSm} /> ALREADY HAVE A VIP CODE?
                </p>
                <div className="mt-2 flex gap-2">
                  <input
                    className="flex-1 rounded-xl border border-white/10 bg-[#05070D]/90 px-3 py-2 font-mono text-sm uppercase outline-none focus:border-amber-400"
                    placeholder="NP-XXXX-XXXX-XXXX"
                    value={vipInput}
                    onChange={(e) => setVipInput(e.target.value)}
                  />
                  <button
                    type="button"
                    disabled={busy || !vipInput.trim()}
                    className="pill-3d bg-gradient-to-b from-amber-300 to-amber-600 px-4 py-2 text-xs text-black disabled:opacity-50"
                    onClick={restoreVip}
                  >
                    Restore
                  </button>
                </div>
              </div>

              {testMode && (
                <button
                  type="button"
                  disabled={busy}
                  className="mt-4 inline-flex w-full items-center justify-center gap-2 rounded-xl border border-dashed border-white/20 bg-white/[0.03] px-3 py-2.5 text-[11px] font-bold text-[#9aa3b8] transition hover:border-amber-400/40 hover:text-amber-100"
                  onClick={simulate}
                >
                  <Sparkles {...iconSm} />
                  Simulate Paid Order (Test Mode)
                </button>
              )}
            </>
          )}

          {error && (
            <p className="mt-3 text-center text-xs text-rose-300">{error}</p>
          )}
        </div>
      </div>
    </>
  );
}
