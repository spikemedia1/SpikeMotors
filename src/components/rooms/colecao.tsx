"use client";

import { RoomFrame } from "@/components/showroom/room-frame";
import { SplitReveal } from "@/components/motion/split-reveal";

export function Colecao() {
  return (
    <RoomFrame>
      <SplitReveal id="colecao-title" lines={["Coleção"]} className="t-room" />
    </RoomFrame>
  );
}
