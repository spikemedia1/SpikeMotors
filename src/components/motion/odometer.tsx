"use client";

import { useReducedMotion } from "@/lib/hooks";
import { cn } from "@/lib/utils";

const DIGITS = ["0", "1", "2", "3", "4", "5", "6", "7", "8", "9"];

/**
 * Odômetro: cada dígito é uma coluna 0–9 que rola verticalmente; colunas com atraso
 * de 40ms (da direita para a esquerda). Caracteres não numéricos ficam estáticos.
 * As colunas são indexadas a partir da direita para manter o alinhamento quando o
 * número muda de tamanho.
 */
export function Odometer({ value, className, label }: { value: string; className?: string; label?: string }) {
  const reduced = useReducedMotion();
  const chars = value.split("");
  const n = chars.length;
  return (
    <span className={cn("t-num inline-flex overflow-hidden leading-none", className)}>
      <span className="sr-only">{label ?? value}</span>
      {chars.map((ch, i) => {
        const fromRight = n - 1 - i;
        const d = DIGITS.indexOf(ch);
        if (d < 0) {
          return (
            <span key={`s-${fromRight}`} aria-hidden className="inline-block whitespace-pre">
              {ch}
            </span>
          );
        }
        return (
          <span key={`d-${fromRight}`} aria-hidden className="relative inline-block h-[1em] overflow-hidden">
            <span className="invisible">0</span>
            <span
              className="absolute inset-x-0 top-0 flex flex-col"
              style={{
                transform: `translateY(${-d * 10}%)`,
                transition: reduced ? "none" : `transform 900ms cubic-bezier(0.22, 1, 0.36, 1) ${fromRight * 40}ms`,
              }}
            >
              {DIGITS.map((x) => (
                <span key={x} className="block h-[1em] text-center">
                  {x}
                </span>
              ))}
            </span>
          </span>
        );
      })}
    </span>
  );
}
