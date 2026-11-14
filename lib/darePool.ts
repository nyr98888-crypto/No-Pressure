import type { HeatLevel } from "./types";

/** Safe, public-friendly Scenario Sparks — users invent their own harmless dare around the scene. */
export const DARES_BY_LEVEL: Record<HeatLevel, string[]> = {
  1: [
    "Scenario Spark: Ordering at a coffee shop counter",
    "Scenario Spark: Waiting for the microwave to beep",
    "Scenario Spark: Picking a movie on the couch",
    "Scenario Spark: Sending a 10s voice note to the group chat",
    "Scenario Spark: Taking a mirror selfie with a silly filter",
    "Scenario Spark: Introducing yourself to a houseplant",
    "Scenario Spark: Reading a cereal box like a news anchor",
  ],
  2: [
    "Scenario Spark: Riding an elevator with strangers",
    "Scenario Spark: Walking into a room like the main character",
    "Scenario Spark: Ordering food with a fancy accent",
    "Scenario Spark: Leaving a voicemail in character",
    "Scenario Spark: Complimenting a friend’s outfit like a sitcom",
    "Scenario Spark: Acting like a sports commentator in your kitchen",
    "Scenario Spark: Explaining your snack choice at a press conference",
  ],
  3: [
    "Scenario Spark: Asking for the Wi‑Fi password like a heist movie",
    "Scenario Spark: Narrating your grocery run as a nature documentary",
    "Scenario Spark: Doing a 15s weather report from your balcony",
    "Scenario Spark: Hosting a tiny award show for your pet or plant",
    "Scenario Spark: Teaching an imaginary cooking class for 20s",
    "Scenario Spark: Giving a museum tour of your living room",
    "Scenario Spark: Starting a polite slow clap in a hallway (max 10s)",
  ],
  4: [
    "Scenario Spark: Doing a dramatic runway walk down a hallway",
    "Scenario Spark: Pitching a fake startup idea to the squad",
    "Scenario Spark: Reenacting a movie trailer for your day so far",
    "Scenario Spark: Asking for directions to a place you’re already at",
    "Scenario Spark: Holding a mock job interview with a friend",
    "Scenario Spark: Performing a 20s freestyle about today’s lunch",
    "Scenario Spark: Opening a pretend podcast episode about nothing",
  ],
  5: [
    "Scenario Spark: Hosting a 20s press conference about a snack",
    "Scenario Spark: Crowning yourself squad legend (and defending it)",
    "Scenario Spark: Making a 15s trailer where you’re the final boss",
    "Scenario Spark: Debating a mid hot take with full seriousness",
    "Scenario Spark: Directing a one-take comedy scene in your kitchen",
    "Scenario Spark: Running a mock talent show round for the squad",
    "Scenario Spark: Closing the night with an Oscar speech about friendship",
  ],
};

export const ROULETTE_POOL: { level: HeatLevel; text: string }[] = (
  Object.entries(DARES_BY_LEVEL) as [string, string[]][]
).flatMap(([level, texts]) =>
  texts.map((text) => ({ level: Number(level) as HeatLevel, text }))
);

export function rouletteDares(level: HeatLevel) {
  return ROULETTE_POOL.filter((d) => d.level === level);
}

export function dailyDareForDate(date = new Date()): {
  key: string;
  text: string;
  level: HeatLevel;
} {
  const key = date.toISOString().slice(0, 10);
  const dayIndex =
    Math.floor(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()) / 86400000) %
    ROULETTE_POOL.length;
  const pick = ROULETTE_POOL[dayIndex] ?? ROULETTE_POOL[0];
  return { key, text: pick.text, level: pick.level };
}

export function msUntilMidnight(date = new Date()): number {
  const next = new Date(date);
  next.setHours(24, 0, 0, 0);
  return next.getTime() - date.getTime();
}
