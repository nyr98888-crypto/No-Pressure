"use client";

import { useCallback, useState } from "react";
import { readLocalJson } from "@/lib/readLocal";
import { LS } from "@/lib/storageKeys";
import { DEFAULT_TIERS, type HeatLevel, type TierConfig } from "@/lib/types";

function loadTiers(): TierConfig[] {
  const parsed = readLocalJson<TierConfig[] | null>(LS.tiers, null);
  if (Array.isArray(parsed) && parsed.length === 5) return parsed;
  return DEFAULT_TIERS;
}

export function useTiers() {
  const [tiers, setTiers] = useState<TierConfig[]>(loadTiers);

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
