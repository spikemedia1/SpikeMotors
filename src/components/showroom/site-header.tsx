"use client";

import { Logo } from "@/components/brand/logo";
import { site } from "@/data/config";
import { useShowroom } from "./showroom-context";

export function SiteHeader() {
  const { go } = useShowroom();
  return (
    <header className="pointer-events-none fixed inset-x-0 top-0 z-50 flex h-[72px] items-center justify-between px-[var(--gutter)]">
      <button
        type="button"
        onClick={() => go("salao")}
        className="pointer-events-auto -m-2 p-2"
        aria-label="Spike Motors, voltar ao Salão"
        data-cursor="SALÃO"
      >
        <Logo size={17} />
      </button>
      <div className="pointer-events-auto flex items-center gap-6">
        <span className="t-mono hidden text-[10px] text-text-muted md:inline">{site.headerLabel}</span>
        <button
          type="button"
          onClick={() => go("concierge")}
          className="group flex min-h-11 items-center gap-2 font-body text-[13px] text-text"
          data-cursor="AGENDAR"
        >
          <span className="border-b border-transparent pb-px transition-colors group-hover:border-accent">Agendar visita</span>
          <span aria-hidden className="text-accent transition-transform group-hover:translate-x-0.5">→</span>
        </button>
      </div>
    </header>
  );
}
