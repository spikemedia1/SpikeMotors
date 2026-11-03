"use client";

import { AnimatePresence, motion, useMotionValue, useSpring } from "motion/react";
import { useEffect, useState } from "react";
import { HeadlightReveal } from "@/components/motion/headlight-reveal";
import { Reveal, SplitReveal } from "@/components/motion/split-reveal";
import { RoomFrame } from "@/components/showroom/room-frame";
import { useRoom, useShowroom } from "@/components/showroom/showroom-context";
import { ShinyButton } from "@/components/ui/shiny-button";
import Velaris from "@/components/ui/velaris";
import { cars } from "@/data/cars";
import { salaoCopy } from "@/data/content";
import { quotes } from "@/data/quotes";
import { formatDec, formatInt } from "@/lib/format";
import { useFinePointer, useReducedMotion } from "@/lib/hooks";

const SALAO_COLORS = ["#C8B78B", "#4A4030", "#1C1C1C", "#8F999F"];

const ticker = cars.map(
  (c) =>
    `${c.brand} ${c.model} · 0–100 em ${formatDec(c.zeroToHundred)}s · ${formatInt(c.powerCv)} cv · ${c.engine}`,
);

function Ticker({ running }: { running: boolean }) {
  const [i, setI] = useState(0);
  useEffect(() => {
    if (!running) return;
    const t = window.setInterval(() => setI((v) => (v + 1) % ticker.length), 3000);
    return () => window.clearInterval(t);
  }, [running]);
  return (
    <div className="flex items-center gap-3" aria-label="Destaques da coleção">
      <span className="live-dot shrink-0" aria-hidden />
      <div className="relative h-5 min-w-0 flex-1 overflow-hidden">
        <AnimatePresence mode="popLayout" initial={false}>
          <motion.p
            key={i}
            className="t-mono absolute inset-x-0 truncate text-[10px] text-text-muted md:text-right"
            initial={{ y: 14, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: -14, opacity: 0 }}
            transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
          >
            {ticker[i]}
          </motion.p>
        </AnimatePresence>
      </div>
    </div>
  );
}

export function Salao() {
  const { active, current } = useRoom();
  const { go } = useShowroom();
  const fine = useFinePointer();
  const reduced = useReducedMotion();
  const parallax = fine && !reduced;

  const mx = useMotionValue(0);
  const my = useMotionValue(0);
  const carX = useSpring(mx, { stiffness: 60, damping: 20 });
  const carY = useSpring(my, { stiffness: 60, damping: 20 });
  const tx = useSpring(useMotionValue(0), { stiffness: 60, damping: 20 });
  const ty = useSpring(useMotionValue(0), { stiffness: 60, damping: 20 });

  const onMove = (e: React.PointerEvent) => {
    if (!parallax) return;
    const nx = e.clientX / window.innerWidth - 0.5;
    const ny = e.clientY / window.innerHeight - 0.5;
    mx.set(nx * 24); // ±12px
    my.set(ny * 24);
    tx.set(-nx * 12); // ±6px, direção oposta
    ty.set(-ny * 12);
  };

  return (
    <div className="absolute inset-0" onPointerMove={onMove}>
      {/* Atmosfera: Velaris coberto por #080808 a 55% */}
      <div className="absolute inset-0" aria-hidden>
        {current ? (
          <Velaris bg="#080808" colors={SALAO_COLORS} speed={0.6} grain={0.35} active={active} />
        ) : null}
        <div className="absolute inset-0 bg-bg/55" />
      </div>

      {/* Carro hero */}
      <motion.div
        className="absolute inset-y-0 right-0 w-full md:w-[82%]"
        style={{
          ...(parallax ? { x: carX, y: carY } : {}),
          maskImage: "radial-gradient(ellipse 70% 80% at 62% 55%, #000 40%, transparent 100%)",
          WebkitMaskImage: "radial-gradient(ellipse 70% 80% at 62% 55%, #000 40%, transparent 100%)",
        }}
      >
        <HeadlightReveal
          src="/cars/atmosfera/hero.jpg"
          alt="Coupé escuro iluminado apenas pelo farol, em estúdio sem luz"
          sizes="(max-width: 767px) 100vw, 78vw"
          priority
          trigger={active}
          specular
          className="absolute -inset-3"
          imgClassName="object-[44%_60%] md:object-[58%_55%]"
        />
        <div
          aria-hidden
          className="absolute inset-0"
          style={{
            background:
              "linear-gradient(90deg, rgba(8,8,8,0.75) 0%, rgba(8,8,8,0) 45%), linear-gradient(0deg, rgba(8,8,8,0.6) 0%, rgba(8,8,8,0) 35%)",
          }}
        />
      </motion.div>

      <RoomFrame className="flex flex-col justify-between gap-8">
        <motion.div className="mt-[3vh] md:mt-[5vh]" style={parallax ? { x: tx, y: ty } : undefined}>
          <Reveal i={0}>
            <p className="t-mono mb-5 text-accent">01 · Salão</p>
          </Reveal>
          <SplitReveal as="h1" id="salao-title" lines={salaoCopy.titleLines} italic={[1]} className="t-hero" />
          <Reveal i={3}>
            <p className="t-body mt-6 max-w-[44ch]">{salaoCopy.subtitle}</p>
          </Reveal>
          <Reveal i={4}>
            <div className="mt-8 flex flex-wrap items-center gap-x-8 gap-y-5">
              <ShinyButton size="lg" onClick={() => go("colecao")} cursor="ENTRAR">
                {salaoCopy.ctaPrimary}
              </ShinyButton>
              <button
                type="button"
                onClick={() => go("concierge")}
                className="group flex min-h-11 items-center gap-2 text-[15px] text-text"
                data-cursor="AGENDAR"
              >
                <span className="border-b border-line-strong pb-0.5 transition-colors group-hover:border-accent">
                  {salaoCopy.ctaSecondary}
                </span>
                <span aria-hidden className="text-accent transition-transform group-hover:translate-x-1">
                  →
                </span>
              </button>
            </div>
          </Reveal>
        </motion.div>

        <div className="grid gap-8 md:grid-cols-[minmax(0,26rem)_1fr] md:items-end">
          <Reveal i={6}>
            <figure className="border-l border-accent/70 pl-5">
              <blockquote className="t-display text-[22px] leading-[1.15] text-text italic md:text-[26px]">
                “{quotes.salao.text}”
              </blockquote>
              <figcaption className="t-mono mt-3 text-[10px] text-text-muted">
                — {quotes.salao.attribution}, {quotes.salao.role}
              </figcaption>
            </figure>
          </Reveal>
          <Reveal i={7} className="md:justify-self-end md:w-[min(100%,34rem)]">
            <Ticker running={active} />
          </Reveal>
        </div>
      </RoomFrame>
    </div>
  );
}
