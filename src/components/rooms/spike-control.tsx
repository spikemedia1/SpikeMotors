"use client";

import { AnimatePresence, motion, useMotionValue } from "motion/react";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Gauge } from "@/components/motion/gauge";
import { Reveal, SplitReveal } from "@/components/motion/split-reveal";
import { RoomFrame } from "@/components/showroom/room-frame";
import { useRoom, useShowroom } from "@/components/showroom/showroom-context";
import { ShinyButton } from "@/components/ui/shiny-button";
import Velaris from "@/components/ui/velaris";
import { carName, cars, getCar } from "@/data/cars";
import { spikeControlCopy } from "@/data/content";
import { cylindersOf, EngineAudio } from "@/lib/engine-audio";
import { formatDec, formatInt } from "@/lib/format";
import { useReducedMotion } from "@/lib/hooks";
import {
  effectiveZeroToHundred,
  formatTimer,
  gAt,
  lapTime,
  MIN_HOLD_S,
  MODE_ORDER,
  MODES,
  rpmAt,
  speedAt,
  timeToSpeed,
  type DriveMode,
} from "@/lib/sim";
import { cn } from "@/lib/utils";
import { CircuitMap, GForce, Panel, Telemetry, type TracePoint } from "./spike-control-parts";

type Phase = "idle" | "armed" | "running" | "done" | "aborted";

const MODE_COLOR: Record<DriveMode, string> = {
  conforto: "rgba(243,239,230,0.6)",
  sport: "#8F999F",
  pista: "#C8B78B",
  spike: "#D7FF3F",
};
const SPIKE_COLORS = ["#D7FF3F", "#1E2A06", "#080808", "#3A4A10"];
const IDLE_RPM = 900;
const ARM_FULL_S = 1;

const readRpm = (v: number) => formatInt(Math.round(v / 10) * 10);
const readPct = (v: number) => `${Math.round(v)}%`;
const readKmh = (v: number) => formatInt(Math.round(v));

export function SpikeControl() {
  const { current, active } = useRoom();
  const { selectedCar, setSelectedCar, soundOn } = useShowroom();
  const reduced = useReducedMotion();
  const car = getCar(selectedCar);
  const [mode, setMode] = useState<DriveMode>("pista");
  const [phase, setPhase] = useState<Phase>("idle");
  const [result, setResult] = useState<{ slug: string; mode: DriveMode; t100: number; t200: number } | null>(null);
  const [traceVersion, setTraceVersion] = useState(0);

  const speed = useMotionValue(0);
  const rpm = useMotionValue(car.electric ? 0 : IDLE_RPM);
  const gx = useMotionValue(0);
  const gy = useMotionValue(0);
  const charge = useMotionValue(0);
  const timerRef = useRef<HTMLSpanElement>(null);
  const trace = useRef<TracePoint[]>([]);
  const phaseRef = useRef<Phase>("idle");
  const holdT = useRef(0);
  const runT = useRef(0);
  const pointerG = useRef({ x: 0, y: 0 });
  const audio = useRef<EngineAudio | null>(null);
  const autoTimer = useRef(0);

  const color = MODE_COLOR[mode];
  const tachMax = car.electric ? 100 : Math.ceil((car.redlineRpm + 500) / 1000) * 1000;
  const speedoMax = Math.ceil((car.topSpeedKmh + 10) / 40) * 40;
  const launchRpm = car.electric ? 35 : car.redlineRpm * 0.55;
  const t200 = useMemo(() => timeToSpeed(car, mode, 200), [car, mode]);
  const lap = useMemo(() => lapTime(car, mode, spikeControlCopy.circuit.lengthKm), [car, mode]);

  const setPhaseBoth = (p: Phase) => {
    phaseRef.current = p;
    setPhase(p);
  };

  const reset = useCallback(() => {
    window.clearTimeout(autoTimer.current);
    phaseRef.current = "idle";
    setPhase("idle");
    holdT.current = 0;
    runT.current = 0;
    charge.set(0);
    speed.set(0);
    if (timerRef.current) timerRef.current.textContent = formatTimer(0);
  }, [charge, speed]);

  // Troca de carro/modo: zera a largada (o resultado anterior continua visível na comparação).
  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- sincroniza a simulação com o carro/modo
    reset();
    trace.current = [];
    setTraceVersion((v) => v + 1);
  }, [car.slug, mode, reset]);

  // Loop da simulação (só com a sala atual)
  useEffect(() => {
    if (!current) return;
    let raf = 0;
    let last = performance.now();
    let traceAcc = 0;
    const loop = (now: number) => {
      raf = requestAnimationFrame(loop);
      const dt = Math.min(0.05, (now - last) / 1000);
      last = now;
      const ph = phaseRef.current;

      if (ph === "armed") {
        holdT.current += dt;
        charge.set(Math.min(1, holdT.current / ARM_FULL_S));
        const jitter = reduced ? 0 : (Math.random() - 0.5) * (car.electric ? 6 : 360);
        rpm.set(launchRpm * Math.min(1, 0.4 + holdT.current * 1.6) + jitter);
        gy.set(0);
        audio.current?.update(rpm.get(), 0.6);
      } else if (ph === "running") {
        runT.current += dt;
        const t = runT.current;
        const v = speedAt(car, mode, t);
        speed.set(v);
        const g = gAt(car, mode, t);
        rpm.set(car.electric ? Math.max(40, 100 - (v / car.topSpeedKmh) * 55) : rpmAt(car, mode, v, launchRpm));
        gy.set(Math.min(1.6, g)); // ponto vai para trás (para baixo) na aceleração
        gx.set(0);
        if (timerRef.current) timerRef.current.textContent = formatTimer(Math.min(t, timeToSpeed(car, mode, 100)));
        traceAcc += dt;
        if (traceAcc > 1 / 40) {
          traceAcc = 0;
          trace.current.push({ t, v, thr: 1 });
        }
        audio.current?.update(rpm.get(), 1);
        if (t >= t200) {
          trace.current.push({ t: t200, v: 200, thr: 1 });
          phaseRef.current = "done";
          setPhase("done");
          setResult({ slug: car.slug, mode, t100: timeToSpeed(car, mode, 100), t200 });
          setTraceVersion((x) => x + 1);
        }
      } else {
        // marcha lenta / modo livre: G lateral segue o mouse
        const idle = car.electric ? 0 : IDLE_RPM + (reduced ? 0 : Math.sin(now / 90) * 25);
        rpm.set(rpm.get() + (idle - rpm.get()) * Math.min(1, dt * 4));
        if (ph !== "done") speed.set(speed.get() * (1 - Math.min(1, dt * 2)));
        gx.set(gx.get() + (pointerG.current.x - gx.get()) * Math.min(1, dt * 6));
        gy.set(gy.get() + (pointerG.current.y - gy.get()) * Math.min(1, dt * 6));
        audio.current?.update(rpm.get(), 0.15);
      }
    };
    raf = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(raf);
  }, [current, car, mode, t200, launchRpm, reduced, rpm, speed, gx, gy, charge]);

  // Som (desligado por padrão; ícone no dock)
  useEffect(() => {
    if (!soundOn || !current) return;
    const a = new EngineAudio({ cylinders: cylindersOf(car.engine), electric: car.electric });
    a.start();
    audio.current = a;
    return () => {
      a.stop();
      audio.current = null;
    };
  }, [soundOn, current, car.engine, car.electric]);

  const arm = () => {
    const ph = phaseRef.current;
    if (ph === "running" || ph === "armed") return;
    trace.current = [];
    setTraceVersion((v) => v + 1);
    holdT.current = 0;
    runT.current = 0;
    speed.set(0);
    if (timerRef.current) timerRef.current.textContent = formatTimer(0);
    setPhaseBoth("armed");
  };

  const release = () => {
    if (phaseRef.current !== "armed") return;
    if (holdT.current < MIN_HOLD_S) {
      setPhaseBoth("aborted");
      charge.set(0);
      window.setTimeout(() => phaseRef.current === "aborted" && setPhaseBoth("idle"), 1600);
      return;
    }
    charge.set(0);
    runT.current = 0;
    trace.current = [{ t: 0, v: 0, thr: 1 }];
    setPhaseBoth("running");
  };

  const autoLaunch = () => {
    arm();
    window.clearTimeout(autoTimer.current);
    autoTimer.current = window.setTimeout(release, 1100);
  };

  useEffect(() => () => window.clearTimeout(autoTimer.current), []);

  const onRoomPointer = (e: React.PointerEvent) => {
    if (phaseRef.current === "running") return;
    const nx = (e.clientX / window.innerWidth - 0.5) * 2;
    const ny = (e.clientY / window.innerHeight - 0.5) * 2;
    pointerG.current = { x: nx * 1.2, y: ny * 0.5 };
  };

  const comparison = useMemo(() => {
    const m = result?.mode ?? mode;
    const list = cars
      .map((c) => ({ c, t: effectiveZeroToHundred(c, m) }))
      .sort((a, b) => a.t - b.t);
    const min = list[0].t;
    return list.map((x) => ({ ...x, w: min / x.t }));
  }, [result, mode]);

  const statusLabel =
    phase === "armed"
      ? "LAUNCH ARMED"
      : phase === "running"
        ? "LARGADA"
        : phase === "aborted"
          ? "LARGADA ABORTADA"
          : phase === "done"
            ? "CONCLUÍDO"
            : "PRONTO";

  const spike = mode === "spike";

  return (
    <div className="absolute inset-0" onPointerMove={onRoomPointer}>
      {spike && current ? (
        <div className="absolute inset-0 opacity-25" aria-hidden>
          <Velaris bg="#080808" colors={SPIKE_COLORS} speed={0.9} grain={0.4} active={active} />
        </div>
      ) : null}

      <RoomFrame className="flex flex-col gap-5">
        {/* Topo: título, carro, modos */}
        <div className="flex flex-col gap-5 xl:flex-row xl:items-end xl:justify-between">
          <div>
            <Reveal i={0}>
              <p className="t-mono flex items-center gap-3 text-accent">
                03 · Telemetria
                {spike ? (
                  <span className="flex items-center gap-2 text-signal">
                    <span className="live-dot" aria-hidden /> Spike mode · engajado
                  </span>
                ) : null}
              </p>
            </Reveal>
            <SplitReveal id="spike-control-title" lines={["Spike Control"]} className="mt-3 text-[clamp(38px,4vw,64px)]" />
          </div>
          <Reveal i={2} className="flex flex-col gap-3 xl:items-end">
            <div className="flex max-w-full gap-1.5 overflow-x-auto pb-1" role="group" aria-label="Carro" data-drag-x>
              {cars.map((c) => (
                <button
                  key={c.slug}
                  type="button"
                  onClick={() => setSelectedCar(c.slug)}
                  aria-pressed={c.slug === car.slug}
                  className={cn(
                    "min-h-11 shrink-0 border px-3 font-mono text-[10px] tracking-[0.16em] whitespace-nowrap uppercase transition-colors",
                    c.slug === car.slug ? "border-accent text-text" : "border-line text-text-muted hover:text-text",
                  )}
                >
                  {c.model}
                </button>
              ))}
            </div>
            <div role="radiogroup" aria-label="Modo de condução" className="flex border border-line">
              {MODE_ORDER.map((m) => {
                const on = m === mode;
                return (
                  <button
                    key={m}
                    type="button"
                    role="radio"
                    aria-checked={on}
                    onClick={() => setMode(m)}
                    className={cn(
                      "min-h-11 flex-1 px-4 font-mono text-[10px] tracking-[0.22em] uppercase transition-colors sm:flex-none",
                      on ? "bg-surface-2 text-text" : "text-text-muted hover:text-text",
                    )}
                    style={on ? { boxShadow: `inset 0 -2px 0 ${MODE_COLOR[m]}` } : undefined}
                  >
                    {MODES[m].label}
                  </button>
                );
              })}
            </div>
          </Reveal>
        </div>

        {/* Grade de painéis */}
        <div className="grid grid-cols-1 gap-3 md:grid-cols-2 lg:grid-cols-12">
          <Panel
            title={`Instrumentos · ${carName(car)}`}
            className="md:col-span-2 lg:col-span-6"
            pulse={spike}
            right={
              <span className="t-mono text-[9px] text-text-muted">
                Limite {car.electric ? "100%" : `${formatInt(Math.round(car.redlineRpm * MODES[mode].rpmLimit))} rpm`}
              </span>
            }
          >
            <div className="grid grid-cols-2 gap-2">
              {car.electric ? (
                <Gauge
                  value={rpm}
                  max={100}
                  majorStep={10}
                  labelEvery={2}
                  color={color}
                  title="Potência"
                  unit="%"
                  readout={readPct}
                />
              ) : (
                <Gauge
                  value={rpm}
                  max={tachMax}
                  majorStep={1000}
                  labelScale={1000}
                  color={color}
                  redFrom={0.85}
                  limit={(car.redlineRpm * MODES[mode].rpmLimit) / tachMax}
                  title="Giro"
                  unit="rpm"
                  readout={readRpm}
                />
              )}
              <Gauge
                value={speed}
                max={speedoMax}
                majorStep={20}
                labelEvery={2}
                color={color}
                title="Velocidade"
                unit="km/h"
                readout={readKmh}
              />
            </div>
          </Panel>

          {/* Launch Control */}
          <Panel
            title="Launch control"
            className="sticky bottom-[72px] z-20 order-last md:bottom-auto bg-surface/95 md:static md:order-none md:col-span-1 md:bg-surface/60 lg:col-span-3"
            pulse={spike}
            right={
              <span
                className={cn(
                  "t-mono text-[9px]",
                  phase === "aborted" ? "text-redline" : phase === "armed" ? "text-signal" : "text-text-muted",
                )}
                role="status"
              >
                {statusLabel}
              </span>
            }
          >
            <div className="flex flex-1 flex-wrap items-center justify-between gap-3 md:flex-col md:flex-nowrap md:items-stretch md:gap-4">
              <div>
                <span className="t-mono text-[9px] text-text-muted">0–100 km/h</span>
                <span ref={timerRef} className="t-num mt-1 block text-[30px] leading-none text-text md:text-[clamp(34px,3.4vw,48px)]">
                  {formatTimer(0)}
                </span>
              </div>
              <div className="order-last h-px w-full basis-full bg-line md:order-none" aria-hidden>
                <motion.div
                  className="h-px origin-left"
                  style={{ scaleX: charge, background: spike ? "var(--signal)" : "var(--accent)" }}
                />
              </div>
              <div className="flex flex-col items-end gap-1 md:items-start md:gap-3" data-keys-local>
                <ShinyButton
                  size="lg"
                  variant={spike ? "signal" : "champagne"}
                  pressed={phase === "armed"}
                  cursor="SEGURE"
                  magnetic={false}
                  disabled={phase === "running"}
                  aria-label="Segure para largar"
                  onPointerDown={(e) => {
                    e.currentTarget.setPointerCapture(e.pointerId);
                    arm();
                  }}
                  onPointerUp={release}
                  onPointerCancel={release}
                  onKeyDown={(e) => {
                    if ((e.key === " " || e.key === "Enter") && !e.repeat) {
                      e.preventDefault();
                      arm();
                    }
                  }}
                  onKeyUp={(e) => {
                    if (e.key === " " || e.key === "Enter") {
                      e.preventDefault();
                      release();
                    }
                  }}
                  onBlur={release}
                >
                  Segure para largar
                </ShinyButton>
                <button
                  type="button"
                  onClick={autoLaunch}
                  disabled={phase === "running" || phase === "armed"}
                  className="min-h-9 font-mono text-[9px] tracking-[0.2em] md:min-h-11 md:text-[10px] text-text-muted uppercase underline-offset-4 transition-colors hover:text-text hover:underline disabled:opacity-40"
                >
                  Largar automaticamente
                </button>
              </div>
            </div>
          </Panel>

          {/* Resultado e comparação */}
          <Panel title="Resultado · comparação" className="md:col-span-1 lg:col-span-3" pulse={spike}>
            <AnimatePresence mode="wait" initial={false}>
              {result ? (
                <motion.div
                  key={`${result.slug}-${result.mode}-${result.t100}`}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0 }}
                >
                  <p className="t-mono text-[9px] text-text-muted">
                    {getCar(result.slug).model} · {MODES[result.mode].label}
                  </p>
                  <p className="t-num mt-2 text-[34px] leading-none text-accent">
                    {formatDec(result.t100, 2)}s <span className="font-mono text-[10px] tracking-[0.18em] text-text-muted">0–100 KM/H</span>
                  </p>
                  <p className="t-mono mt-1 text-[9px] text-text-muted">0–200 km/h (estimado) · {formatDec(result.t200, 1)}s</p>
                </motion.div>
              ) : (
                <motion.p key="none" className="t-body text-[13px]" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                  Segure o botão, solte e compare o tempo com o resto da coleção.
                </motion.p>
              )}
            </AnimatePresence>
            <ol className="mt-4 flex flex-col gap-1.5" aria-label="Comparação 0–100 km/h">
              {comparison.map(({ c, t, w }) => {
                const me = c.slug === car.slug;
                return (
                  <li key={c.slug} className="grid grid-cols-[1fr_auto] items-center gap-x-2">
                    <span className={cn("truncate font-mono text-[9px] tracking-[0.14em] uppercase", me ? "text-text" : "text-text-muted")}>
                      {c.model}
                    </span>
                    <span className={cn("t-num text-[10px]", me ? "text-accent" : "text-text-muted")}>{formatDec(t, 1)}s</span>
                    <span className="col-span-2 h-[3px] bg-line">
                      <motion.span
                        className="block h-full origin-left"
                        style={{ background: me ? color : "rgba(243,239,230,0.25)" }}
                        initial={false}
                        animate={{ scaleX: w }}
                        transition={{ duration: reduced ? 0 : 0.8, ease: [0.22, 1, 0.36, 1] }}
                      />
                    </span>
                  </li>
                );
              })}
            </ol>
          </Panel>

          <Panel title="Força G" className="lg:col-span-3" pulse={spike}>
            <GForce gx={gx} gy={gy} color={color} />
          </Panel>
          <Panel title="Telemetria ao vivo" className="lg:col-span-6" pulse={spike}>
            <Telemetry trace={trace} running={phase === "running"} version={traceVersion} tMax={Math.ceil(t200)} />
          </Panel>
          <Panel title="Circuito" className="md:col-span-2 lg:col-span-3" pulse={spike}>
            <CircuitMap
              lap={lap}
              running={current && !reduced}
              color={color}
              name={spikeControlCopy.circuit.name}
              lengthKm={spikeControlCopy.circuit.lengthKm}
            />
          </Panel>
        </div>

        <p className="font-mono text-[10px] leading-relaxed tracking-[0.1em] text-text-muted">{spikeControlCopy.footer}</p>
      </RoomFrame>
    </div>
  );
}
