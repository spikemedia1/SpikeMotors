"use client";

import { AnimatePresence, motion } from "motion/react";
import { X } from "lucide-react";
import { useEffect, useRef, useSyncExternalStore } from "react";
import { createPortal } from "react-dom";
import { useReducedMotion } from "@/lib/hooks";

const subscribeNoop = () => () => {};

/** Gaveta lateral (portal no body). Esc fecha; foco vai para o botão de fechar e volta ao gatilho. */
export function Drawer({
  open,
  onClose,
  title,
  children,
}: {
  open: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
}) {
  const reduced = useReducedMotion();
  const closeRef = useRef<HTMLButtonElement>(null);
  const returnTo = useRef<HTMLElement | null>(null);
  const isClient = useSyncExternalStore(subscribeNoop, () => true, () => false);

  useEffect(() => {
    if (!open) return;
    returnTo.current = document.activeElement as HTMLElement | null;
    const t = window.setTimeout(() => closeRef.current?.focus(), 50);
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => {
      window.clearTimeout(t);
      window.removeEventListener("keydown", onKey);
      returnTo.current?.focus?.({ preventScroll: true });
    };
  }, [open, onClose]);

  if (!isClient) return null;

  return createPortal(
    <AnimatePresence>
      {open ? (
        <motion.div className="fixed inset-0 z-[85]" initial={{ opacity: 1 }} exit={{ opacity: 1 }}>
          <motion.button
            type="button"
            aria-label="Fechar"
            tabIndex={-1}
            className="absolute inset-0 bg-bg/70 backdrop-blur-sm"
            onClick={onClose}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: reduced ? 0 : 0.3 }}
          />
          <motion.aside
            role="dialog"
            aria-modal="true"
            aria-label={title}
            data-room-scroll
            className="absolute inset-y-0 right-0 w-full max-w-[640px] overflow-y-auto overscroll-contain border-l border-line bg-surface"
            initial={{ x: reduced ? 0 : "100%", opacity: reduced ? 0 : 1 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: reduced ? 0 : "100%", opacity: reduced ? 0 : 1 }}
            transition={{ duration: reduced ? 0.2 : 0.6, ease: [0.76, 0, 0.24, 1] }}
          >
            <div className="sticky top-0 z-10 flex items-center justify-between border-b border-line bg-surface/95 px-6 py-4 backdrop-blur md:px-10">
              <span className="t-mono text-text-muted">{title}</span>
              <button
                ref={closeRef}
                type="button"
                onClick={onClose}
                className="grid h-11 w-11 place-items-center text-text transition-colors hover:text-accent"
                aria-label="Fechar ficha"
                data-cursor="FECHAR"
              >
                <X className="h-5 w-5" strokeWidth={1.5} aria-hidden />
              </button>
            </div>
            <div className="px-6 pt-8 pb-16 md:px-10">{children}</div>
          </motion.aside>
        </motion.div>
      ) : null}
    </AnimatePresence>,
    document.body,
  );
}
