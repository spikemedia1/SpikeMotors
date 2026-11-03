"use client";

import Image from "next/image";
import { animate, useMotionValue, useMotionValueEvent } from "motion/react";
import { useEffect, useRef, useState } from "react";
import { useReducedMotion } from "@/lib/hooks";
import { cn } from "@/lib/utils";

/**
 * Headlight Reveal: a imagem começa quase apagada (brightness 0.12) e uma faixa de luz
 * diagonal (máscara linear animada de -30% a 130%) atravessa revelando-a em 1,6s.
 * Opcional: brilho especular periódico (a cada 9s).
 */
export function HeadlightReveal({
  src,
  alt,
  sizes,
  priority = false,
  trigger,
  className,
  imgClassName,
  specular = false,
  angle = 105,
  duration = 1.6,
}: {
  src: string;
  alt: string;
  sizes: string;
  priority?: boolean;
  /** Dispara a revelação (a primeira vez que vira true). */
  trigger: boolean;
  className?: string;
  imgClassName?: string;
  specular?: boolean;
  angle?: number;
  duration?: number;
}) {
  const reduced = useReducedMotion();
  const p = useMotionValue(-30);
  const litRef = useRef<HTMLDivElement>(null);
  const bandRef = useRef<HTMLDivElement>(null);
  const [done, setDone] = useState(false);
  const played = useRef(false);

  const paint = (v: number) => {
    const mask = `linear-gradient(${angle}deg, #000 ${v - 22}%, rgba(0,0,0,0.6) ${v - 8}%, transparent ${v + 4}%)`;
    if (litRef.current) {
      litRef.current.style.maskImage = mask;
      litRef.current.style.webkitMaskImage = mask;
    }
    if (bandRef.current) {
      bandRef.current.style.background = `linear-gradient(${angle}deg, transparent ${v - 14}%, rgba(230,217,181,0.16) ${v - 3}%, transparent ${v + 6}%)`;
    }
  };
  useMotionValueEvent(p, "change", paint);

  useEffect(() => {
    if (!trigger || played.current) return;
    played.current = true;
    if (reduced) {
      p.set(200);
      setDone(true);
      return;
    }
    const controls = animate(p, 130, { duration, ease: [0.45, 0, 0.2, 1], onComplete: () => setDone(true) });
    return () => controls.stop();
  }, [trigger, reduced, p, duration]);

  return (
    <div className={cn("relative overflow-hidden", className)}>
      <Image
        src={src}
        alt=""
        aria-hidden
        fill
        sizes={sizes}
        priority={priority}
        className={cn("object-cover", imgClassName)}
        style={{ filter: "brightness(0.12) saturate(0.6)" }}
      />
      <div
        ref={litRef}
        className="absolute inset-0"
        style={
          done
            ? undefined
            : {
                maskImage: "linear-gradient(105deg, #000 -52%, transparent -26%)",
                WebkitMaskImage: "linear-gradient(105deg, #000 -52%, transparent -26%)",
              }
        }
      >
        <Image src={src} alt={alt} fill sizes={sizes} priority={priority} className={cn("object-cover", imgClassName)} />
      </div>
      {!done ? <div ref={bandRef} aria-hidden className="pointer-events-none absolute inset-0 mix-blend-screen" /> : null}
      {specular && done && !reduced ? (
        <div aria-hidden className="pointer-events-none absolute inset-0 overflow-hidden mix-blend-screen">
          <div
            className="absolute inset-y-0 left-0 w-1/3"
            style={{
              background: "linear-gradient(90deg, transparent, rgba(243,239,230,0.10), transparent)",
              animation: "specular 9s cubic-bezier(0.45,0,0.2,1) 1.5s infinite",
              transform: "translateX(-120%) skewX(-18deg)",
            }}
          />
        </div>
      ) : null}
    </div>
  );
}
