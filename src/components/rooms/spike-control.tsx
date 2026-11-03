"use client";

import { RoomFrame } from "@/components/showroom/room-frame";
import { SplitReveal } from "@/components/motion/split-reveal";

export function SpikeControl() {
  return (
    <RoomFrame>
      <SplitReveal id="spike-control-title" lines={["Spike Control"]} className="t-room" />
    </RoomFrame>
  );
}
