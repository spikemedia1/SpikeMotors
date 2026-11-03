"use client";

import type { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

/* A3 · Dock — navegação principal. Só Dock + DockIcon do original; sem getComputedStyle
   no render; classes Tailwind 4; tooltips em PT; estado ativo com aria-current. */

export function Dock({ children, className, label }: { children: React.ReactNode; className?: string; label: string }) {
  return (
    <nav aria-label={label} className={cn("pointer-events-auto", className)}>
      <ul
        className={cn(
          "flex items-center justify-between gap-1 bg-[rgba(17,17,17,0.72)] px-2 py-2 ring-1 ring-line backdrop-blur-lg",
          "rounded-none sm:gap-3 sm:rounded-[28px] sm:px-4 sm:py-2.5 lg:gap-4",
          "shadow-[0_20px_60px_-20px_rgba(0,0,0,0.8)]",
        )}
      >
        {children}
      </ul>
    </nav>
  );
}

export function DockSeparator() {
  return <li aria-hidden className="mx-0.5 h-6 w-px bg-line-strong sm:mx-1" />;
}

export function DockIcon({
  icon: Icon,
  label,
  badge,
  active = false,
  pressed,
  onClick,
  cursor = "VER",
}: {
  icon: LucideIcon;
  label: string;
  badge?: string;
  active?: boolean;
  /** Para botões de alternância (som). */
  pressed?: boolean;
  onClick?: () => void;
  cursor?: string;
}) {
  return (
    <li className="relative flex">
      <button
        type="button"
        onClick={onClick}
        aria-label={label}
        aria-current={active ? "page" : undefined}
        aria-pressed={pressed}
        data-cursor={cursor}
        className={cn(
          "hover-halo group relative grid h-11 w-11 place-items-center rounded-xl ring-1 ring-line",
          "bg-linear-to-b from-[rgba(38,38,38,0.6)] to-[rgba(17,17,17,0.7)] backdrop-blur-xl",
          "transition-transform duration-200 hover:-translate-y-1 hover:scale-[1.05] sm:h-12 sm:w-12",
          active && "ring-[rgba(200,183,139,0.35)]",
        )}
      >
        <Icon
          aria-hidden
          className={cn(
            "h-[18px] w-[18px] transition-transform duration-200 group-hover:scale-110 sm:h-5 sm:w-5",
            active ? "text-accent" : pressed ? "text-signal" : "text-[rgba(243,239,230,0.8)]",
          )}
          strokeWidth={1.8}
        />
        {badge ? (
          <span
            aria-hidden
            className="absolute -top-1.5 -right-2 bg-signal px-1 py-px font-mono text-[8px] leading-none font-medium tracking-[0.12em] text-bg"
          >
            {badge}
          </span>
        ) : null}
        <span
          aria-hidden
          className={cn(
            "absolute -bottom-[3px] left-1/2 h-px w-4 -translate-x-1/2 bg-accent transition-opacity",
            active ? "opacity-100" : "opacity-0",
          )}
        />
        <span
          aria-hidden
          data-active={active}
          className="dock-tooltip pointer-events-none absolute -top-7 left-1/2 hidden -translate-x-1/2 font-mono text-[10px] tracking-[0.18em] whitespace-nowrap text-text uppercase sm:block"
        >
          {label}
        </span>
      </button>
    </li>
  );
}
