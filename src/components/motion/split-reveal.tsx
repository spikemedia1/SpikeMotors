"use client";

import { motion } from "motion/react";
import { useRoom } from "@/components/showroom/showroom-context";
import { useReducedMotion } from "@/lib/hooks";
import { cn } from "@/lib/utils";

const EASE = [0.22, 1, 0.36, 1] as const;

/**
 * Split Reveal: cada linha sobe de dentro de uma máscara e o tracking comprime
 * de 0.04em para -0.02em. Dispara quando a sala fica ativa.
 */
export function SplitReveal({
  lines,
  italic = [],
  as: Tag = "h2",
  id,
  className,
  delay = 0.1,
}: {
  lines: readonly string[];
  /** Índices das linhas em itálico. */
  italic?: number[];
  as?: "h1" | "h2" | "h3";
  id?: string;
  className?: string;
  delay?: number;
}) {
  const { active } = useRoom();
  const reduced = useReducedMotion();
  const show = active || reduced;

  return (
    <Tag id={id} tabIndex={-1} data-room-title className={cn("t-display outline-none", className)}>
      {lines.map((line, i) => (
        <span key={i} className="block overflow-hidden pb-[0.08em]">
          <motion.span
            className={cn("block", italic.includes(i) && "italic text-accent-soft")}
            initial={false}
            animate={
              show
                ? { y: "0%", letterSpacing: "-0.02em", opacity: 1 }
                : { y: "105%", letterSpacing: "0.04em", opacity: 0 }
            }
            transition={{ duration: reduced ? 0 : 1, ease: EASE, delay: show && !reduced ? delay + i * 0.09 : 0 }}
          >
            {line}
          </motion.span>
        </span>
      ))}
    </Tag>
  );
}

/** Stagger simples (60ms) para o conteúdo que entra com a sala. */
export function Reveal({
  children,
  i = 0,
  className,
  y = 18,
}: {
  children: React.ReactNode;
  i?: number;
  className?: string;
  y?: number;
}) {
  const { active } = useRoom();
  const reduced = useReducedMotion();
  const show = active || reduced;
  return (
    <motion.div
      className={className}
      initial={false}
      animate={show ? { opacity: 1, y: 0 } : { opacity: 0, y }}
      transition={{ duration: reduced ? 0 : 0.7, ease: EASE, delay: show && !reduced ? 0.25 + i * 0.06 : 0 }}
    >
      {children}
    </motion.div>
  );
}
