"use client";

import { AnimatePresence, motion } from "motion/react";

export type ShutterPhase = "idle" | "closing" | "hold" | "opening";

export const SHUTTER = { close: 340, hold: 250, open: 340 } as const;
const EASE = [0.76, 0, 0.24, 1] as const;

/** Obturador: duas lâminas #080808 com filete champagne e numeral outline no centro. */
export function Shutter({ phase, num, name }: { phase: ShutterPhase; num: string; name: string }) {
  const closed = phase === "closing" || phase === "hold";
  const visible = phase !== "idle";

  return (
    <div aria-hidden className="pointer-events-none fixed inset-0 z-[80]" style={{ visibility: visible ? "visible" : "hidden" }}>
      <motion.div
        className="absolute inset-x-0 top-0 h-1/2 bg-bg"
        initial={{ y: "-101%" }}
        animate={{ y: closed ? "0%" : "-101%" }}
        transition={{ duration: (closed ? SHUTTER.close : SHUTTER.open) / 1000, ease: EASE }}
      >
        <span className="absolute inset-x-0 bottom-0 h-px bg-accent/80" />
      </motion.div>
      <motion.div
        className="absolute inset-x-0 bottom-0 h-1/2 bg-bg"
        initial={{ y: "101%" }}
        animate={{ y: closed ? "0%" : "101%" }}
        transition={{ duration: (closed ? SHUTTER.close : SHUTTER.open) / 1000, ease: EASE }}
      >
        <span className="absolute inset-x-0 top-0 h-px bg-accent/80" />
      </motion.div>

      <AnimatePresence>
        {phase === "hold" ? (
          <motion.div
            key={num}
            className="absolute inset-0 flex flex-col items-center justify-center"
            initial={{ opacity: 0, scale: 1.04 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.98 }}
            transition={{ duration: 0.16 }}
          >
            <span className="t-display t-outline text-[110px] leading-none md:text-[160px]">{num}</span>
            <span className="t-mono mt-4 text-accent">{name}</span>
          </motion.div>
        ) : null}
      </AnimatePresence>
    </div>
  );
}
