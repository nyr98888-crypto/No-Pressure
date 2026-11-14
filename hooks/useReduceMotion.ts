"use client";

import { useCallback, useEffect, useState } from "react";
import { LS } from "@/lib/storageKeys";

function applyClass(on: boolean) {
  const root = document.documentElement;
  root.classList.toggle("reduce-motion", on);
  // Explicit opt-in to motion overrides prefers-reduced-motion CSS
  root.classList.toggle(
    "reduce-motion-off",
    !on && localStorage.getItem(LS.reduceMotion) === "0"
  );
}

export function useReduceMotion() {
  const [reduceMotion, setReduceMotion] = useState(false);

  useEffect(() => {
    const saved = localStorage.getItem(LS.reduceMotion);
    const prefers = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const on = saved != null ? saved === "1" : prefers;
    setReduceMotion(on);
    applyClass(on);

    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    const onChange = () => {
      if (localStorage.getItem(LS.reduceMotion) == null) {
        setReduceMotion(mq.matches);
        applyClass(mq.matches);
      }
    };
    mq.addEventListener("change", onChange);
    return () => mq.removeEventListener("change", onChange);
  }, []);

  const toggleReduceMotion = useCallback(() => {
    setReduceMotion((prev) => {
      const next = !prev;
      localStorage.setItem(LS.reduceMotion, next ? "1" : "0");
      applyClass(next);
      return next;
    });
  }, []);

  return { reduceMotion, toggleReduceMotion };
}
