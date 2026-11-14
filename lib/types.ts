export type DareMode = "video" | "photo" | "voice" | "text";
export type DareStatus =
  | "open"
  | "locked"
  | "proved"
  | "certified"
  | "capped"
  | "wiped";

export type HeatLevel = 1 | 2 | 3 | 4 | 5;

export interface TierConfig {
  level: HeatLevel;
  name: string;
  forfeit: string;
}

export interface DareRecord {
  id: string;
  sender_name: string;
  target_name: string | null;
  mode: DareMode;
  dare_text: string | null;
  media_data: string | null;
  proof_mode: DareMode | null;
  proof_data: string | null;
  level: HeatLevel;
  level_label: string;
  forfeit: string | null;
  passes: number;
  status: DareStatus;
  created_at: number;
  expires_at: number;
}

export interface LocalStats {
  lockedIn: number;
  cooked: number;
  certified: number;
  streak: number;
  lastDailyKey: string | null;
}

export interface SquadMember {
  id: string;
  nickname: string;
  certified: number;
  maxHeat: HeatLevel;
  capsCalled: number;
}

export const DEFAULT_TIERS: TierConfig[] = [
  { level: 1, name: "Warm Up", forfeit: "Post an embarrassing selfie" },
  { level: 2, name: "Bold Move", forfeit: "Send a cringe voice note to the group" },
  { level: 3, name: "Biohazard", forfeit: "Dance in public for 15 seconds" },
  { level: 4, name: "Danger Zone", forfeit: "Wear something ridiculous all day" },
  { level: 5, name: "Full Inferno", forfeit: "Whatever the squad decides — no negotiation" },
];

export const STATUS_STAMPS = {
  open: "BET YOU WON'T 👀",
  locked: "LOCKED IN ⚡",
  chickened: "CHICKENED OUT — +1 HEAT 🐔🔥",
  cooked: "COOKED — PROVED IT ✓",
  certified: "NO CAP — CERTIFIED 👑",
  capped: "ALL CAP — WEAK PROOF 🧢",
} as const;

export const HEAT_COLORS: Record<HeatLevel, string> = {
  1: "#00E676",
  2: "#00B0FF",
  3: "#FFD600",
  4: "#FF6D00",
  5: "#FF1744",
};
