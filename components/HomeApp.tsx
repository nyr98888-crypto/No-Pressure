"use client";

import { useEffect, useState } from "react";
import { useJuice } from "@/hooks/useJuice";
import { useLocalStats } from "@/hooks/useLocalStats";
import { useReduceMotion } from "@/hooks/useReduceMotion";
import { useSquad } from "@/hooks/useSquad";
import { useTiers } from "@/hooks/useTiers";
import type { HeatLevel } from "@/lib/types";
import { openTermsModal } from "./AgeGate";
import { CustomizeTiersModal } from "./CustomizeTiersModal";
import { DailyDare } from "./DailyDare";
import { DareComposer } from "./DareComposer";
import { DareRoulette } from "./DareRoulette";
import { EscalationSlider } from "./EscalationSlider";
import { LivePulse } from "./LivePulse";
import { SquadStandings } from "./SquadStandings";
import { StatsBar } from "./StatsBar";

export function HomeApp() {
  const [level, setLevel] = useState<HeatLevel>(1);
  const [customizeOpen, setCustomizeOpen] = useState(false);
  const [squadOpen, setSquadOpen] = useState(false);
  const [rouletteText, setRouletteText] = useState<string | undefined>();
  const { juice, soundOn, toggleSound } = useJuice();
  const { reduceMotion, toggleReduceMotion } = useReduceMotion();
  const { stats, rank, popup, completeDaily } = useLocalStats();
  const { tiers, save, getTier } = useTiers();
  const { squad, addManual, edit, remove, upsert } = useSquad();

  const [todayKey, setTodayKey] = useState<string | null>(null);

  useEffect(() => {
    setTodayKey(new Date().toISOString().slice(0, 10));
  }, []);

  const lockedToday = todayKey != null && stats.lastDailyKey === todayKey;

  return (
    <>
      <main className="mx-auto flex w-full max-w-lg flex-col gap-4 px-4 pb-16 pt-5">
        <header className="flex items-start justify-between gap-3">
          <div>
            <p className="font-[family-name:var(--font-display)] text-[11px] font-black tracking-[0.28em] text-rose-400">
              NO PRESSURE
            </p>
            <h1 className="font-[family-name:var(--font-display)] text-4xl font-black leading-none tracking-tight">
              Bet you won&apos;t.
            </h1>
            <p className="mt-1 text-xs text-[#9aa3b8]">
              Not all dares are created equal. 24h self-destructing links.
            </p>
          </div>
          <div className="flex flex-col items-end gap-2">
            <LivePulse />
            <div className="flex gap-2">
              <button
                type="button"
                aria-label={soundOn ? "Mute sounds" : "Enable sounds"}
                className="pill-3d bg-white/10 px-3 py-1.5 text-xs"
                onClick={toggleSound}
              >
                {soundOn ? "🔊" : "🔇"}
              </button>
              <button
                type="button"
                aria-label={
                  reduceMotion ? "Enable motion effects" : "Reduce motion (epilepsy-safe)"
                }
                title={reduceMotion ? "Motion off" : "Reduce motion"}
                className={`pill-3d px-3 py-1.5 text-xs ${
                  reduceMotion
                    ? "bg-gradient-to-b from-emerald-400 to-emerald-700 text-white"
                    : "bg-white/10 text-white"
                }`}
                onClick={toggleReduceMotion}
              >
                {reduceMotion ? "FX·" : "FX"}
              </button>
              <button
                type="button"
                className="pill-3d bg-gradient-to-b from-amber-300 to-orange-600 px-3 py-1.5 text-xs text-black"
                onClick={() => setSquadOpen(true)}
              >
                🏆 Squad
              </button>
            </div>
          </div>
        </header>

        <StatsBar stats={stats} rank={rank} popup={popup} />

        <DailyDare
          lockedToday={lockedToday}
          onLockIn={(dare) => {
            completeDaily(dare.key);
            setLevel(dare.level);
            setRouletteText(dare.text);
            void juice("lock");
            upsert("You", { maxHeat: dare.level });
          }}
        />

        <EscalationSlider
          level={level}
          tiers={tiers}
          onChange={setLevel}
          onCustomize={() => setCustomizeOpen(true)}
          onTick={(l) => void juice("tick", l)}
        />

        <DareRoulette
          level={level}
          onLand={(text) => setRouletteText(text)}
          onTick={() => void juice("slot")}
          onPop={() => void juice("pop")}
        />

        <section className="space-y-2">
          <div className="flex items-end justify-between">
            <h2 className="font-[family-name:var(--font-display)] text-xl font-black">
              Compose Dare
            </h2>
            <p className="text-[10px] font-bold text-[#9aa3b8]">
              {getTier(level).name}
            </p>
          </div>
          <DareComposer
            level={level}
            tiers={tiers}
            initialText={rouletteText}
            juiceBoom={() => void juice("boom")}
            onCreated={() => {
              upsert("You", { maxHeat: level });
            }}
          />
        </section>

        <footer className="mt-4 border-t border-white/5 pt-4 text-center">
          <button
            type="button"
            className="text-[11px] text-[#9aa3b8] underline decoration-white/20 underline-offset-4 transition hover:text-white"
            onClick={openTermsModal}
          >
            Terms of Service & 18+ Assumption of Risk
          </button>
        </footer>
      </main>

      <CustomizeTiersModal
        open={customizeOpen}
        tiers={tiers}
        onClose={() => setCustomizeOpen(false)}
        onSave={save}
      />
      <SquadStandings
        open={squadOpen}
        onClose={() => setSquadOpen(false)}
        squad={squad}
        onAdd={addManual}
        onEdit={edit}
        onRemove={remove}
      />
    </>
  );
}
