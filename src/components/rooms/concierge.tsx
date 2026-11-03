"use client";

import { RoomFrame } from "@/components/showroom/room-frame";
import { SplitReveal } from "@/components/motion/split-reveal";

export function Concierge() {
  return (
    <RoomFrame>
      <SplitReveal id="concierge-title" lines={["Concierge"]} className="t-room" />
    </RoomFrame>
  );
}
