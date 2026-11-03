"use client";

import { RoomFrame } from "@/components/showroom/room-frame";
import { SplitReveal } from "@/components/motion/split-reveal";

export function Atelie() {
  return (
    <RoomFrame>
      <SplitReveal id="atelie-title" lines={["Ateliê"]} className="t-room" />
    </RoomFrame>
  );
}
