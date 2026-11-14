export function streetCredRank(certified: number): {
  badge: string;
  label: string;
} {
  if (certified >= 25) return { badge: "👑", label: "CERTIFIED LEGEND" };
  if (certified >= 10) return { badge: "🔥", label: "MENACE" };
  if (certified >= 3) return { badge: "⚡", label: "NO FEAR" };
  return { badge: "🧊", label: "ROOKIE" };
}
