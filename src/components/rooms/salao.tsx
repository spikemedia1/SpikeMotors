"use client";

import { RoomFrame } from "@/components/showroom/room-frame";
import { SplitReveal } from "@/components/motion/split-reveal";

export function Salao() {
  return (
    <RoomFrame>
      <SplitReveal id="salao-title" lines={["Salão"]} className="t-room" />
    </RoomFrame>
  );
}
