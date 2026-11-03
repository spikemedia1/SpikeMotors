"use client";

import { motion, useSpring, useTransform, type MotionValue } from "motion/react";
import { useEffect, useState } from "react";
import { arcPath, polar } from "@/lib/geom";
import { useReducedMotion } from "@/lib/hooks";

const START = 135; // arco de 270°
const SWEEP = 270;
const C = 120;
const R = 104;

/**
 * Instrumento SVG (conta-giros / velocímetro): arco de 270°, marcações, ponteiro com
 * spring (stiffness 120, damping 14) e faixa vermelha acima de `redFrom` do máximo.
 */
export function Gauge({
  value,
  max,
  majorStep,
  labelEvery = 1,
  labelScale = 1,
  color,
  redFrom,
  limit,
  title,
  unit,
  readout,
}: {
  value: MotionValue<number>;
  max: number;
  majorStep: number;
  labelEvery?: number;
  /** Divide o rótulo (ex.: 1000 para rpm ×1000). */
  labelScale?: number;
  color: string;
  redFrom?: number;
  /** Marcador do limite de giro do modo (fração do máximo). */
  limit?: number;
  title: string;
  unit: string;
  readout: (v: number) => string;
}) {
  const reduced = useReducedMotion();
  const spring = useSpring(value, reduced ? { stiffness: 1000, damping: 100 } : { stiffness: 120, damping: 14 });
  const angle = useTransform(spring, (v) => START + (Math.max(0, Math.min(v, max * 1.02)) / max) * SWEEP);
  const progress = useTransform(spring, (v) => Math.max(0.001, Math.min(1, v / max)));
  const [text, setText] = useState(readout(0));

  useEffect(() => spring.on("change", (v) => setText(readout(v))), [spring, readout]);

  const steps = Math.round(max / majorStep);
  const ticks = Array.from({ length: steps + 1 }, (_, i) => i);
  const minor = Array.from({ length: steps * 2 + 1 }, (_, i) => i);

  return (
    <figure className="relative mx-auto aspect-square w-full max-w-[300px]" aria-label={title}>
      <svg viewBox="0 0 240 240" className="h-full w-full overflow-visible" aria-hidden>
        <path d={arcPath(C, C, R, START, START + SWEEP)} fill="none" stroke="var(--line-strong)" strokeWidth={1} />
        {redFrom ? (
          <path
            d={arcPath(C, C, R, START + SWEEP * redFrom, START + SWEEP)}
            fill="none"
            stroke="var(--redline)"
            strokeWidth={3}
          />
        ) : null}
        <motion.path
          d={arcPath(C, C, R - 6, START, START + SWEEP)}
          fill="none"
          stroke={color}
          strokeWidth={2}
          style={{ pathLength: progress }}
          transition={{ duration: 0.3 }}
        />
        {minor.map((i) => {
          const a = START + (i / (steps * 2)) * SWEEP;
          const [x0, y0] = polar(C, C, R - (i % 2 ? 4 : 9), a);
          const [x1, y1] = polar(C, C, R, a);
          return <line key={`m${i}`} x1={x0} y1={y0} x2={x1} y2={y1} stroke="rgba(243,239,230,0.4)" strokeWidth={1} />;
        })}
        {ticks
          .filter((i) => i % labelEvery === 0)
          .map((i) => {
            const a = START + (i / steps) * SWEEP;
            const [tx, ty] = polar(C, C, R - 22, a);
            return (
              <text
                key={`t${i}`}
                x={tx}
                y={ty}
                fill="rgba(243,239,230,0.62)"
                fontSize={10}
                textAnchor="middle"
                dominantBaseline="middle"
                style={{ fontFamily: "var(--font-mono)" }}
              >
                {(i * majorStep) / labelScale}
              </text>
            );
          })}
        {limit ? (
          (() => {
            const a = START + limit * SWEEP;
            const [x0, y0] = polar(C, C, R + 3, a);
            const [x1, y1] = polar(C, C, R + 12, a);
            return <line x1={x0} y1={y0} x2={x1} y2={y1} stroke={color} strokeWidth={2} />;
          })()
        ) : null}
        <motion.g style={{ rotate: angle, transformOrigin: "120px 120px", transformBox: "view-box" }}>
          <line x1={C - 12} y1={C} x2={C + R - 14} y2={C} stroke="var(--text)" strokeWidth={1.6} />
        </motion.g>
        <circle cx={C} cy={C} r={4} fill="var(--bg)" stroke={color} strokeWidth={1.5} />
      </svg>
      <figcaption className="absolute inset-x-0 bottom-[12%] flex flex-col items-center">
        <span className="t-num text-[clamp(18px,2.3vw,32px)] leading-none text-text">{text}</span>
        <span className="t-mono mt-1 text-[9px] text-text-muted">
          {unit}
          <span className="hidden sm:inline"> · {title}</span>
        </span>
      </figcaption>
    </figure>
  );
}
