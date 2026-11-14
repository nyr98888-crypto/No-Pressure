"use client";

import { useEffect, useState, useSyncExternalStore } from "react";
import { LS, OPEN_TERMS_EVENT } from "@/lib/storageKeys";

function subscribeAge(cb: () => void) {
  window.addEventListener("storage", cb);
  window.addEventListener(OPEN_TERMS_EVENT, cb);
  return () => {
    window.removeEventListener("storage", cb);
    window.removeEventListener(OPEN_TERMS_EVENT, cb);
  };
}

function ageGateOpen(): boolean {
  return localStorage.getItem(LS.ageGate) !== "1";
}

export function AgeGate() {
  const needsConsent = useSyncExternalStore(
    subscribeAge,
    ageGateOpen,
    () => false
  );
  const [reviewOnly, setReviewOnly] = useState(false);

  useEffect(() => {
    const onOpen = () => setReviewOnly(true);
    window.addEventListener(OPEN_TERMS_EVENT, onOpen);
    return () => window.removeEventListener(OPEN_TERMS_EVENT, onOpen);
  }, []);

  const open = needsConsent || reviewOnly;
  if (!open) return null;

  return (
    <div className="modal-backdrop fixed inset-0 z-[100] flex items-center justify-center p-4">
      <div className="glass-panel max-h-[90vh] w-full max-w-md overflow-y-auto rounded-3xl p-6 shadow-2xl">
        <p className="font-[family-name:var(--font-display)] text-xs font-black tracking-[0.2em] text-rose-400">
          18+ & ASSUMPTION OF RISK
        </p>
        <h1 className="mt-2 font-[family-name:var(--font-display)] text-3xl font-black tracking-tight text-white">
          Enter at your own risk
        </h1>
        <ul className="mt-4 space-y-3 text-sm leading-relaxed text-[#c5ccdc]">
          <li>
            You confirm you are <strong className="text-white">18 years or older</strong>.
          </li>
          <li>
            No Pressure is strictly for{" "}
            <strong className="text-white">fun, comedy, and social entertainment</strong>.
          </li>
          <li>
            You agree to{" "}
            <strong className="text-white">act responsibly and lawfully</strong> at all times.
          </li>
          <li>
            You assume{" "}
            <strong className="text-white">100% personal ownership and risk</strong> and fully
            release the app creator from any injury, loss, or damages arising from your use.
          </li>
          <li>
            Personal counters and leaderboards stay{" "}
            <strong className="text-white">locally on your device</strong>. Shared links{" "}
            <strong className="text-white">auto-delete permanently after 24 hours</strong>.
          </li>
        </ul>
        <button
          type="button"
          className="pill-3d mt-6 w-full bg-gradient-to-b from-rose-500 to-rose-700 px-5 py-3.5 text-sm text-white"
          onClick={() => {
            localStorage.setItem(LS.ageGate, "1");
            setReviewOnly(false);
            window.dispatchEvent(new Event("storage"));
          }}
        >
          {reviewOnly ? "Got It — Close" : "I Agree — Enter at My Own Risk"}
        </button>
      </div>
    </div>
  );
}

export function openTermsModal() {
  if (typeof window !== "undefined") {
    window.dispatchEvent(new Event(OPEN_TERMS_EVENT));
  }
}
