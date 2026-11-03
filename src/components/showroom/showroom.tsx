"use client";

import { motion } from "motion/react";
import { useCallback, useEffect, useLayoutEffect, useMemo, useRef, useState } from "react";
import { cars } from "@/data/cars";
import { isRoomId, roomIndex, rooms, type RoomId } from "@/data/rooms";
import { Cursor } from "@/components/motion/cursor";
import { SHUTTER, Shutter, type ShutterPhase } from "@/components/motion/room-transition";
import { useLatest, useReducedMotion } from "@/lib/hooks";
import { cn } from "@/lib/utils";
import { SiteHeader } from "./site-header";
import { SideRail } from "./side-rail";
import { SiteDock } from "./site-dock";
import { Ignition } from "@/components/rooms/ignicao";
import {
  RoomContext,
  ShowroomContext,
  type AtelierSummary,
  type ShowroomState,
} from "./showroom-context";

const WHEEL_LOCK_MS = 900;
const WHEEL_THRESHOLD = 40;
const SWIPE_THRESHOLD = 60;

/** Contêiner rolável da sala ativa que ainda pode rolar na direção pedida. */
function canScrollInside(target: EventTarget | null, dir: 1 | -1): boolean {
  let el = target instanceof Element ? target : null;
  while (el && !el.hasAttribute("data-room")) {
    if (el instanceof HTMLElement) {
      const style = getComputedStyle(el);
      const scrollable = /(auto|scroll)/.test(style.overflowY) && el.scrollHeight > el.clientHeight + 1;
      if (scrollable) {
        if (dir > 0 && el.scrollTop + el.clientHeight < el.scrollHeight - 2) return true;
        if (dir < 0 && el.scrollTop > 2) return true;
      }
    }
    el = el.parentElement;
  }
  return false;
}

const isTypingTarget = (t: EventTarget | null) =>
  t instanceof Element && !!t.closest("input, textarea, select, [contenteditable], [data-keys-local]");

export function Showroom({ content }: { content: Record<RoomId, React.ReactNode> }) {
  const reduced = useReducedMotion();
  const [activeRoom, setActiveRoom] = useState<RoomId>("salao");
  const [leavingRoom, setLeavingRoom] = useState<RoomId | null>(null);
  const [pendingRoom, setPendingRoom] = useState<RoomId | null>(null);
  const [phase, setPhase] = useState<ShutterPhase>("idle");
  const [shutterLabel, setShutterLabel] = useState({ num: "01", name: "Salão" });
  const [ignited, setIgnited] = useState(false);
  const [selectedCar, setSelectedCar] = useState(cars[0].slug);
  const [atelierSummary, setAtelierSummary] = useState<AtelierSummary | null>(null);
  const [soundOn, setSoundOn] = useState(false);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [announce, setAnnounce] = useState("");

  const busy = useRef(false);
  const lockUntil = useRef(0);
  const timers = useRef<number[]>([]);
  const focusOnEnter = useRef(false);
  const activeRef = useLatest(activeRoom);

  const later = (fn: () => void, ms: number) => {
    timers.current.push(window.setTimeout(fn, ms));
  };

  /** Executa o obturador; `mid` roda com as lâminas fechadas. */
  const runShutter = useCallback(
    (label: { num: string; name: string }, mid: () => void, done?: () => void) => {
      busy.current = true;
      setShutterLabel(label);
      if (reduced) {
        mid();
        busy.current = false;
        done?.();
        return;
      }
      setPhase("closing");
      later(() => {
        setPhase("hold");
        mid();
      }, SHUTTER.close);
      later(() => setPhase("opening"), SHUTTER.close + SHUTTER.hold);
      later(() => {
        setPhase("idle");
        busy.current = false;
        done?.();
      }, SHUTTER.close + SHUTTER.hold + SHUTTER.open);
    },
    [reduced],
  );

  const go = useCallback(
    (room: RoomId) => {
      if (busy.current || room === activeRef.current) return;
      const r = rooms[roomIndex(room)];
      setDrawerOpen(false);
      setPendingRoom(room);
      setLeavingRoom(activeRef.current);
      focusOnEnter.current = true;
      runShutter(
        { num: r.num, name: r.name },
        () => {
          setActiveRoom(room);
          setLeavingRoom(null);
          setPendingRoom(null);
          try {
            history.replaceState(null, "", `#${room}`);
          } catch {}
          setAnnounce(`Sala: ${r.name}`);
        },
      );
    },
    [runShutter, activeRef],
  );

  const step = useCallback(
    (dir: 1 | -1) => {
      const i = roomIndex(activeRef.current) + dir;
      if (i < 0 || i >= rooms.length) return;
      go(rooms[i].id);
    },
    [go, activeRef],
  );

  /* Montagem: hash e Ignição (decididos antes da pintura pelo script do layout). */
  useLayoutEffect(() => {
    const root = document.documentElement;
    const hash = location.hash.slice(1);
    // eslint-disable-next-line react-hooks/set-state-in-effect -- estado inicial vindo do navegador
    if (isRoomId(hash)) setActiveRoom(hash);
    if (root.hasAttribute("data-skip-ignition")) setIgnited(true);
    const onHash = () => {
      const h = location.hash.slice(1);
      if (isRoomId(h)) go(h);
    };
    window.addEventListener("hashchange", onHash);
    const t = timers.current;
    return () => {
      window.removeEventListener("hashchange", onHash);
      t.forEach(clearTimeout);
    };
  }, [go]);

  const finishIgnition = useCallback(() => {
    try {
      sessionStorage.setItem("spike-ignited", "1");
    } catch {}
    focusOnEnter.current = true;
    runShutter({ num: "01", name: "Salão" }, () => setIgnited(true));
  }, [runShutter]);

  const skipIgnition = useCallback(() => {
    try {
      sessionStorage.setItem("spike-ignited", "1");
    } catch {}
    setIgnited(true);
  }, []);

  /* Foco no título da sala ao entrar. */
  useEffect(() => {
    if (phase !== "idle" || !focusOnEnter.current || !ignited) return;
    focusOnEnter.current = false;
    const el = document.querySelector<HTMLElement>(`[data-room="${activeRoom}"] [data-room-title]`);
    el?.focus({ preventScroll: true });
  }, [phase, activeRoom, ignited]);

  /* Teclado */
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (!ignited || e.defaultPrevented || e.altKey || e.ctrlKey || e.metaKey) return;
      if (e.key === "Escape") {
        setDrawerOpen(false);
        return;
      }
      if (drawerOpen || isTypingTarget(e.target)) return;
      if (e.key === "ArrowRight" || e.key === "ArrowDown" || e.key === "PageDown") {
        e.preventDefault();
        step(1);
      } else if (e.key === "ArrowLeft" || e.key === "ArrowUp" || e.key === "PageUp") {
        e.preventDefault();
        step(-1);
      } else if (/^[1-6]$/.test(e.key)) {
        go(rooms[Number(e.key) - 1].id);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [ignited, drawerOpen, step, go]);

  /* Roda e swipe: um gesto = uma sala; respeita rolagem interna. */
  useEffect(() => {
    let acc = 0;
    let accTimer = 0;
    let lastInnerScroll = 0;

    const onWheel = (e: WheelEvent) => {
      if (!ignited || drawerOpen || e.ctrlKey || busy.current) return;
      if (e.target instanceof Element && e.target.closest("[data-no-room-wheel]")) return;
      const dir: 1 | -1 = e.deltaY > 0 ? 1 : -1;
      if (Math.abs(e.deltaX) > Math.abs(e.deltaY)) return;
      if (canScrollInside(e.target, dir)) {
        lastInnerScroll = performance.now();
        acc = 0;
        return;
      }
      const now = performance.now();
      if (now < lockUntil.current || now - lastInnerScroll < 350) return;
      acc += e.deltaY;
      window.clearTimeout(accTimer);
      accTimer = window.setTimeout(() => (acc = 0), 180);
      if (Math.abs(acc) < WHEEL_THRESHOLD) return;
      acc = 0;
      lockUntil.current = now + WHEEL_LOCK_MS;
      step(dir);
    };

    let sx = 0;
    let sy = 0;
    let startTarget: EventTarget | null = null;
    let atLimitDown = false;
    let atLimitUp = false;
    const onTouchStart = (e: TouchEvent) => {
      if (e.touches.length !== 1) return;
      sx = e.touches[0].clientX;
      sy = e.touches[0].clientY;
      startTarget = e.target;
      atLimitDown = !canScrollInside(startTarget, 1);
      atLimitUp = !canScrollInside(startTarget, -1);
    };
    const onTouchEnd = (e: TouchEvent) => {
      if (!ignited || drawerOpen || busy.current) return;
      if (startTarget instanceof Element && startTarget.closest("[data-no-room-wheel], [data-drag-x]")) return;
      const t = e.changedTouches[0];
      const dx = t.clientX - sx;
      const dy = sy - t.clientY;
      if (Math.abs(dy) < SWIPE_THRESHOLD || Math.abs(dy) < Math.abs(dx) * 1.5) return;
      const now = performance.now();
      if (now < lockUntil.current) return;
      if (dy > 0 && atLimitDown && !canScrollInside(startTarget, 1)) {
        lockUntil.current = now + WHEEL_LOCK_MS;
        step(1);
      } else if (dy < 0 && atLimitUp && !canScrollInside(startTarget, -1)) {
        lockUntil.current = now + WHEEL_LOCK_MS;
        step(-1);
      }
    };

    window.addEventListener("wheel", onWheel, { passive: true });
    window.addEventListener("touchstart", onTouchStart, { passive: true });
    window.addEventListener("touchend", onTouchEnd, { passive: true });
    return () => {
      window.removeEventListener("wheel", onWheel);
      window.removeEventListener("touchstart", onTouchStart);
      window.removeEventListener("touchend", onTouchEnd);
      window.clearTimeout(accTimer);
    };
  }, [ignited, drawerOpen, step]);

  const state: ShowroomState = useMemo(
    () => ({
      activeRoom,
      pendingRoom,
      go,
      selectedCar,
      setSelectedCar,
      atelierSummary,
      setAtelierSummary,
      soundOn,
      setSoundOn,
      ignited,
      drawerOpen,
      setDrawerOpen,
    }),
    [activeRoom, pendingRoom, go, selectedCar, atelierSummary, soundOn, ignited, drawerOpen],
  );

  const activeIdx = roomIndex(activeRoom);
  const shutterClosed = phase === "closing" || phase === "hold";

  return (
    <ShowroomContext.Provider value={state}>
      <SiteHeader />
      <SideRail />

      <main id="conteudo" tabIndex={-1} className="room-stack fixed inset-0 outline-none">
        {rooms.map((r, i) => {
          const isActive = r.id === activeRoom;
          const isLeaving = r.id === leavingRoom;
          const near = Math.abs(i - activeIdx) <= 1 || r.id === pendingRoom;
          const revealActive = isActive && ignited && !shutterClosed;
          return (
            <RoomContext.Provider key={r.id} value={{ active: revealActive, current: isActive, mounted: near }}>
              <motion.section
                data-room={r.id}
                aria-labelledby={`${r.id}-title`}
                aria-hidden={!isActive}
                inert={!isActive}
                className={cn("room absolute inset-0 overflow-hidden", isActive ? "z-10" : "z-0")}
                style={{ visibility: isActive || isLeaving ? "visible" : "hidden" }}
                initial={false}
                animate={
                  isLeaving && !reduced
                    ? { opacity: 0.3, scale: 0.96 }
                    : { opacity: isActive ? 1 : 0, scale: 1 }
                }
                transition={{ duration: reduced ? 0.2 : SHUTTER.close / 1000, ease: [0.76, 0, 0.24, 1] }}
              >
                {content[r.id]}
              </motion.section>
            </RoomContext.Provider>
          );
        })}
      </main>

      <SiteDock />

      {!ignited ? <Ignition onComplete={finishIgnition} onSkip={skipIgnition} /> : null}

      <Shutter phase={phase} num={shutterLabel.num} name={shutterLabel.name} />
      <Cursor />

      <div role="status" aria-live="polite" className="sr-only">
        {announce}
      </div>

      {/* Assinatura discreta da agência */}
      <span
        aria-hidden
        className="pointer-events-none fixed bottom-[76px] left-3 z-[60] font-mono text-[10px] text-text opacity-40 sm:bottom-4 sm:left-4"
      >
        S.
      </span>
    </ShowroomContext.Provider>
  );
}
