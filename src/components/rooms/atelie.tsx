"use client";

import Image from "next/image";
import { Check } from "lucide-react";
import { useState } from "react";
import { Odometer } from "@/components/motion/odometer";
import { Reveal, SplitReveal } from "@/components/motion/split-reveal";
import { RoomFrame } from "@/components/showroom/room-frame";
import { useRoom, useShowroom } from "@/components/showroom/showroom-context";
import { ShinyButton } from "@/components/ui/shiny-button";
import { carName, cars, getCar } from "@/data/cars";
import { addons, atelierCopy, programs, type Program } from "@/data/packages";
import { formatBRL } from "@/lib/format";
import { cn } from "@/lib/utils";

const priceLabel = (p: { priceBRL: number; priceFrom?: boolean; monthly?: boolean }) =>
  `${p.priceFrom ? "a partir de " : ""}${formatBRL(p.priceBRL)}${p.monthly ? "/mês" : ""}`;

function ProgramColumn({ p, selected, onSelect }: { p: Program; selected: boolean; onSelect: () => void }) {
  const black = p.id === "black-label";
  return (
    <div className={cn("relative flex", black && "shiny-panel")}>
      <button
        type="button"
        role="radio"
        aria-checked={selected}
        onClick={onSelect}
        data-cursor="SELECIONAR"
        className={cn(
          "group relative flex w-full flex-col overflow-hidden px-5 pt-6 pb-6 text-left transition-colors md:px-6",
          selected ? "bg-surface-2/80" : "hover:bg-surface/60",
        )}
      >
        <span
          aria-hidden
          className="t-display t-outline pointer-events-none absolute right-3 -bottom-8 text-[150px] leading-none opacity-30 transition-opacity group-hover:opacity-60 md:text-[200px]"
        >
          {p.numeral}
        </span>
        <span className="t-mono relative text-[10px] text-text-muted">Programa {p.numeral}</span>
        <span className="t-display relative mt-2 text-[clamp(30px,2.6vw,42px)]">{p.name}</span>
        <span className="t-num relative mt-3 text-[15px] text-accent">
          {p.priceFrom ? "a partir de " : ""}
          {formatBRL(p.priceBRL)}
          {p.onRequest ? <span className="ml-2 font-mono text-[10px] tracking-[0.16em] text-text-muted">SOB CONSULTA</span> : null}
        </span>
        <ul className="relative mt-5 flex flex-col gap-2">
          {p.items.map((it) => (
            <li key={it} className="flex gap-3 text-[14px] leading-snug text-text-muted">
              <span aria-hidden className="mt-[0.55em] h-px w-3 shrink-0 bg-accent/70" />
              {it}
            </li>
          ))}
        </ul>
        <span
          className={cn(
            "t-mono relative mt-6 flex items-center gap-2 text-[10px] transition-colors",
            selected ? "text-accent" : "text-text-muted",
          )}
        >
          <span
            aria-hidden
            className={cn("grid h-4 w-4 place-items-center border", selected ? "border-accent bg-accent text-bg" : "border-line-strong")}
          >
            {selected ? <Check className="h-3 w-3" strokeWidth={2.5} /> : null}
          </span>
          {selected ? "Selecionado" : "Selecionar"}
        </span>
      </button>
    </div>
  );
}

export function Atelie() {
  const { mounted } = useRoom();
  const { selectedCar, setSelectedCar, setAtelierSummary, go } = useShowroom();
  const car = getCar(selectedCar);
  const [programId, setProgramId] = useState<Program["id"] | null>("signature");
  const [picked, setPicked] = useState<string[]>([]);

  const program = programs.find((p) => p.id === programId) ?? null;
  const chosen = addons.filter((a) => picked.includes(a.id));
  const monthly = chosen.filter((a) => a.monthly);
  const oneOff = chosen.filter((a) => !a.monthly);

  const total = (car.priceBRL ?? 0) + (program?.priceBRL ?? 0) + oneOff.reduce((s, a) => s + a.priceBRL, 0);

  const toggle = (id: string) => setPicked((v) => (v.includes(id) ? v.filter((x) => x !== id) : [...v, id]));

  const schedule = () => {
    const lines = [
      `${carName(car)} · ${car.priceBRL ? formatBRL(car.priceBRL) : "sob consulta"}`,
      program ? `Programa ${program.numeral} ${program.name} · ${priceLabel(program)}` : "Sem programa",
      ...chosen.map((a) => `${a.name} · ${priceLabel(a)}`),
    ];
    setAtelierSummary({ carSlug: car.slug, programId, addonIds: picked, total, lines });
    go("concierge");
  };

  return (
    <div className="absolute inset-0">
      {mounted ? (
        <div
          aria-hidden
          className="pointer-events-none absolute inset-y-0 right-0 hidden w-[46%] opacity-30 lg:block"
          style={{
            maskImage: "linear-gradient(270deg, #000 10%, transparent 90%)",
            WebkitMaskImage: "linear-gradient(270deg, #000 10%, transparent 90%)",
          }}
        >
          <Image src="/cars/atmosfera/atelie.jpg" alt="" fill sizes="46vw" className="object-cover object-[70%_50%]" />
        </div>
      ) : null}

      <RoomFrame className="flex flex-col gap-8 pb-[40px]">
        <div className="grid gap-6 lg:grid-cols-12 lg:items-end">
          <div className="lg:col-span-7">
            <Reveal i={0}>
              <p className="t-mono text-accent">04 · Ateliê Spike</p>
            </Reveal>
            <SplitReveal id="atelie-title" lines={[atelierCopy.title]} className="t-room mt-4" />
            <Reveal i={2}>
              <p className="t-display mt-3 text-[clamp(22px,2vw,30px)] text-accent-soft italic">{atelierCopy.subtitle}</p>
            </Reveal>
          </div>
          <Reveal i={3} className="lg:col-span-5">
            <p className="t-body">{atelierCopy.intro}</p>
          </Reveal>
        </div>

        {/* Carro (celular; no desktop fica na barra do configurador) */}
        <label className="flex flex-col gap-1 md:hidden">
          <span className="t-mono text-[9px] text-text-muted">Carro</span>
          <select
            value={car.slug}
            onChange={(e) => setSelectedCar(e.target.value)}
            className="min-h-11 border-b border-line-strong bg-transparent font-mono text-[12px] tracking-[0.12em] text-text uppercase outline-none focus-visible:border-accent"
          >
            {cars.map((c) => (
              <option key={c.slug} value={c.slug} className="bg-surface text-text">
                {carName(c)}
              </option>
            ))}
          </select>
        </label>

        {/* Programas */}
        <Reveal i={4}>
          <div
            role="radiogroup"
            aria-label="Programas do Ateliê"
            className="grid grid-cols-1 divide-y divide-line border-y border-line md:grid-cols-3 md:divide-x md:divide-y-0"
          >
            {programs.map((p) => (
              <ProgramColumn key={p.id} p={p} selected={programId === p.id} onSelect={() => setProgramId(programId === p.id ? null : p.id)} />
            ))}
          </div>
        </Reveal>

        {/* Avulsos */}
        <Reveal i={5}>
          <div>
            <h3 className="t-mono text-[10px] text-text-muted">Melhorias avulsas</h3>
            <ul className="mt-3 grid grid-cols-1 border-t border-line md:grid-cols-2 md:gap-x-10">
              {addons.map((a) => {
                const on = picked.includes(a.id);
                return (
                  <li key={a.id} className="border-b border-line">
                    <button
                      type="button"
                      role="switch"
                      aria-checked={on}
                      onClick={() => toggle(a.id)}
                      className="flex min-h-14 w-full items-center gap-4 py-3 text-left"
                      data-cursor={on ? "REMOVER" : "ADICIONAR"}
                    >
                      <span
                        aria-hidden
                        className={cn(
                          "relative h-5 w-9 shrink-0 rounded-full border transition-colors",
                          on ? "border-accent bg-accent/25" : "border-line-strong",
                        )}
                      >
                        <span
                          className={cn(
                            "absolute top-1/2 left-0.5 h-3.5 w-3.5 -translate-y-1/2 rounded-full transition-transform duration-300",
                            on ? "translate-x-4 bg-accent" : "bg-text-muted",
                          )}
                        />
                      </span>
                      <span className="min-w-0 flex-1">
                        <span className="block text-[15px] text-text">{a.name}</span>
                        <span className="block text-[13px] text-text-muted">{a.detail}</span>
                      </span>
                      <span className="t-num shrink-0 text-right text-[13px] text-accent">{priceLabel(a)}</span>
                    </button>
                  </li>
                );
              })}
            </ul>
            <p className="mt-4 font-mono text-[10px] tracking-[0.1em] text-text-muted">{atelierCopy.disclaimer}</p>
          </div>
        </Reveal>

        {/* Configurador com preço vivo */}
        <div className="sticky bottom-[64px] z-20 -mx-[var(--gutter)] mt-2 border-t border-line-strong bg-[rgba(12,12,12,0.94)] px-[var(--gutter)] py-4 backdrop-blur-md sm:bottom-[92px] lg:mx-0 lg:border lg:px-6">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
            <div className="hidden flex-wrap items-end gap-x-6 gap-y-3 md:flex">
              <label className="flex flex-col gap-1">
                <span className="t-mono text-[9px] text-text-muted">Carro</span>
                <select
                  value={car.slug}
                  onChange={(e) => setSelectedCar(e.target.value)}
                  className="min-h-11 border-b border-line-strong bg-transparent pr-6 font-mono text-[12px] tracking-[0.12em] text-text uppercase outline-none focus-visible:border-accent"
                >
                  {cars.map((c) => (
                    <option key={c.slug} value={c.slug} className="bg-surface text-text">
                      {carName(c)}
                    </option>
                  ))}
                </select>
              </label>
              <div className="flex flex-col gap-1 lg:hidden 2xl:flex">
                <span className="t-mono text-[9px] text-text-muted">Programa · avulsos</span>
                <span className="font-mono text-[12px] tracking-[0.12em] text-text uppercase">
                  {program ? program.name : "Nenhum"} · {chosen.length} {chosen.length === 1 ? "item" : "itens"}
                </span>
              </div>
            </div>
            <div className="flex flex-wrap items-end justify-between gap-x-6 gap-y-3 lg:flex-nowrap lg:items-center">
              <div>
                <span className="t-mono text-[9px] text-text-muted">Total estimado</span>
                <div className="mt-1 text-[clamp(22px,2.2vw,32px)] text-accent" aria-live="polite">
                  <Odometer value={formatBRL(total)} />
                </div>
                <p className="mt-1 max-w-[40ch] font-mono text-[9px] tracking-[0.12em] text-text-muted">
                  {atelierCopy.paymentNote.join(" · ")}
                  {!car.priceBRL ? " · Carro sob consulta, não incluído" : ""}
                  {monthly.length ? ` · + ${formatBRL(monthly.reduce((s, a) => s + a.priceBRL, 0))}/mês` : ""}
                </p>
              </div>
              <ShinyButton onClick={schedule} cursor="AGENDAR">
                Agendar com esta configuração
              </ShinyButton>
            </div>
          </div>
        </div>
      </RoomFrame>
    </div>
  );
}
