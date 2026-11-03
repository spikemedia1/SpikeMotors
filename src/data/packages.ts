export type Program = {
  id: "essencial" | "signature" | "black-label";
  numeral: string;
  name: string;
  priceBRL: number;
  priceFrom?: boolean;
  onRequest?: boolean;
  items: string[];
  demo: true;
};

export type Addon = {
  id: string;
  name: string;
  detail: string;
  priceBRL: number;
  priceFrom?: boolean;
  monthly?: boolean;
  demo: true;
};

/** Valores da marca (ilustrativos), não de mercado. */
export const programs: Program[] = [
  {
    id: "essencial",
    numeral: "I",
    name: "Essencial",
    priceBRL: 48_900,
    items: [
      "Proteção PPF frontal autorregenerativa",
      "Vitrificação cerâmica",
      "Película nano-cerâmica",
      "Higienização técnica de interior",
      "6 meses de Spike Care",
    ],
    demo: true,
  },
  {
    id: "signature",
    numeral: "II",
    name: "Signature",
    priceBRL: 168_000,
    items: [
      "Tudo do Essencial",
      "PPF integral",
      "Rodas forjadas sob medida",
      "Detalhes em fibra de carbono",
      "Um Track Day Spike",
      "12 meses de Spike Care",
    ],
    demo: true,
  },
  {
    id: "black-label",
    numeral: "III",
    name: "Black Label",
    priceBRL: 420_000,
    priceFrom: true,
    onRequest: true,
    items: [
      "Tudo do Signature",
      "Pintura ou envelopamento exclusivo",
      "Interior sob medida: couro, alcântara, costura em contraste",
      "Escape em titânio",
      "Preparação de performance supervisionada",
      "Cerimônia de entrega privada",
    ],
    demo: true,
  },
];

export const addons: Addon[] = [
  { id: "shield", name: "Spike Shield", detail: "PPF integral", priceBRL: 42_000, demo: true },
  { id: "noir", name: "Spike Noir", detail: "Pintura ou envelopamento exclusivo", priceBRL: 95_000, priceFrom: true, demo: true },
  { id: "interior", name: "Interior Atelier", detail: "Couro, alcântara e costura sob medida", priceBRL: 92_000, priceFrom: true, demo: true },
  { id: "rodas", name: "Rodas forjadas", detail: "Sob medida", priceBRL: 68_000, demo: true },
  { id: "escape", name: "Escape em titânio", detail: "Desenho e afinação dedicados", priceBRL: 54_000, priceFrom: true, demo: true },
  { id: "guard", name: "Spike Guard", detail: "Blindagem nível III-A com vidros de baixo peso", priceBRL: 180_000, priceFrom: true, demo: true },
  { id: "care", name: "Spike Care", detail: "Manutenção, leva e traz em transporte fechado, garagem climatizada", priceBRL: 4_900, monthly: true, demo: true },
  { id: "track", name: "Track Day Spike", detail: "Instrutor e circuito", priceBRL: 14_500, demo: true },
];

export const atelierCopy = {
  title: "O Ateliê.",
  subtitle: "…e torne-o melhor.",
  intro: "Três programas e oito intervenções avulsas. Cada uma executada sob avaliação técnica do veículo.",
  paymentNote: ["Entrada a partir de 30%", "Saldo em até 36x"],
  disclaimer: "Valores de referência do Ateliê Spike. Execução sujeita a avaliação técnica do veículo.",
  monthlyNote: "Spike Care é mensal e não entra no total.",
  demo: true,
} as const;
