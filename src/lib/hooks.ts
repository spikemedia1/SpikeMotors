"use client";

import { useEffect, useRef, useSyncExternalStore } from "react";

function subscribeMedia(query: string) {
  return (cb: () => void) => {
    const mql = window.matchMedia(query);
    mql.addEventListener("change", cb);
    return () => mql.removeEventListener("change", cb);
  };
}

/** Media query segura para SSR (no servidor devolve `serverValue`). */
export function useMediaQuery(query: string, serverValue = false): boolean {
  return useSyncExternalStore(
    subscribeMedia(query),
    () => window.matchMedia(query).matches,
    () => serverValue,
  );
}

export const useReducedMotion = () => useMediaQuery("(prefers-reduced-motion: reduce)");
export const useFinePointer = () => useMediaQuery("(hover: hover) and (pointer: fine)");
export const useIsMobile = () => useMediaQuery("(max-width: 767px)");
export const useIsDesktop = () => useMediaQuery("(min-width: 1024px)");

/** Guarda o último valor numa ref (para callbacks de rAF sem recriar efeitos). */
export function useLatest<T>(value: T) {
  const ref = useRef(value);
  useEffect(() => {
    ref.current = value;
  });
  return ref;
}

/** Hidratação concluída (evita divergência servidor/cliente em valores do navegador). */
export function useHydrated(): boolean {
  return useSyncExternalStore(
    () => () => {},
    () => true,
    () => false,
  );
}
