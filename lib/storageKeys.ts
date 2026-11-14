export const LS = {
  ageGate: "np_age_gate_v1",
  stats: "np_stats_v1",
  tiers: "np_tiers_v1",
  squad: "np_squad_v1",
  sound: "np_sound_on_v1",
  nickname: "np_nickname_v1",
  reduceMotion: "np_reduce_motion_v1",
} as const;

/** Local-only secret for NO CAP / CALL CAP — never rendered in UI. */
export function creatorTokenKey(dareId: string) {
  return `np_creator_token_${dareId}`;
}

export const OPEN_TERMS_EVENT = "np:open-terms";
