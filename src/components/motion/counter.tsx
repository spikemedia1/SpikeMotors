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
  countUpWhen,
}: {
  value: number;
  /** Se definido: conta de 0 até value cada vez que vira true (o HTML do servidor já traz o valor final). */
  countUpWhen?: boolean;
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
    if (countUpWhen === undefined || !countUpWhen || reduced) return;
    mv.set(0);
    const c = animate(mv, value, { duration, ease: [0.22, 1, 0.36, 1] });
    return () => c.stop();
  }, [countUpWhen, value, reduced, mv, duration]);

  useEffect(() => {
    if (countUpWhen !== undefined) return;
    if (reduced) {
      mv.set(value);
      return;
    }
    const c = animate(mv, value, { duration, ease: [0.22, 1, 0.36, 1] });
    return () => c.stop();
  }, [value, reduced, mv, duration, countUpWhen]);

  return <span className={className}>{text}</span>;
}
