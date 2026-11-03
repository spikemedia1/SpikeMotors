"use client";

import { animate, motion, useMotionValue, useMotionValueEvent, useTransform } from "motion/react";
import { useCallback, useEffect, useRef, useState } from "react";
import { Logo } from "@/components/brand/logo";
import { ignitionCopy } from "@/data/content";
import { arcPath as arcAt, polar as polarAt } from "@/lib/geom";

const HOLD_MS = 1200;
const MAX_RPM = 8000;
const IDLE_RPM = 900;
const R_TACH = 150;
const ARC_START = 150; // graus (0 = leste, sentido horário)
const ARC_SWEEP = 240;

const polar = (r: number, deg: number) => polarAt(180, 180, r, deg);
const arcPath = (r: number, from: number, to: number) => arcAt(180, 180, r, from, to);

/** Sala 00 · Ignição: segurar para ligar, sweep do conta-giros, tremor e saída pelo obturador. */
export function Ignition({ onComplete, onSkip }: { onComplete: () => void; onSkip: () => void }) {
  const progress = useMotionValue(0);
  const rpm = useMotionValue(0);
  const [holding, setHolding] = useState(false);
  const [started, setStarted] = useState(false);
  const [shake, setShake] = useState(false);
  const raf = useRef(0);
  const holdStart = useRef(0);
  const doneRef = useRef(false);

  const ringOffset = useTransform(progress, (p) => 1 - p);
  const needleAngle = useTransform(rpm, (v) => ARC_START + (Math.min(v, MAX_RPM) / MAX_RPM) * ARC_SWEEP);
  const rpmLabel = useTransform(rpm, (v) => Math.round(v / 10) * 10);
  const [rpmText, setRpmText] = useState("0");
  useMotionValueEvent(rpmLabel, "change", (v) => setRpmText(v.toLocaleString("pt-BR")));

  const ignite = useCallback(() => {
    if (doneRef.current) return;
    doneRef.current = true;
    setHolding(false);
    setStarted(true);
    setShake(true);
    window.setTimeout(() => setShake(false), 120);
    // Sweep de partida: ponteiro ao máximo e de volta a 900 rpm. Cronometrado por timers.
    animate(rpm, MAX_RPM * 0.96, { duration: 0.42, ease: [0.3, 0, 0.2, 1] });
    window.setTimeout(() => animate(rpm, IDLE_RPM, { type: "spring", stiffness: 70, damping: 11 }), 440);
    window.setTimeout(onComplete, 1250);
  }, [onComplete, rpm]);

  const holdingRef = useRef(false);
  const completeTimer = useRef(0);

  const startHold = useCallback(() => {
    if (doneRef.current || holdingRef.current) return;
    holdingRef.current = true;
    setHolding(true);
    progress.stop();
    rpm.stop();
    holdStart.current = performance.now() - progress.get() * HOLD_MS;
    // Visual por rAF; a conclusão é por timer (não depende da taxa de quadros).
    const loop = () => {
      const p = Math.min(1, (performance.now() - holdStart.current) / HOLD_MS);
      progress.set(p);
      rpm.set(p * 2200);
      if (p < 1 && holdingRef.current) raf.current = requestAnimationFrame(loop);
    };
    raf.current = requestAnimationFrame(loop);
    completeTimer.current = window.setTimeout(() => {
      holdingRef.current = false;
      progress.set(1);
      void ignite();
    }, HOLD_MS * (1 - progress.get()));
  }, [progress, rpm, ignite]);

  const endHold = useCallback(() => {
    if (doneRef.current || !holdingRef.current) return;
    holdingRef.current = false;
    setHolding(false);
    window.clearTimeout(completeTimer.current);
    cancelAnimationFrame(raf.current);
    animate(progress, 0, { type: "spring", stiffness: 160, damping: 20 });
    animate(rpm, 0, { type: "spring", stiffness: 120, damping: 18 });
  }, [progress, rpm]);

  useEffect(
    () => () => {
      cancelAnimationFrame(raf.current);
      window.clearTimeout(completeTimer.current);
    },
    [],
  );

  // Espaço segura em qualquer ponto da tela (além do botão em foco).
  useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if ((e.key === " " || e.key === "Enter") && !e.repeat) {
        e.preventDefault();
        startHold();
      }
    };
    const up = (e: KeyboardEvent) => {
      if (e.key === " " || e.key === "Enter") endHold();
    };
    window.addEventListener("keydown", down);
    window.addEventListener("keyup", up);
    return () => {
      window.removeEventListener("keydown", down);
      window.removeEventListener("keyup", up);
    };
  }, [startHold, endHold]);

  const ticks = Array.from({ length: 9 }, (_, i) => i);

  return (
    <motion.div
      className="ignition-root fixed inset-0 z-[70] flex flex-col items-center justify-center bg-bg"
      role="dialog"
      aria-label="Ignição"
      animate={shake ? { x: [0, -2, 2, -2, 0], y: [0, 1, -1, 1, 0] } : { x: 0, y: 0 }}
      transition={{ duration: 0.12 }}
    >
      <button
        type="button"
        onClick={onSkip}
        className="t-mono absolute top-6 right-[var(--gutter)] min-h-11 px-2 text-text-muted transition-colors hover:text-text"
      >
        {ignitionCopy.skip}
      </button>

      <div className="relative h-[300px] w-[300px] sm:h-[360px] sm:w-[360px]">
        {/* Conta-giros em arco */}
        <svg viewBox="0 0 360 360" className="absolute inset-0 h-full w-full" aria-hidden>
          <path d={arcPath(R_TACH, ARC_START, ARC_START + ARC_SWEEP)} fill="none" stroke="var(--line-strong)" strokeWidth={1} />
          <path
            d={arcPath(R_TACH, ARC_START + ARC_SWEEP * 0.85, ARC_START + ARC_SWEEP)}
            fill="none"
            stroke="var(--redline)"
            strokeWidth={2}
          />
          {ticks.map((i) => {
            const a = ARC_START + (i / 8) * ARC_SWEEP;
            const [x0, y0] = polar(R_TACH - 10, a);
            const [x1, y1] = polar(R_TACH, a);
            const [tx, ty] = polar(R_TACH - 26, a);
            return (
              <g key={i}>
                <line x1={x0} y1={y0} x2={x1} y2={y1} stroke="rgba(243,239,230,0.45)" strokeWidth={1} />
                <text
                  x={tx}
                  y={ty}
                  fill="rgba(243,239,230,0.6)"
                  fontSize={10}
                  textAnchor="middle"
                  dominantBaseline="middle"
                  style={{ fontFamily: "var(--font-mono)" }}
                >
                  {i}
                </text>
              </g>
            );
          })}
          <motion.g style={{ rotate: needleAngle, transformOrigin: "180px 180px", transformBox: "view-box" }}>
            <line x1={180} y1={180} x2={180 + R_TACH - 18} y2={180} stroke="var(--accent-soft)" strokeWidth={1.5} />
          </motion.g>
        </svg>

        {/* Botão ENGINE START STOP */}
        <div className="absolute inset-0 flex items-center justify-center">
          <button
            type="button"
            data-cursor="SEGURE"
            onPointerDown={(e) => {
              e.currentTarget.setPointerCapture(e.pointerId);
              startHold();
            }}
            onPointerUp={endHold}
            onPointerCancel={endHold}
            onContextMenu={(e) => e.preventDefault()}
            className="relative grid h-[132px] w-[132px] touch-none place-items-center rounded-full bg-surface select-none"
          >
            <svg viewBox="0 0 132 132" className="absolute inset-0 h-full w-full -rotate-90" aria-hidden>
              <circle cx={66} cy={66} r={65} fill="none" stroke="var(--line-strong)" strokeWidth={1} />
              <motion.circle
                cx={66}
                cy={66}
                r={65}
                fill="none"
                stroke="var(--accent)"
                strokeWidth={2}
                pathLength={1}
                strokeDasharray="1 1"
                style={{ strokeDashoffset: ringOffset }}
              />
            </svg>
            <span className="flex flex-col items-center gap-1.5 font-mono text-[10px] leading-tight tracking-[0.24em] text-text">
              <span className="live-dot mb-1" aria-hidden style={{ animationDuration: holding ? "0.4s" : "2.4s" }} />
              <span>ENGINE</span>
              <span className="text-text-muted">START · STOP</span>
              <span className="sr-only">, segure para ligar o motor</span>
            </span>
          </button>
        </div>

        <div className="t-num absolute inset-x-0 bottom-6 text-center text-[11px] tracking-[0.2em] text-steel" aria-hidden>
          {rpmText} RPM
        </div>
      </div>

      <div className="mt-6 h-10 text-center">
        {started ? (
          <motion.div initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }}>
            <Logo variant="mark" size={28} />
          </motion.div>
        ) : (
          <p className="t-mono text-text-muted">
            {ignitionCopy.hint}
            <span className="sr-only"> (segure o botão, ou a tecla Espaço)</span>
          </p>
        )}
      </div>
    </motion.div>
  );
}
