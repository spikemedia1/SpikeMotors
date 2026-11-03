"use client";

import { roomIndex, rooms } from "@/data/rooms";
import { cn } from "@/lib/utils";
import { useShowroom } from "./showroom-context";

/** Trilho lateral: 01…06 em mono; o ativo cresce para "01 — SALÃO". Some abaixo de 1024px. */
export function SideRail() {
  const { activeRoom, go } = useShowroom();
  const idx = roomIndex(activeRoom);
  return (
    <nav
      aria-label="Salas (trilho)"
      className="fixed top-1/2 left-[clamp(16px,2.2vw,36px)] z-40 hidden -translate-y-1/2 lg:flex"
    >
      <div aria-hidden className="relative mr-4 w-px bg-line">
        <span
          className="absolute inset-x-0 top-0 h-full origin-top bg-accent transition-transform duration-700"
          style={{ transform: `scaleY(${(idx + 1) / rooms.length})`, transitionTimingFunction: "var(--ease-shutter)" }}
        />
      </div>
      <ol className="flex flex-col gap-1">
        {rooms.map((r) => {
          const active = r.id === activeRoom;
          return (
            <li key={r.id}>
              <button
                type="button"
                onClick={() => go(r.id)}
                aria-current={active ? "page" : undefined}
                aria-label={`${r.num} ${r.name}`}
                data-cursor="IR"
                className={cn(
                  "flex min-h-8 items-center font-mono text-[11px] tracking-[0.22em] uppercase transition-colors",
                  active ? "text-text" : "text-text-muted hover:text-text",
                )}
              >
                <span className="tabular-nums">{r.num}</span>
                <span
                  className={cn(
                    "whitespace-nowrap transition-[clip-path,opacity] duration-500",
                    active ? "opacity-100 [clip-path:inset(0_0_0_0)]" : "opacity-0 [clip-path:inset(0_100%_0_0)]",
                  )}
                >
                  <span className="text-accent">&nbsp;—&nbsp;</span>
                  {r.name}
                </span>
              </button>
            </li>
          );
        })}
      </ol>
    </nav>
  );
}
