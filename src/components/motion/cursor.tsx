"use client";

import { motion, useMotionValue, useSpring } from "motion/react";
import { useEffect, useState } from "react";
import { useFinePointer, useReducedMotion } from "@/lib/hooks";

const TEXT_FIELDS = "input, textarea, select, [contenteditable]";

/** Cursor-lente: anel de 28px que cresce para 64px sobre interativos e mostra a ação. */
export function Cursor() {
  const fine = useFinePointer();
  const reduced = useReducedMotion();
  const enabled = fine && !reduced;

  const x = useMotionValue(-100);
  const y = useMotionValue(-100);
  const sx = useSpring(x, { stiffness: 500, damping: 40, mass: 0.5 });
  const sy = useSpring(y, { stiffness: 500, damping: 40, mass: 0.5 });
  const [label, setLabel] = useState<string | null>(null);
  const [hidden, setHidden] = useState(true);
  const [down, setDown] = useState(false);

  useEffect(() => {
    if (!enabled) return;
    const root = document.documentElement;
    root.classList.add("has-custom-cursor");

    const move = (e: PointerEvent) => {
      if (e.pointerType !== "mouse") return;
      x.set(e.clientX);
      y.set(e.clientY);
      const t = e.target as Element | null;
      const inMain = !!t?.closest("main");
      const field = !!t?.closest(TEXT_FIELDS);
      setHidden(!inMain || field);
      const target = t?.closest<HTMLElement>("[data-cursor], a, button, [role='button'], label");
      if (!target) return setLabel(null);
      setLabel(target.dataset.cursor ?? "SELECIONAR");
    };
    const leave = () => setHidden(true);
    const pd = () => setDown(true);
    const pu = () => setDown(false);

    window.addEventListener("pointermove", move, { passive: true });
    document.addEventListener("pointerleave", leave);
    window.addEventListener("pointerdown", pd);
    window.addEventListener("pointerup", pu);
    return () => {
      root.classList.remove("has-custom-cursor");
      window.removeEventListener("pointermove", move);
      document.removeEventListener("pointerleave", leave);
      window.removeEventListener("pointerdown", pd);
      window.removeEventListener("pointerup", pu);
    };
  }, [enabled, x, y]);

  if (!enabled) return null;

  const big = !!label;
  return (
    <motion.div
      aria-hidden
      className="pointer-events-none fixed top-0 left-0 z-[120]"
      style={{ x: sx, y: sy }}
    >
      <motion.div
        className="flex -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full border"
        style={{ width: 64, height: 64 }}
        animate={{
          scale: hidden ? 0 : (big ? 1 : 28 / 64) * (down ? 0.88 : 1),
          borderColor: big ? "rgba(200,183,139,0.8)" : "rgba(243,239,230,0.35)",
          backgroundColor: big ? "rgba(8,8,8,0.35)" : "rgba(8,8,8,0)",
        }}
        transition={{ type: "spring", stiffness: 380, damping: 30 }}
      >
        <span
          className="font-mono text-[9px] tracking-[0.2em] text-accent-soft uppercase transition-opacity"
          style={{ opacity: big ? 1 : 0 }}
        >
          {label}
        </span>
      </motion.div>
      <span
        className="absolute top-0 left-0 h-1 w-1 -translate-x-1/2 -translate-y-1/2 rounded-full bg-text"
        style={{ opacity: hidden ? 0 : 1 }}
      />
    </motion.div>
  );
}
