import { containsBlockedTerms } from "@/lib/blocklist";
import type { DareMode, HeatLevel } from "@/lib/types";

export const FIELD_LIMITS = {
  dareText: 280,
  stake: 120,
  senderName: 32,
  targetName: 32,
  levelLabel: 40,
} as const;

export function trimCap(value: unknown, max: number): string {
  return String(value ?? "")
    .trim()
    .slice(0, max);
}

export function trimCapNullable(value: unknown, max: number): string | null {
  if (value == null || value === "") return null;
  const t = trimCap(value, max);
  return t || null;
}

export type CreatePayload =
  | {
      ok: true;
      sender_name: string;
      target_name: string | null;
      mode: DareMode;
      dare_text: string | null;
      media_data: string | null;
      level: HeatLevel;
      level_label: string;
      forfeit: string | null;
    }
  | { ok: false; status: number; error: string };

export function parseCreatePayload(body: Record<string, unknown>): CreatePayload {
  const sender_name = trimCap(body.sender_name, FIELD_LIMITS.senderName);
  const target_name = trimCapNullable(body.target_name, FIELD_LIMITS.targetName);
  const mode = String(body.mode || "") as DareMode;
  const dare_text = trimCapNullable(body.dare_text, FIELD_LIMITS.dareText);
  const media_data = body.media_data ? String(body.media_data) : null;
  const level = Number(body.level) as HeatLevel;
  const level_label = trimCap(
    body.level_label || `Level ${level}`,
    FIELD_LIMITS.levelLabel
  );
  // "stake" alias + forfeit
  const forfeit = trimCapNullable(
    body.stake ?? body.forfeit,
    FIELD_LIMITS.stake
  );

  if (!sender_name) {
    return { ok: false, status: 400, error: "Sender required" };
  }
  if (!["video", "photo", "voice", "text"].includes(mode)) {
    return { ok: false, status: 400, error: "Invalid mode" };
  }
  if (![1, 2, 3, 4, 5].includes(level)) {
    return { ok: false, status: 400, error: "Invalid level" };
  }
  if (dare_text && containsBlockedTerms(dare_text)) {
    return { ok: false, status: 400, error: "Blocked content" };
  }
  if (forfeit && containsBlockedTerms(forfeit)) {
    return { ok: false, status: 400, error: "Blocked content" };
  }
  if (mode === "text" && !dare_text) {
    return { ok: false, status: 400, error: "Dare text required" };
  }
  if (mode !== "text" && !media_data) {
    return { ok: false, status: 400, error: "Media required" };
  }

  return {
    ok: true,
    sender_name,
    target_name,
    mode,
    dare_text,
    media_data,
    level,
    level_label,
    forfeit,
  };
}
