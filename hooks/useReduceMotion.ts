"use client";

import { useCallback, useEffect, useState } from "react";
import { readLocalString } from "@/lib/readLocal";
import { LS } from "@/lib/storageKeys";

function applyClass(on: boolean) {
  const root = document.documentElement;
  root.classList.toggle("reduce-motion", on);
  root.classList.toggle(
    "reduce-motion-off",
    !on && localStorage.getItem(LS.reduceMotion) === "0"
  );
}

function initialReduceMotion(): boolean {
  if (typeof window === "undefined") return false;
  const saved = readLocalString(LS.reduceMotion);
  const prefers = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  return saved != null ? saved === "1" : prefers;
}

export function useReduceMotion() {
  const [reduceMotion, setReduceMotion] = useState(initialReduceMotion);

  useEffect(() => {
    applyClass(reduceMotion);
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    const onChange = () => {
      if (localStorage.getItem(LS.reduceMotion) == null) {
        setReduceMotion(mq.matches);
        applyClass(mq.matches);
      }
    };
    mq.addEventListener("change", onChange);
    return () => mq.removeEventListener("change", onChange);
  }, [reduceMotion]);

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
