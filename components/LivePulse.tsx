"use client";

import { useEffect, useState } from "react";

export function LivePulse() {
  const [count, setCount] = useState<number | null>(null);

  useEffect(() => {
    let alive = true;
    const load = async () => {
      try {
        const res = await fetch("/api/dares?live=1");
        if (!res.ok) return;
        const data = (await res.json()) as { count: number };
        if (alive) setCount(data.count);
      } catch {
        /* ignore */
      }
    };
    void load();
    const id = window.setInterval(load, 30_000);
    return () => {
      alive = false;
      clearInterval(id);
    };
  }, []);

  if (count == null) return null;

  return (
    <span className="pill-3d bg-gradient-to-b from-orange-500 to-rose-700 px-3 py-1.5 text-[11px] text-white">
      🔥 {count} Dares Live
    </span>
  );
}
