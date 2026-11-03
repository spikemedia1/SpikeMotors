"use client";

import { motion } from "motion/react";
import type { Car } from "@/data/cars";
import { formatInt } from "@/lib/format";
import { useReducedMotion } from "@/lib/hooks";

/** Modo Blueprint: cotas técnicas de 1px (comprimento, entre-eixos, altura) desenhadas sobre o carro. */
export function Blueprint({ car, show }: { car: Car; show: boolean }) {
  const reduced = useReducedMotion();
  const t = (delay: number) => ({ duration: reduced ? 0 : 0.9, ease: [0.65, 0, 0.35, 1] as const, delay: reduced ? 0 : delay });
  const line = (d: string, delay: number) => (
    <motion.path
      d={d}
      fill="none"
      stroke="var(--steel)"
      strokeWidth={1}
      vectorEffect="non-scaling-stroke"
      initial={false}
      animate={{ pathLength: show ? 1 : 0, opacity: show ? 1 : 0 }}
      transition={t(delay)}
    />
  );
  const label = (x: number, y: number, text: string, delay: number, anchor: "start" | "middle" | "end" = "middle") => (
    <motion.span
      key={text}
      className="absolute font-mono text-[10px] tracking-[0.16em] whitespace-nowrap text-steel"
      style={{
        left: `${x / 10}%`,
        top: `${(y / 560) * 100}%`,
        translate: anchor === "middle" ? "-50% -50%" : anchor === "end" ? "-100% -50%" : "0 -50%",
      }}
      initial={false}
      animate={{ opacity: show ? 1 : 0 }}
      transition={t(delay + 0.4)}
    >
      {text}
    </motion.span>
  );
  const mm = (v?: number) => (v ? `${formatInt(v)} MM` : "N/D");

  return (
    <>
    <svg
      aria-hidden
      viewBox="0 0 1000 560"
      preserveAspectRatio="none"
      className="pointer-events-none absolute inset-0 h-full w-full overflow-visible"
    >
      {/* comprimento */}
      {line("M 90 500 L 910 500 M 90 488 L 90 512 M 910 488 L 910 512", 0)}
      {/* entre-eixos */}
      {line("M 250 462 L 750 462 M 250 452 L 250 472 M 750 452 L 750 472", 0.15)}
      {/* altura */}
      {line("M 950 150 L 950 470 M 938 150 L 962 150 M 938 470 L 962 470", 0.3)}
      {/* linhas de construção */}
      {line("M 90 470 L 90 300 M 910 470 L 910 300", 0.45)}
      {line("M 60 470 L 960 470", 0.5)}
    </svg>
    <div aria-hidden className="pointer-events-none absolute inset-0">
      {label(500, 532, `COMPRIMENTO ${mm(car.lengthMm)}`, 0)}
      {label(500, 440, `ENTRE-EIXOS ${mm(car.wheelbaseMm)}`, 0.15)}
      {label(940, 128, `ALTURA ${mm(car.heightMm)}`, 0.3, "end")}
    </div>
    </>
  );
}
