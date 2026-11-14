export type RankId = "rookie" | "nofear" | "menace" | "legend";

export function streetCredRank(certified: number): {
  id: RankId;
  label: string;
} {
  if (certified >= 25) return { id: "legend", label: "CERTIFIED LEGEND" };
  if (certified >= 10) return { id: "menace", label: "MENACE" };
  if (certified >= 3) return { id: "nofear", label: "NO FEAR" };
  return { id: "rookie", label: "ROOKIE" };
}
