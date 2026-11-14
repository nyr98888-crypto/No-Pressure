const BLOCKED = [
  "kill myself",
  "kill yourself",
  "kys",
  "suicide",
  "self-harm",
  "self harm",
  "cut myself",
  "hang myself",
  "overdose",
  "murder",
  "shoot",
  "stab",
  "rape",
  "assault",
  "bomb",
  "terrorist",
];

export function containsBlockedTerms(text: string): boolean {
  const normalized = text.toLowerCase().replace(/\s+/g, " ").trim();
  return BLOCKED.some((term) => normalized.includes(term));
}
