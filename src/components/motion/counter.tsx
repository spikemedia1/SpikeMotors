"use client";

import { animate, useMotionValue, useMotionValueEvent } from "motion/react";
import { useEffect, useState } from "react";
import { formatDec, formatInt } from "@/lib/format";
import { useReducedMotion } from "@/lib/hooks";

/** Contador de spec: interpola do valor anterior para o novo (tabular-nums). */
export function Counter({
  value,
  decimals = 0,
  className,
  duration = 0.9,
}: {
  value: number;
  decimals?: number;
  className?: string;
  duration?: number;
}) {
  const reduced = useReducedMotion();
  const mv = useMotionValue(value);
  const fmt = (v: number) => (decimals ? formatDec(v, decimals) : formatInt(Math.round(v)));
  const [text, setText] = useState(() => fmt(value));
  useMotionValueEvent(mv, "change", (v) => setText(fmt(v)));

  useEffect(() => {
    if (reduced) {
      mv.set(value);
      return;
    }
    const c = animate(mv, value, { duration, ease: [0.22, 1, 0.36, 1] });
    return () => c.stop();
  }, [value, reduced, mv, duration]);

  return <span className={className}>{text}</span>;
}
