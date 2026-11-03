"use client";

import { RoomFrame } from "@/components/showroom/room-frame";
import { SplitReveal } from "@/components/motion/split-reveal";

export function Manifesto() {
  return (
    <RoomFrame>
      <SplitReveal id="manifesto-title" lines={["Manifesto"]} className="t-room" />
    </RoomFrame>
  );
}
