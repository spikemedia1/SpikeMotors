"use client";

import { motion, useTransform, type MotionValue } from "motion/react";
import { useEffect, useRef } from "react";
import { cn } from "@/lib/utils";
import { formatLap } from "@/lib/sim";

export type TracePoint = { t: number; v: number; thr: number };

/** Painel com cantoneiras e título mono. */
export function Panel({
  title,
  right,
  children,
  className,
  pulse,
}: {
  title: string;
  right?: React.ReactNode;
  children: React.ReactNode;
  className?: string;
  pulse?: boolean;
}) {
  return (
    <section
      className={cn(
        "corners relative flex flex-col border border-line bg-surface/60 p-4 backdrop-blur-[2px] md:p-5",
        className,
      )}
    >
      <span className="corners-b" aria-hidden />
      {pulse ? <span aria-hidden className="spike-pulse pointer-events-none absolute -inset-px border border-signal/40" /> : null}
      <header className="mb-3 flex items-center justify-between gap-3">
        <h3 className="t-mono text-[10px] text-text-muted">{title}</h3>
        {right}
      </header>
      {children}
    </section>
  );
}

/** Painel G-force: anéis 0,5 / 1 / 1,5 g e ponto que se desloca. */
export function GForce({ gx, gy, color }: { gx: MotionValue<number>; gy: MotionValue<number>; color: string }) {
  const R = 80; // 1,5 g
  const cx = useTransform(gx, (v) => 100 + Math.max(-1.6, Math.min(1.6, v)) * (R / 1.5));
  const cy = useTransform(gy, (v) => 100 + Math.max(-1.6, Math.min(1.6, v)) * (R / 1.5));
  return (
    <svg viewBox="0 0 200 200" className="mx-auto aspect-square w-full max-w-[200px]" role="img" aria-label="Força G">
      {[0.5, 1, 1.5].map((g) => (
        <g key={g}>
          <circle cx={100} cy={100} r={(g / 1.5) * R} fill="none" stroke="var(--line-strong)" strokeWidth={1} />
          <text x={100 + (g / 1.5) * R * 0.71 + 3} y={100 - (g / 1.5) * R * 0.71 - 3} fill="rgba(243,239,230,0.55)" fontSize={8} style={{ fontFamily: "var(--font-mono)" }}>
            {String(g).replace(".", ",")}g
          </text>
        </g>
      ))}
      <line x1={100 - R - 6} y1={100} x2={100 + R + 6} y2={100} stroke="var(--line)" />
      <line x1={100} y1={100 - R - 6} x2={100} y2={100 + R + 6} stroke="var(--line)" />
      <motion.circle cx={cx} cy={cy} r={6} fill={color} />
      <motion.circle cx={cx} cy={cy} r={12} fill="none" stroke={color} strokeOpacity={0.35} />
    </svg>
  );
}

/** Telemetria em canvas: velocidade (champagne) e acelerador (steel) em tempo real. */
export function Telemetry({
  trace,
  running,
  version,
  tMax,
}: {
  trace: React.RefObject<TracePoint[]>;
  running: boolean;
  version: number;
  tMax: number;
}) {
  const ref = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = ref.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    let raf = 0;

    const draw = () => {
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      const w = canvas.clientWidth;
      const h = canvas.clientHeight;
      if (canvas.width !== Math.round(w * dpr)) {
        canvas.width = Math.round(w * dpr);
        canvas.height = Math.round(h * dpr);
      }
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      ctx.clearRect(0, 0, w, h);
      const padL = 30;
      const padB = 18;
      const gw = w - padL - 6;
      const gh = h - padB - 6;

      ctx.strokeStyle = "rgba(243,239,230,0.08)";
      ctx.lineWidth = 1;
      ctx.font = "9px ui-monospace, monospace";
      ctx.fillStyle = "rgba(243,239,230,0.5)";
      for (let i = 0; i <= 4; i++) {
        const y = 6 + gh - (i / 4) * gh;
        ctx.beginPath();
        ctx.moveTo(padL, Math.round(y) + 0.5);
        ctx.lineTo(w - 6, Math.round(y) + 0.5);
        ctx.stroke();
        ctx.fillText(String(i * 50), 4, y + 3);
      }
      const secs = Math.ceil(tMax);
      for (let s = 0; s <= secs; s += Math.max(1, Math.ceil(secs / 6))) {
        const x = padL + (s / tMax) * gw;
        ctx.fillText(`${s}s`, x - 4, h - 4);
      }

      const pts = trace.current ?? [];
      if (pts.length > 1) {
        const X = (t: number) => padL + Math.min(1, t / tMax) * gw;
        ctx.lineWidth = 1.5;
        ctx.strokeStyle = "#8F999F";
        ctx.beginPath();
        pts.forEach((p, i) => {
          const y = 6 + gh - p.thr * gh * 0.96;
          if (i) ctx.lineTo(X(p.t), y);
          else ctx.moveTo(X(p.t), y);
        });
        ctx.stroke();
        ctx.strokeStyle = "#C8B78B";
        ctx.lineWidth = 2;
        ctx.beginPath();
        pts.forEach((p, i) => {
          const y = 6 + gh - Math.min(1, p.v / 200) * gh;
          if (i) ctx.lineTo(X(p.t), y);
          else ctx.moveTo(X(p.t), y);
        });
        ctx.stroke();
        const last = pts[pts.length - 1];
        ctx.fillStyle = "#E6D9B5";
        ctx.beginPath();
        ctx.arc(X(last.t), 6 + gh - Math.min(1, last.v / 200) * gh, 3, 0, Math.PI * 2);
        ctx.fill();
      } else {
        ctx.fillStyle = "rgba(243,239,230,0.45)";
        ctx.fillText("AGUARDANDO LARGADA", padL + 8, 6 + gh / 2);
      }
      if (running) raf = requestAnimationFrame(draw);
    };
    draw();
    const ro = new ResizeObserver(() => draw());
    ro.observe(canvas);
    return () => {
      cancelAnimationFrame(raf);
      ro.disconnect();
    };
  }, [trace, running, version, tMax]);

  return (
    <div>
      <canvas ref={ref} className="h-[150px] w-full md:h-[170px]" role="img" aria-label="Gráfico de telemetria: velocidade e acelerador" />
      <div className="mt-2 flex gap-5 font-mono text-[9px] tracking-[0.18em] text-text-muted uppercase">
        <span className="flex items-center gap-2">
          <span className="h-px w-4 bg-accent" aria-hidden /> Velocidade km/h
        </span>
        <span className="flex items-center gap-2">
          <span className="h-px w-4 bg-steel" aria-hidden /> Acelerador
        </span>
      </div>
    </div>
  );
}

const CIRCUIT =
  "M 40 150 C 40 95 60 60 110 52 L 190 40 C 232 34 262 52 258 86 C 254 116 222 118 214 140 C 206 162 236 168 262 162 C 294 154 306 178 290 198 C 276 214 240 214 200 212 L 92 210 C 58 208 40 186 40 150 Z";

/** Mini-mapa do circuito fictício com um ponto percorrendo; volta estimada por potência/peso. */
export function CircuitMap({
  lap,
  running,
  color,
  name,
  lengthKm,
}: {
  lap: number;
  running: boolean;
  color: string;
  name: string;
  lengthKm: number;
}) {
  const pathRef = useRef<SVGPathElement>(null);
  const dotRef = useRef<SVGCircleElement>(null);

  useEffect(() => {
    const path = pathRef.current;
    const dot = dotRef.current;
    if (!path || !dot) return;
    const len = path.getTotalLength();
    const place = (f: number) => {
      const p = path.getPointAtLength(f * len);
      dot.setAttribute("cx", p.x.toFixed(2));
      dot.setAttribute("cy", p.y.toFixed(2));
    };
    place(0);
    if (!running) return;
    // ponto em escala de tempo comprimida (volta real / 14)
    const period = (lap / 14) * 1000;
    let raf = 0;
    const t0 = performance.now();
    const loop = (now: number) => {
      place(((now - t0) % period) / period);
      raf = requestAnimationFrame(loop);
    };
    raf = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(raf);
  }, [lap, running]);

  return (
    <div>
      <svg viewBox="20 20 300 210" className="w-full" role="img" aria-label={`${name}, ${String(lengthKm).replace(".", ",")} km`}>
        <path d={CIRCUIT} fill="none" stroke="var(--line-strong)" strokeWidth={9} strokeLinejoin="round" />
        <path ref={pathRef} d={CIRCUIT} fill="none" stroke="rgba(243,239,230,0.55)" strokeWidth={1} />
        <line x1={40} y1={140} x2={40} y2={160} stroke={color} strokeWidth={2} />
        <circle ref={dotRef} r={4.5} fill={color} cx={40} cy={150} />
      </svg>
      <div className="mt-2 flex items-end justify-between gap-3">
        <span className="t-mono text-[9px] text-text-muted">
          {name} · {String(lengthKm).replace(".", ",")} km
        </span>
        <span className="text-right">
          <span className="t-mono block text-[9px] text-text-muted">Volta estimada</span>
          <span className="t-num text-lg text-text">{formatLap(lap)}</span>
        </span>
      </div>
    </div>
  );
}
