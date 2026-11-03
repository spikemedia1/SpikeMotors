export type RoomId = "salao" | "colecao" | "spike-control" | "atelie" | "manifesto" | "concierge";

export type Room = {
  id: RoomId;
  num: string;
  name: string;
  short: string;
};

export const rooms: Room[] = [
  { id: "salao", num: "01", name: "Salão", short: "Salão" },
  { id: "colecao", num: "02", name: "Coleção", short: "Coleção" },
  { id: "spike-control", num: "03", name: "Spike Control", short: "Control" },
  { id: "atelie", num: "04", name: "Ateliê", short: "Ateliê" },
  { id: "manifesto", num: "05", name: "Manifesto", short: "Manifesto" },
  { id: "concierge", num: "06", name: "Concierge", short: "Concierge" },
];

export const roomIndex = (id: RoomId) => rooms.findIndex((r) => r.id === id);
export const isRoomId = (v: string): v is RoomId => rooms.some((r) => r.id === v);
