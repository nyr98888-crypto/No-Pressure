export const SLOT_REELS = {
  SETTING: [
    "At a Bar / Lounge",
    "House Party",
    "The Group Chat",
    "Coffee / Dinner Date",
    "Uber / Car Ride",
    "Gym Floor",
    "Rooftop / Patio",
    "Late-Night Kitchen",
    "Checkout Line",
    "Your IG Story",
  ],
  ENERGY: [
    "Deadpan Serious",
    "Unbothered CEO",
    "Overly Formal",
    "Brutally Honest",
    "Smooth Talker",
    "Reality TV Villain",
    "Suspiciously Calm",
    "Confident Wingman",
    "Main Character",
    "Zero Filter",
  ],
  TWIST: [
    "10s Voice Note",
    "Keep a Straight Face",
    "In One Breath",
    "Zero Context Given",
    "Unbroken Eye Contact",
    "First Take Only",
    "Under 10 Words",
    "Send & Lock Phone",
    "No Explaining Afterward",
    "Double Down If Asked",
  ],
  FOCUS: [
    "Your Drink",
    "Camera Roll Last Pic",
    "The Group Chat",
    "The Bartender / Barista",
    "Your Dating Profile",
    "A Random Contact",
    "The Aux / Playlist",
    "Your Screen Time",
    "An Unpopular Opinion",
    "A Bold Confession",
  ],
} as const;

export type SlotReelKey = keyof typeof SLOT_REELS;

export const SLOT_REEL_KEYS: SlotReelKey[] = [
  "SETTING",
  "ENERGY",
  "TWIST",
  "FOCUS",
];

export const SLOT_STOP_MS = [400, 650, 900, 1150] as const;

export function pickReelValue(key: SlotReelKey): string {
  const pool = SLOT_REELS[key];
  return pool[Math.floor(Math.random() * pool.length)]!;
}

export function formatSpark(values: Record<SlotReelKey, string>): string {
  return `${values.SETTING} · ${values.ENERGY} · ${values.TWIST} · ${values.FOCUS}`;
}
