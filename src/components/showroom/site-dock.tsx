"use client";

import { CalendarClock, CarFront, Feather, Gauge, Gem, Volume2, VolumeX, Wrench, type LucideIcon } from "lucide-react";
import { Dock, DockIcon, DockSeparator } from "@/components/ui/dock";
import { rooms, type RoomId } from "@/data/rooms";
import { useShowroom } from "./showroom-context";

const ICONS: Record<RoomId, LucideIcon> = {
  salao: Gem,
  colecao: CarFront,
  "spike-control": Gauge,
  atelie: Wrench,
  manifesto: Feather,
  concierge: CalendarClock,
};

export function SiteDock() {
  const { activeRoom, go, soundOn, setSoundOn } = useShowroom();
  return (
    <div className="pointer-events-none fixed inset-x-0 bottom-0 z-50 flex justify-center pb-[env(safe-area-inset-bottom)] sm:bottom-5">
      <Dock label="Salas" className="w-full sm:w-auto">
        {rooms.map((r) => (
          <DockIcon
            key={r.id}
            icon={ICONS[r.id]}
            label={r.name}
            active={r.id === activeRoom}
            badge={r.id === "spike-control" ? "LIVE" : undefined}
            onClick={() => go(r.id)}
          />
        ))}
        <DockSeparator />
        <DockIcon
          icon={soundOn ? Volume2 : VolumeX}
          label={soundOn ? "Som ligado" : "Som desligado"}
          pressed={soundOn}
          onClick={() => setSoundOn(!soundOn)}
          cursor={soundOn ? "SILENCIAR" : "SOM"}
        />
      </Dock>
    </div>
  );
}
