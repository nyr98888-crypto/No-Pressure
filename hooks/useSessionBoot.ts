"use client";

import { useCallback, useEffect, useState } from "react";

export type SessionBootState = {
  paywallEnabled: boolean;
  testMode: boolean;
  isUnlocked: boolean;
  sessionId: string;
  vipCode: string | null;
  checkoutUrl: string;
  dareCount: number;
  freeDaresRemaining: number;
  ready: boolean;
  refresh: () => Promise<SessionBootState>;
};

const FAIL_OPEN: Omit<SessionBootState, "refresh"> = {
  paywallEnabled: false,
  testMode: false,
  isUnlocked: true,
  sessionId: "",
  vipCode: null,
  checkoutUrl: "",
  dareCount: 0,
  freeDaresRemaining: 3,
  ready: true,
};

function parsePayload(data: Record<string, unknown>): Omit<SessionBootState, "refresh"> {
  const paywallEnabled = Boolean(data.paywallEnabled);
  return {
    paywallEnabled,
    testMode: Boolean(data.testMode),
    isUnlocked: paywallEnabled ? Boolean(data.isUnlocked) : true,
    sessionId: typeof data.sessionId === "string" ? data.sessionId : "",
    vipCode: typeof data.vipCode === "string" ? data.vipCode : null,
    checkoutUrl: typeof data.checkoutUrl === "string" ? data.checkoutUrl : "",
    dareCount: Number(data.dareCount ?? 0),
    freeDaresRemaining: Number(data.freeDaresRemaining ?? 3),
    ready: true,
  };
}

/**
 * Background session init — NEVER blocks first paint.
 */
export function useSessionBoot(): SessionBootState {
  const [state, setState] = useState<Omit<SessionBootState, "refresh">>({
    ...FAIL_OPEN,
    ready: false,
  });

  const refresh = useCallback(async () => {
    try {
      const res = await fetch("/api/session", {
        method: "GET",
        credentials: "same-origin",
        cache: "no-store",
      });
      if (!res.ok) throw new Error("session failed");
      const data = (await res.json()) as Record<string, unknown>;
      const next = parsePayload(data);
      setState(next);
      return { ...next, refresh };
    } catch {
      setState(FAIL_OPEN);
      return { ...FAIL_OPEN, refresh };
    }
  }, []);

  useEffect(() => {
    let cancelled = false;
    void (async () => {
      try {
        const res = await fetch("/api/session", {
          method: "GET",
          credentials: "same-origin",
          cache: "no-store",
        });
        if (!res.ok) throw new Error("session failed");
        const data = (await res.json()) as Record<string, unknown>;
        if (!cancelled) setState(parsePayload(data));
      } catch {
        if (!cancelled) setState(FAIL_OPEN);
      } finally {
        if (!cancelled) setState((prev) => ({ ...prev, ready: true }));
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  return {
    ...state,
    isUnlocked: state.isUnlocked || !state.paywallEnabled,
    refresh,
  };
}
