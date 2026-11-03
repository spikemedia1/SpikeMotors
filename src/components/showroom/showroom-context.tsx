"use client";

import { createContext, useContext } from "react";
import type { RoomId } from "@/data/rooms";

export type AtelierSummary = {
  carSlug: string;
  programId: string | null;
  addonIds: string[];
  total: number;
  lines: string[];
};

export type ShowroomState = {
  activeRoom: RoomId;
  /** Sala que está entrando durante o obturador (para pré-montar widgets). */
  pendingRoom: RoomId | null;
  go: (room: RoomId) => void;
  selectedCar: string;
  setSelectedCar: (slug: string) => void;
  atelierSummary: AtelierSummary | null;
  setAtelierSummary: (s: AtelierSummary | null) => void;
  soundOn: boolean;
  setSoundOn: (on: boolean) => void;
  ignited: boolean;
  /** Abre/fecha gavetas: Esc fecha a de cima. */
  drawerOpen: boolean;
  setDrawerOpen: (open: boolean) => void;
};

export const ShowroomContext = createContext<ShowroomState | null>(null);

export function useShowroom(): ShowroomState {
  const ctx = useContext(ShowroomContext);
  if (!ctx) throw new Error("useShowroom fora do ShowroomProvider");
  return ctx;
}

/** Contexto por sala: se está ativa e se deve montar widgets pesados. */
/** active: conteúdo revelado; current: é a sala atual (mesmo sob o obturador); mounted: ativa ou vizinha. */
export type RoomCtx = { active: boolean; current: boolean; mounted: boolean };
export const RoomContext = createContext<RoomCtx>({ active: false, current: false, mounted: false });
export const useRoom = () => useContext(RoomContext);
