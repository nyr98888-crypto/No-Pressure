import type { HeatLevel } from "./types";

export const DARES_BY_LEVEL: Record<HeatLevel, string[]> = {
  1: [
    "Do your best impression of the person who sent this.",
    "Say the alphabet backwards on camera — no cuts.",
    "Show your most embarrassing camera roll photo (safe for work).",
    "Talk in a cartoon voice for your next 3 messages.",
    "Take a mirror selfie with your silliest face.",
    "Tell a joke so bad the squad groans.",
  ],
  2: [
    "Walk into the next room and declare you are the main character.",
    "Send a dramatic Oscar-acceptance speech about nothing.",
    "Order something with a fake fancy accent.",
    "Wear your clothes inside-out for the next hour.",
    "Text your last contact a random emoji rant (then explain).",
    "Do 10 dramatic push-ups and narrate them like a sports announcer.",
  ],
  3: [
    "Ask a stranger (politely) to rate your outfit 1–10 on camera.",
    "Sing a chorus in public volume — commit.",
    "Post a story calling yourself the squad villain for 24h.",
    "Eat a weird food combo of the sender's choosing.",
    "Do a TikTok dance badly and own it.",
    "Call someone and speak only in movie quotes for 30 seconds.",
  ],
  4: [
    "Wear something ridiculous outside and take a walking video.",
    "Introduce yourself to someone new with a fake legendary backstory.",
    "Perform a 20-second freestyle rap about the sender.",
    "Sit on the floor in a public place and stretch like it's yoga class.",
    "Record yourself asking for the Wi-Fi like you're in a heist movie.",
    "Do your most unhinged hype-man entrance into a room.",
  ],
  5: [
    "Full send: whatever the squad majority picks in the next 60 seconds.",
    "Make a 15-second trailer where you are the final boss.",
    "Confess your most mid hot take on camera — stand on business.",
    "Challenge the next person you see to a silly 1-round contest.",
    "Film a fake apology video for a crime you definitely did not commit.",
    "Go Full Inferno: redo Levels 1–3 in one continuous take.",
  ],
};

export const ROULETTE_POOL: { level: HeatLevel; text: string }[] = (
  Object.entries(DARES_BY_LEVEL) as [string, string[]][]
).flatMap(([level, texts]) =>
  texts.map((text) => ({ level: Number(level) as HeatLevel, text }))
);

// Extra spice so roulette feels packed (30+)
export const EXTRA_ROULETTE = [
  { level: 1 as HeatLevel, text: "Balance a spoon on your nose for 10 seconds." },
  { level: 1 as HeatLevel, text: "Say 'no pressure' in 5 different accents." },
  { level: 2 as HeatLevel, text: "Compliment the next person you see like a sitcom character." },
  { level: 2 as HeatLevel, text: "Reenact your last awkward moment in mime." },
  { level: 3 as HeatLevel, text: "Start a slow clap alone until someone joins (max 20s)." },
  { level: 3 as HeatLevel, text: "Narrate your life like a nature documentary for 30s." },
  { level: 4 as HeatLevel, text: "Ask for directions to a place you already are." },
  { level: 4 as HeatLevel, text: "Do a dramatic runway walk across a hallway." },
  { level: 5 as HeatLevel, text: "Host a 20-second press conference about your snack choice." },
  { level: 5 as HeatLevel, text: "Crown yourself squad legend and defend the title out loud." },
];

export function rouletteDares(level: HeatLevel) {
  return [...ROULETTE_POOL, ...EXTRA_ROULETTE].filter((d) => d.level === level);
}

export function dailyDareForDate(date = new Date()): {
  key: string;
  text: string;
  level: HeatLevel;
} {
  const key = date.toISOString().slice(0, 10);
  const dayIndex =
    Math.floor(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()) / 86400000) %
    (ROULETTE_POOL.length + EXTRA_ROULETTE.length);
  const pool = [...ROULETTE_POOL, ...EXTRA_ROULETTE];
  const pick = pool[dayIndex] ?? pool[0];
  return { key, text: pick.text, level: pick.level };
}

export function msUntilMidnight(date = new Date()): number {
  const next = new Date(date);
  next.setHours(24, 0, 0, 0);
  return next.getTime() - date.getTime();
}
