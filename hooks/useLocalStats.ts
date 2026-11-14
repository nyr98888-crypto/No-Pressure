"use client";

import { useCallback, useState } from "react";
import { streetCredRank } from "@/lib/rank";
import { readLocalJson } from "@/lib/readLocal";
import { LS } from "@/lib/storageKeys";
import type { LocalStats } from "@/lib/types";

const DEFAULT: LocalStats = {
  lockedIn: 0,
  cooked: 0,
  certified: 0,
  streak: 0,
  lastDailyKey: null,
};

export function useLocalStats() {
  const [stats, setStats] = useState<LocalStats>(() => ({
    ...DEFAULT,
    ...readLocalJson<Partial<LocalStats>>(LS.stats, {}),
  }));
  const [popup, setPopup] = useState<string | null>(null);

  const persist = useCallback((next: LocalStats) => {
    setStats(next);
    localStorage.setItem(LS.stats, JSON.stringify(next));
  }, []);

  const bump = useCallback(
    (key: keyof Pick<LocalStats, "lockedIn" | "cooked" | "certified">, label: string) => {
      setStats((prev) => {
        const next = { ...prev, [key]: prev[key] + 1 };
        localStorage.setItem(LS.stats, JSON.stringify(next));
        setPopup(label);
        window.setTimeout(() => setPopup(null), 900);
        return next;
      });
    },
    []
  );

  const lockIn = useCallback(() => bump("lockedIn", "+1 LOCKED IN"), [bump]);
  const cook = useCallback(() => bump("cooked", "+1 COOKED"), [bump]);
  const certify = useCallback(() => bump("certified", "+1 CERTIFIED"), [bump]);

  const completeDaily = useCallback((dayKey: string) => {
    setStats((prev) => {
      const consecutive = prev.lastDailyKey
        ? (() => {
            const last = new Date(prev.lastDailyKey + "T00:00:00");
            const cur = new Date(dayKey + "T00:00:00");
            const diff = (cur.getTime() - last.getTime()) / 86400000;
            return diff === 1 ? prev.streak + 1 : 1;
          })()
        : 1;
      const next = {
        ...prev,
        lockedIn: prev.lockedIn + 1,
        streak: consecutive,
        lastDailyKey: dayKey,
      };
      localStorage.setItem(LS.stats, JSON.stringify(next));
      setPopup("+1 STREAK");
      window.setTimeout(() => setPopup(null), 900);
      return next;
    });
  }, []);

  const rank = streetCredRank(stats.certified);

  return {
    stats,
    rank,
    popup,
    lockIn,
    cook,
    certify,
    completeDaily,
    persist,
  };
}
