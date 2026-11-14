"use client";

import { useCallback, useState } from "react";
import { readLocalJson } from "@/lib/readLocal";
import { LS } from "@/lib/storageKeys";
import type { HeatLevel, SquadMember } from "@/lib/types";

function uid() {
  return Math.random().toString(36).slice(2, 9);
}

export function useSquad() {
  const [squad, setSquad] = useState<SquadMember[]>(() =>
    readLocalJson<SquadMember[]>(LS.squad, [])
  );

  const persist = useCallback((next: SquadMember[]) => {
    setSquad(next);
    localStorage.setItem(LS.squad, JSON.stringify(next));
  }, []);

  const upsert = useCallback(
    (
      nickname: string,
      patch: Partial<Pick<SquadMember, "certified" | "maxHeat" | "capsCalled">>
    ) => {
      const name = nickname.trim();
      if (!name) return;
      setSquad((prev) => {
        const existing = prev.find(
          (m) => m.nickname.toLowerCase() === name.toLowerCase()
        );
        let next: SquadMember[];
        if (existing) {
          next = prev.map((m) =>
            m.id === existing.id
              ? {
                  ...m,
                  certified: m.certified + (patch.certified ?? 0),
                  capsCalled: m.capsCalled + (patch.capsCalled ?? 0),
                  maxHeat: Math.max(m.maxHeat, patch.maxHeat ?? m.maxHeat) as HeatLevel,
                }
              : m
          );
        } else {
          next = [
            ...prev,
            {
              id: uid(),
              nickname: name,
              certified: patch.certified ?? 0,
              maxHeat: (patch.maxHeat ?? 1) as HeatLevel,
              capsCalled: patch.capsCalled ?? 0,
            },
          ];
        }
        localStorage.setItem(LS.squad, JSON.stringify(next));
        return next;
      });
    },
    []
  );

  const addManual = useCallback(
    (nickname: string) => {
      upsert(nickname, {});
    },
    [upsert]
  );

  const edit = useCallback((id: string, nickname: string) => {
    const name = nickname.trim();
    if (!name) return;
    setSquad((prev) => {
      const next = prev.map((m) => (m.id === id ? { ...m, nickname: name } : m));
      localStorage.setItem(LS.squad, JSON.stringify(next));
      return next;
    });
  }, []);

  const remove = useCallback((id: string) => {
    setSquad((prev) => {
      const next = prev.filter((m) => m.id !== id);
      localStorage.setItem(LS.squad, JSON.stringify(next));
      return next;
    });
  }, []);

  return { squad, persist, upsert, addManual, edit, remove };
}
