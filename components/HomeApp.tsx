"use client";

import { useEffect, useState } from "react";
import {
  Dices,
  Flame,
  ShieldCheck,
  Sparkles,
  Trophy,
  Volume2,
  VolumeX,
} from "lucide-react";
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
import { iconSm, iconXs } from "./icons";
import { LivePulse } from "./LivePulse";
import { usePaywall } from "./PaywallProvider";
import { SlideDrawer } from "./SlideDrawer";
import { SquadStandings } from "./SquadStandings";
import { StatsBar } from "./StatsBar";
import { VipPassBadge } from "./VipPassBadge";

export function HomeApp() {
  const [level, setLevel] = useState<HeatLevel>(1);
  const [customizeOpen, setCustomizeOpen] = useState(false);
  const [squadOpen, setSquadOpen] = useState(false);
  const [dailyOpen, setDailyOpen] = useState(false);
  const [sparkOpen, setSparkOpen] = useState(false);
  const [rouletteText, setRouletteText] = useState<string | undefined>();
  const { juice, soundOn, toggleSound } = useJuice();
  const { reduceMotion, toggleReduceMotion } = useReduceMotion();
  const { stats, rank, popup, completeDaily } = useLocalStats();
  const { tiers, save, getTier } = useTiers();
  const { squad, addManual, edit, remove, upsert } = useSquad();
  const paywall = usePaywall();

  // Client-only "today" — never call new Date() during server/static prerender
  const [todayKey, setTodayKey] = useState<string>("");
  useEffect(() => {
    setTodayKey(new Date().toISOString().slice(0, 10));
  }, []);
  const lockedToday = todayKey !== "" && stats.lastDailyKey === todayKey;
  const hasSpark = Boolean(rouletteText?.trim());

  const setLevelGuarded = (next: HeatLevel) => {
    if (!paywall.requireAccess({ level: next })) return;
    setLevel(next);
  };

  return (
    <>
      <div className={`heat-stage heat-stage-${level} min-h-full`}>
        <main className="mx-auto flex w-full max-w-lg flex-col gap-3 px-4 pb-16 pt-4">
          <header className="flex items-start justify-between gap-3">
            <div>
              <p className="font-[family-name:var(--font-display)] text-[11px] font-black tracking-[0.28em] text-rose-400/90">
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
              {paywall.isUnlocked && paywall.vipCode ? (
                <VipPassBadge vipCode={paywall.vipCode} />
              ) : null}
              <div className="flex gap-2">
                <button
                  type="button"
                  aria-label={soundOn ? "Mute sounds" : "Enable sounds"}
                  className="pill-3d bg-white/10 px-3 py-1.5 text-xs"
                  onClick={toggleSound}
                >
                  {soundOn ? <Volume2 {...iconSm} /> : <VolumeX {...iconSm} />}
                </button>
                <button
                  type="button"
                  aria-label={
                    reduceMotion
                      ? "Enable motion effects"
                      : "Reduce motion (epilepsy-safe)"
                  }
                  title={reduceMotion ? "Motion off" : "Reduce motion"}
                  className={`pill-3d px-3 py-1.5 text-xs ${
                    reduceMotion
                      ? "bg-gradient-to-b from-emerald-400 to-emerald-700 text-white"
                      : "bg-white/10 text-white"
                  }`}
                  onClick={toggleReduceMotion}
                >
                  {reduceMotion ? (
                    <ShieldCheck {...iconSm} />
                  ) : (
                    <Sparkles {...iconSm} />
                  )}
                </button>
              </div>
            </div>
          </header>

          <StatsBar stats={stats} rank={rank} popup={popup} />

          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              className="pill-3d inline-flex items-center gap-1.5 bg-white/[0.08] px-3.5 py-2 text-xs text-white"
              onClick={() => setDailyOpen(true)}
            >
              <Flame {...iconXs} /> Daily Dare
            </button>
            <button
              type="button"
              className="pill-3d relative inline-flex items-center gap-1.5 bg-white/[0.08] px-3.5 py-2 text-xs text-white"
              onClick={() => setSparkOpen(true)}
            >
              <Dices {...iconXs} /> Dare Slots
              {hasSpark && (
                <span className="absolute -right-1 -top-1 h-2.5 w-2.5 rounded-full bg-amber-400 shadow-[0_0_10px_rgba(251,191,36,0.8)]" />
              )}
            </button>
            <button
              type="button"
              className="pill-3d inline-flex items-center gap-1.5 bg-white/[0.08] px-3.5 py-2 text-xs text-white"
              onClick={() => setSquadOpen(true)}
            >
              <Trophy {...iconXs} /> Drop
            </button>
          </div>

          <section className="hero-stage space-y-3">
            <EscalationSlider
              level={level}
              tiers={tiers}
              onChange={setLevelGuarded}
              onCustomize={() => setCustomizeOpen(true)}
              onTick={(l) => void juice("tick", l)}
            />

            <div className="flex items-end justify-between px-0.5">
              <h2 className="font-[family-name:var(--font-display)] text-xl font-black tracking-tight">
                Compose Dare
              </h2>
              <p className="text-[10px] font-bold tabular-nums tracking-wide text-[#9aa3b8]">
                {getTier(level).name}
              </p>
            </div>

            <DareComposer
              level={level}
              tiers={tiers}
              initialText={rouletteText}
              juiceBoom={() => void juice("boom")}
              onBeforeSend={() => paywall.requireAccess({ level, forCreate: true })}
              onPaywallRequired={() => paywall.openPaywall()}
              onCreated={() => {
                upsert("You", { maxHeat: level });
                void paywall.refresh();
              }}
            />
          </section>

          <footer className="mt-2 border-t border-white/10 pt-4 text-center">
            <button
              type="button"
              className="text-[11px] text-[#9aa3b8] underline decoration-white/20 underline-offset-4 transition hover:text-white"
              onClick={openTermsModal}
            >
              Terms of Service & 18+ Assumption of Risk
            </button>
          </footer>
        </main>
      </div>

      <SlideDrawer
        open={dailyOpen}
        title="Daily Dare"
        titleIcon={<Flame {...iconSm} />}
        onClose={() => setDailyOpen(false)}
      >
        <DailyDare
          lockedToday={lockedToday}
          onLockIn={(dare) => {
            if (!paywall.requireAccess({ level: dare.level })) return;
            completeDaily(dare.key);
            setLevel(dare.level);
            setRouletteText(dare.text);
            void juice("lock");
            upsert("You", { maxHeat: dare.level });
            setDailyOpen(false);
          }}
        />
      </SlideDrawer>

      <SlideDrawer
        open={sparkOpen}
        title="Dare Slots"
        titleIcon={<Dices {...iconSm} />}
        onClose={() => setSparkOpen(false)}
      >
        <DareRoulette
          level={level}
          onLand={(text) => {
            setRouletteText(text);
            setSparkOpen(false);
          }}
          onTick={() => void juice("slot")}
          onPop={() => void juice("pop")}
        />
      </SlideDrawer>

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
