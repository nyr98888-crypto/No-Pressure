"use client";

import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import { useJuice } from "@/hooks/useJuice";
import { useSessionBoot, type SessionBootState } from "@/hooks/useSessionBoot";
import { PaywallModal } from "./PaywallModal";

type PaywallContextValue = SessionBootState & {
  openPaywall: () => void;
  /** Returns false if gated (and opens modal). */
  requireAccess: (opts?: { level?: number; forCreate?: boolean }) => boolean;
};

const PaywallCtx = createContext<PaywallContextValue | null>(null);

export function usePaywall() {
  const ctx = useContext(PaywallCtx);
  if (!ctx) {
    return {
      paywallEnabled: false,
      testMode: false,
      isUnlocked: true,
      sessionId: "",
      vipCode: null,
      checkoutUrl: "",
      dareCount: 0,
      freeDaresRemaining: 3,
      ready: true,
      refresh: async () =>
        ({
          paywallEnabled: false,
          testMode: false,
          isUnlocked: true,
          sessionId: "",
          vipCode: null,
          checkoutUrl: "",
          dareCount: 0,
          freeDaresRemaining: 3,
          ready: true,
          refresh: async () => null as never,
        }) as SessionBootState,
      openPaywall: () => undefined,
      requireAccess: () => true,
    } satisfies PaywallContextValue;
  }
  return ctx;
}

export function PaywallProvider({ children }: { children: ReactNode }) {
  const session = useSessionBoot();
  const { juice } = useJuice();
  const [open, setOpen] = useState(false);

  const openPaywall = useCallback(() => setOpen(true), []);

  const requireAccess = useCallback(
    (opts?: { level?: number; forCreate?: boolean }) => {
      if (!session.paywallEnabled || session.isUnlocked) return true;
      const level = opts?.level ?? 1;
      if (level >= 4) {
        setOpen(true);
        return false;
      }
      if (opts?.forCreate && session.dareCount >= 3) {
        setOpen(true);
        return false;
      }
      return true;
    },
    [session.paywallEnabled, session.isUnlocked, session.dareCount]
  );

  const value = useMemo<PaywallContextValue>(
    () => ({
      ...session,
      openPaywall,
      requireAccess,
    }),
    [session, openPaywall, requireAccess]
  );

  return (
    <PaywallCtx.Provider value={value}>
      {children}
      <PaywallModal
        open={open}
        onClose={() => setOpen(false)}
        sessionId={session.sessionId}
        checkoutUrl={session.checkoutUrl}
        testMode={session.testMode}
        juicePop={() => void juice("pop")}
        onUnlocked={async () => {
          await session.refresh();
          // Keep modal open so the VIP code stays visible; user closes manually.
        }}
      />
    </PaywallCtx.Provider>
  );
}
