"use client";

import { useCallback, useEffect, useState } from "react";
import { LS } from "@/lib/storageKeys";
import { DEFAULT_TIERS, type HeatLevel, type TierConfig } from "@/lib/types";

export function useTiers() {
  const [tiers, setTiers] = useState<TierConfig[]>(DEFAULT_TIERS);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(LS.tiers);
      if (raw) {
        const parsed = JSON.parse(raw) as TierConfig[];
        if (Array.isArray(parsed) && parsed.length === 5) setTiers(parsed);
      }
    } catch {
      /* ignore */
    }
  }, []);

  const save = useCallback((next: TierConfig[]) => {
    setTiers(next);
    localStorage.setItem(LS.tiers, JSON.stringify(next));
  }, []);

  const getTier = useCallback(
    (level: HeatLevel) => tiers.find((t) => t.level === level) ?? DEFAULT_TIERS[level - 1],
    [tiers]
  );

  return { tiers, save, getTier };
}
