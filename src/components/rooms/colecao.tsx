"use client";

import Image from "next/image";
import { AnimatePresence, motion, useMotionValue, useSpring } from "motion/react";
import { ChevronLeft, ChevronRight, ScanLine } from "lucide-react";
import { useCallback, useEffect, useState } from "react";
import { Blueprint } from "@/components/motion/blueprint";
import { Counter } from "@/components/motion/counter";
import { Odometer } from "@/components/motion/odometer";
import { Reveal } from "@/components/motion/split-reveal";
import { Drawer } from "@/components/showroom/drawer";
import { RoomFrame } from "@/components/showroom/room-frame";
import { useRoom, useShowroom } from "@/components/showroom/showroom-context";
import { ShinyButton } from "@/components/ui/shiny-button";
import { carName, cars, getCar, type Car } from "@/data/cars";
import { colecaoCopy } from "@/data/content";
import { quotes } from "@/data/quotes";
import { formatBRL, formatDec, formatInt } from "@/lib/format";
import { useFinePointer, useReducedMotion } from "@/lib/hooks";
import { cn } from "@/lib/utils";

const EASE = [0.76, 0, 0.24, 1] as const;

function PriceBlock({ car, size = "lg" }: { car: Car; size?: "lg" | "md" }) {
  return (
    <div>
      <p className="t-mono text-[10px] text-text-muted">{car.priceBRL ? colecaoCopy.priceLabel : "Valor"}</p>
      <div className={cn("mt-2 text-accent", size === "lg" ? "text-[clamp(26px,2.4vw,38px)]" : "text-2xl")}>
        {car.priceBRL ? (
          <Odometer value={formatBRL(car.priceBRL)} />
        ) : (
          <span className="t-display italic">{colecaoCopy.onRequest}</span>
        )}
      </div>
      <p className="mt-3 max-w-[34ch] font-mono text-[10px] leading-relaxed tracking-[0.08em] text-text-muted">
        {colecaoCopy.priceDisclaimer}
        <span className="block">Ref.: {car.priceNote}.</span>
      </p>
    </div>
  );
}

function Specs({ car }: { car: Car }) {
  const items = [
    { k: "Potência", v: <Counter value={car.powerCv} />, u: "cv" },
    { k: "0–100 km/h", v: <Counter value={car.zeroToHundred} decimals={1} />, u: "s" },
    { k: "Vel. máxima", v: <><span>{car.topSpeedPlus ? ">" : ""}</span><Counter value={car.topSpeedKmh} /></>, u: "km/h" },
  ];
  return (
    <dl className="grid grid-cols-3 gap-x-4 gap-y-5 lg:grid-cols-2">
      {items.map((it) => (
        <div key={it.k} className="border-t border-line pt-3">
          <dt className="t-mono text-[10px] text-text-muted">{it.k}</dt>
          <dd className="t-num mt-1.5 text-[clamp(22px,2.2vw,34px)] leading-none text-text">
            {it.v}
            <span className="ml-1.5 font-mono text-[11px] tracking-[0.18em] text-steel uppercase">{it.u}</span>
          </dd>
        </div>
      ))}
      <div className="col-span-3 border-t border-line pt-3 lg:col-span-2">
        <dt className="t-mono text-[10px] text-text-muted">Motor</dt>
        <dd className="mt-1.5 font-mono text-[12px] tracking-[0.12em] text-text uppercase">{car.engine}</dd>
      </div>
    </dl>
  );
}

function FichaTecnica({ car, onVisit }: { car: Car; onVisit: () => void }) {
  const rows: [string, string][] = [
    ["Marca", car.brand],
    ["Modelo", car.model],
    ["Motor", car.engine],
    ["Tração", car.drivetrain],
    ["Potência", `${formatInt(car.powerCv)} cv`],
    ["0–100 km/h", `${formatDec(car.zeroToHundred)} s`],
    ["Velocidade máxima", `${car.topSpeedPlus ? "> " : ""}${formatInt(car.topSpeedKmh)} km/h`],
    ["Peso", car.weightKg ? `${formatInt(car.weightKg)} kg` : "—"],
    ["Comprimento", car.lengthMm ? `${formatInt(car.lengthMm)} mm` : "—"],
    ["Entre-eixos", car.wheelbaseMm ? `${formatInt(car.wheelbaseMm)} mm` : "—"],
    ["Altura", car.heightMm ? `${formatInt(car.heightMm)} mm` : "—"],
    ["Preço", car.priceBRL ? formatBRL(car.priceBRL) : colecaoCopy.onRequest],
  ];
  return (
    <div>
      <p className="t-mono text-accent">{car.brand}</p>
      <h3 className="t-display mt-2 text-5xl">{car.model}</h3>
      <p className="t-body mt-3">{car.tagline}</p>

      <div className="mt-8 grid gap-3">
        {car.images.map((img) => (
          <figure key={img.src} className="relative overflow-hidden bg-bg">
            <Image
              src={img.src}
              alt={img.alt}
              width={img.width}
              height={img.height}
              sizes="(max-width: 640px) 100vw, 560px"
              className="h-auto w-full"
            />
            <figcaption className="t-mono absolute bottom-2 left-3 text-[9px] text-text-muted">{img.angle}</figcaption>
          </figure>
        ))}
      </div>

      <table className="mt-10 w-full border-collapse font-mono text-[12px] tracking-[0.08em]">
        <caption className="t-mono mb-3 text-left text-[10px] text-text-muted">Ficha técnica</caption>
        <tbody>
          {rows.map(([k, v]) => (
            <tr key={k} className="border-t border-line">
              <th scope="row" className="py-2.5 pr-4 text-left font-normal text-text-muted uppercase">
                {k}
              </th>
              <td className="py-2.5 text-right text-text tabular-nums">{v}</td>
            </tr>
          ))}
        </tbody>
      </table>
      <p className="mt-4 font-mono text-[10px] leading-relaxed text-text-muted">
        {colecaoCopy.priceDisclaimer} Ref.: {car.priceNote}. Dados de fábrica sujeitos a conferência.
      </p>
      <div className="mt-10">
        <ShinyButton onClick={onVisit} cursor="AGENDAR">
          Agendar visita para este carro
        </ShinyButton>
      </div>
    </div>
  );
}

export function Colecao() {
  const { current, mounted } = useRoom();
  const { selectedCar, setSelectedCar, go, drawerOpen, setDrawerOpen } = useShowroom();
  const reduced = useReducedMotion();
  const fine = useFinePointer();
  const car = getCar(selectedCar);
  const idx = cars.findIndex((c) => c.slug === car.slug);
  const [blueprint, setBlueprint] = useState(false);
  const [hoverSlug, setHoverSlug] = useState<string | null>(null);
  const [wipeKey, setWipeKey] = useState(0);
  const [dir, setDir] = useState(1);

  const thumbX = useSpring(useMotionValue(0), { stiffness: 300, damping: 30 });
  const thumbY = useSpring(useMotionValue(0), { stiffness: 300, damping: 30 });

  const select = useCallback(
    (slug: string, d?: number) => {
      if (slug === selectedCar) return;
      const ni = cars.findIndex((c) => c.slug === slug);
      setDir(d ?? (ni > idx ? 1 : -1));
      setSelectedCar(slug);
      setWipeKey((k) => k + 1);
    },
    [selectedCar, setSelectedCar, idx],
  );
  const step = useCallback(
    (d: 1 | -1) => select(cars[(idx + d + cars.length) % cars.length].slug, d),
    [idx, select],
  );

  // Teclas [ e ]
  useEffect(() => {
    if (!current) return;
    const onKey = (e: KeyboardEvent) => {
      if (drawerOpen || e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) return;
      if (e.key === "]") step(1);
      if (e.key === "[") step(-1);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [current, step, drawerOpen]);

  const hoverCar = hoverSlug ? getCar(hoverSlug) : null;

  return (
    <RoomFrame className="flex flex-col">
      <div className="grid flex-1 grid-cols-1 gap-x-6 gap-y-8 lg:grid-cols-12 lg:items-center">
        {/* Esquerda: lista */}
        <div className="order-2 lg:order-1 lg:col-span-3">
          <Reveal i={0}>
            <h2 id="colecao-title" tabIndex={-1} data-room-title className="t-mono text-accent outline-none">
              02 · Coleção <span className="text-text-muted">· {colecaoCopy.label}</span>
            </h2>
          </Reveal>
          <Reveal i={1}>
            <ol
              className="mt-6 flex gap-2 overflow-x-auto pb-2 lg:flex-col lg:gap-0 lg:overflow-visible lg:pb-0"
              data-drag-x
              onPointerMove={(e) => {
                if (!fine) return;
                thumbX.set(e.clientX + 24);
                thumbY.set(e.clientY - 60);
              }}
              onPointerLeave={() => setHoverSlug(null)}
            >
              {cars.map((c, i) => {
                const on = c.slug === car.slug;
                return (
                  <li key={c.slug} className="shrink-0">
                    <button
                      type="button"
                      onClick={() => select(c.slug)}
                      onPointerEnter={() => fine && setHoverSlug(c.slug)}
                      aria-pressed={on}
                      data-cursor="VER"
                      className={cn(
                        "group flex min-h-11 w-full items-center gap-4 border px-3 text-left font-mono text-[11px] tracking-[0.16em] uppercase transition-colors lg:border-0 lg:border-l lg:px-4",
                        on ? "border-accent text-text" : "border-line text-text-muted hover:text-text",
                      )}
                    >
                      <span className="tabular-nums">{String(i + 1).padStart(2, "0")}</span>
                      <span className="whitespace-nowrap lg:whitespace-normal">{carName(c)}</span>
                    </button>
                  </li>
                );
              })}
            </ol>
          </Reveal>
        </div>

        {/* Centro: carro */}
        <div className="order-1 lg:order-2 lg:col-span-6">
          <div className="relative">
            <p className="t-mono text-[10px] text-text-muted">
              {String(idx + 1).padStart(2, "0")} / {String(cars.length).padStart(2, "0")} · {car.brand}
            </p>
            <div className="relative mt-1 overflow-hidden">
              <AnimatePresence mode="popLayout" initial={false}>
                <motion.h3
                  key={car.slug}
                  className="t-display text-[clamp(44px,6.2vw,104px)] whitespace-nowrap"
                  initial={{ y: "100%", opacity: 0 }}
                  animate={{ y: "0%", opacity: 1 }}
                  exit={{ y: "-60%", opacity: 0 }}
                  transition={{ duration: reduced ? 0 : 0.8, ease: EASE }}
                >
                  {car.model}
                </motion.h3>
              </AnimatePresence>
            </div>
          </div>

          <motion.div
            className="relative mt-2 aspect-[16/10] w-full touch-pan-y select-none"
            data-cursor="ARRASTE"
            data-drag-x
            onPointerEnter={() => fine && setBlueprint(true)}
            onPointerLeave={() => fine && setBlueprint(false)}
            drag={reduced ? false : "x"}
            dragConstraints={{ left: 0, right: 0 }}
            dragElastic={0.18}
            dragTransition={{ bounceStiffness: 260, bounceDamping: 24 }}
            onDragEnd={(_, info) => {
              const swipe = info.offset.x + info.velocity.x * 0.2;
              if (swipe < -80) step(1);
              else if (swipe > 80) step(-1);
            }}
          >
            {/* sombra de chão */}
            <div
              aria-hidden
              className="absolute inset-x-[8%] bottom-[2%] h-[14%]"
              style={{ background: "radial-gradient(ellipse at center, rgba(0,0,0,0.85), transparent 70%)" }}
            />
            <div
              className="absolute inset-0"
              style={{
                maskImage: "radial-gradient(ellipse 62% 66% at 50% 52%, #000 55%, transparent 100%)",
                WebkitMaskImage: "radial-gradient(ellipse 62% 66% at 50% 52%, #000 55%, transparent 100%)",
              }}
            >
              <AnimatePresence initial={false}>
                <motion.div
                  key={car.slug}
                  className="absolute inset-0"
                  initial={{ clipPath: dir > 0 ? "inset(0 0 0 100%)" : "inset(0 100% 0 0)" }}
                  animate={{ clipPath: "inset(0 0% 0 0%)" }}
                  exit={{ opacity: 0, transition: { delay: reduced ? 0 : 0.85, duration: 0.01 } }}
                  transition={{ duration: reduced ? 0 : 0.85, ease: EASE }}
                >
                  {mounted ? (
                    <Image
                      src={car.images[0].src}
                      alt={car.images[0].alt}
                      fill
                      sizes="(max-width: 1023px) 100vw, 50vw"
                      className="object-cover transition-[filter] duration-700"
                      style={{ filter: blueprint ? "saturate(0.4) brightness(0.8)" : "none" }}
                    />
                  ) : null}
                </motion.div>
              </AnimatePresence>
            </div>
            {/* wipe de luz */}
            {!reduced ? (
              <motion.div
                key={`wipe-${wipeKey}`}
                aria-hidden
                className="pointer-events-none absolute inset-y-0 w-[18%] mix-blend-screen"
                style={{
                  background: "linear-gradient(90deg, transparent, rgba(230,217,181,0.55), transparent)",
                  [dir > 0 ? "right" : "left"]: 0,
                }}
                initial={{ x: wipeKey ? (dir > 0 ? "0%" : "0%") : "0%", opacity: wipeKey ? 1 : 0 }}
                animate={{ x: dir > 0 ? "-560%" : "560%", opacity: [1, 1, 0] }}
                transition={{ duration: 0.85, ease: EASE }}
              />
            ) : null}
            <Blueprint car={car} show={blueprint} />
          </motion.div>

          <div className="mt-3 flex items-center justify-between gap-3">
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => step(-1)}
                aria-label="Carro anterior"
                className="grid h-11 w-11 place-items-center border border-line text-text-muted transition-colors hover:border-accent hover:text-text"
              >
                <ChevronLeft className="h-4 w-4" aria-hidden strokeWidth={1.5} />
              </button>
              <button
                type="button"
                onClick={() => step(1)}
                aria-label="Próximo carro"
                className="grid h-11 w-11 place-items-center border border-line text-text-muted transition-colors hover:border-accent hover:text-text"
              >
                <ChevronRight className="h-4 w-4" aria-hidden strokeWidth={1.5} />
              </button>
            </div>
            <button
              type="button"
              onClick={() => setBlueprint((b) => !b)}
              aria-pressed={blueprint}
              className={cn(
                "flex min-h-11 items-center gap-2 border px-3 font-mono text-[10px] tracking-[0.2em] uppercase transition-colors",
                blueprint ? "border-steel text-text" : "border-line text-text-muted hover:text-text",
              )}
            >
              <ScanLine className="h-3.5 w-3.5" aria-hidden strokeWidth={1.5} /> Blueprint
            </button>
            <span className="t-mono hidden text-[10px] text-text-muted xl:inline">[ ] ou arraste</span>
          </div>
        </div>

        {/* Direita: specs, preço, ações */}
        <div className="order-3 flex flex-col gap-7 lg:col-span-3">
          <Reveal i={2}>
            <Specs car={car} />
          </Reveal>
          <Reveal i={3}>
            <PriceBlock car={car} />
          </Reveal>
          <Reveal i={4}>
            <div className="flex flex-col items-start gap-4">
              <ShinyButton
                cursor="ATELIÊ"
                onClick={() => {
                  setSelectedCar(car.slug);
                  go("atelie");
                }}
              >
                Personalizar no Ateliê
              </ShinyButton>
              <button
                type="button"
                onClick={() => {
                  setSelectedCar(car.slug);
                  go("spike-control");
                }}
                className="flex min-h-11 items-center gap-2 border border-line-strong px-5 font-body text-[14px] text-text transition-colors hover:border-accent"
                data-cursor="TESTAR"
              >
                Testar no Spike Control
              </button>
              <button
                type="button"
                onClick={() => setDrawerOpen(true)}
                className="group flex min-h-11 items-center gap-2 text-[14px] text-text-muted transition-colors hover:text-text"
                data-cursor="FICHA"
              >
                <span className="border-b border-line-strong pb-0.5 group-hover:border-accent">Ver ficha completa</span>
                <span aria-hidden className="text-accent">→</span>
              </button>
            </div>
          </Reveal>
        </div>
      </div>

      <Reveal i={6}>
        <figure className="mt-10 flex flex-wrap items-baseline gap-x-4 gap-y-1 border-t border-line pt-5">
          <blockquote className="t-display text-xl text-text italic">“{quotes.colecao.text}”</blockquote>
          <figcaption className="t-mono text-[10px] text-text-muted">— {quotes.colecao.attribution}</figcaption>
        </figure>
      </Reveal>

      {/* miniatura flutuante perto do cursor */}
      {fine && hoverCar && hoverCar.slug !== car.slug ? (
        <motion.div
          aria-hidden
          className="pointer-events-none fixed top-0 left-0 z-40 h-[90px] w-[150px] overflow-hidden border border-line bg-surface"
          style={{ x: thumbX, y: thumbY }}
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
        >
          <Image src={hoverCar.images[0].src} alt="" fill sizes="150px" className="object-cover" />
        </motion.div>
      ) : null}

      <Drawer open={drawerOpen && current} onClose={() => setDrawerOpen(false)} title={`Ficha · ${carName(car)}`}>
        <FichaTecnica
          car={car}
          onVisit={() => {
            setDrawerOpen(false);
            go("concierge");
          }}
        />
      </Drawer>
    </RoomFrame>
  );
}
