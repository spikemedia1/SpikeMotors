export type CarImage = { src: string; angle: string; alt: string; width: number; height: number };

export type Car = {
  slug: string;
  brand: string;
  model: string;
  tagline: string;
  priceBRL: number | null; // null = "Sob consulta"
  priceNote: string; // fonte/mês da referência
  powerCv: number;
  zeroToHundred: number;
  topSpeedKmh: number;
  topSpeedPlus?: boolean; // ">" na velocidade máxima
  engine: string;
  drivetrain: string;
  weightKg?: number;
  lengthMm?: number;
  wheelbaseMm?: number;
  heightMm?: number;
  redlineRpm: number; // limite exibido no conta-giros
  electric?: boolean; // conta-giros vira "potência %"
  images: CarImage[];
  verify?: boolean; // true = conferir dado antes de publicar
  verifyNotes?: string;
};

/**
 * Somente carros presentes no pack de imagens.
 * Todos os preços e specs são de referência e precisam de conferência (verify: true).
 */
export const cars: Car[] = [
  {
    slug: "porsche-911-turbo-s",
    brand: "Porsche",
    model: "911 Turbo S",
    tagline: "A referência que se recusa a envelhecer.",
    priceBRL: 2_700_000,
    priceNote: "FIPE 0 km, ago/2026 (geração 992.2)",
    powerCv: 711,
    zeroToHundred: 2.5,
    topSpeedKmh: 322,
    engine: "3.6 biturbo T-Hybrid",
    drivetrain: "Integral",
    weightKg: 1720,
    lengthMm: 4535,
    wheelbaseMm: 2450,
    heightMm: 1304,
    redlineRpm: 7200,
    images: [
      { src: "/cars/porsche-911-turbo-s/side.jpg", angle: "Lateral", alt: "Porsche 911 Turbo S prata, vista lateral em estúdio escuro", width: 1147, height: 860 },
      { src: "/cars/porsche-911-turbo-s/rear.jpg", angle: "Traseira", alt: "Traseira do Porsche 911 Turbo com a barra de luz acesa no escuro", width: 768, height: 576 },
    ],
    verify: true,
    verifyNotes: "Potência: arquivo-base dizia 701 cv; ficha 992.2 indica 711 cv (523 kW). Foto do pack é da geração 992.1.",
  },
  {
    slug: "ferrari-812-superfast",
    brand: "Ferrari",
    model: "812 Superfast",
    tagline: "Doze cilindros, nenhuma concessão.",
    priceBRL: 5_181_178,
    priceNote: "FIPE set/2026, ano-modelo 2018 (consulta em espelho de terceiros)",
    powerCv: 800,
    zeroToHundred: 2.9,
    topSpeedKmh: 340,
    topSpeedPlus: true,
    engine: "6.5 V12 aspirado",
    drivetrain: "Traseira",
    weightKg: 1630,
    lengthMm: 4657,
    wheelbaseMm: 2720,
    heightMm: 1276,
    redlineRpm: 8900,
    images: [
      { src: "/cars/ferrari-812-superfast/front-34.jpg", angle: "Frente 3/4", alt: "Ferrari 812 Superfast cinza contornando curva de serra", width: 1290, height: 860 },
    ],
    verify: true,
  },
  {
    slug: "mclaren-720s",
    brand: "McLaren",
    model: "720S",
    tagline: "Engenharia de pista, silêncio de estúdio.",
    priceBRL: 3_395_037,
    priceNote: "FIPE set/2026, Coupé ano-modelo 2022 (consulta em espelho de terceiros)",
    powerCv: 720,
    zeroToHundred: 2.9,
    topSpeedKmh: 341,
    engine: "4.0 V8 biturbo",
    drivetrain: "Traseira",
    weightKg: 1419,
    lengthMm: 4543,
    wheelbaseMm: 2670,
    heightMm: 1196,
    redlineRpm: 8500,
    images: [
      { src: "/cars/mclaren-720s/front-34.jpg", angle: "Frente 3/4", alt: "McLaren 720S grafite com faróis acesos em estúdio azul-escuro", width: 1920, height: 961 },
    ],
    verify: true,
  },
  {
    slug: "aston-martin-db12",
    brand: "Aston Martin",
    model: "DB12",
    tagline: "O grand tourer que aprendeu a acelerar.",
    priceBRL: 3_500_000,
    priceNote: "FIPE 0 km, jul/2026 (consulta em espelho de terceiros)",
    powerCv: 680,
    zeroToHundred: 3.6,
    topSpeedKmh: 325,
    engine: "4.0 V8 biturbo",
    drivetrain: "Traseira",
    weightKg: 1685,
    lengthMm: 4725,
    wheelbaseMm: 2805,
    heightMm: 1295,
    redlineRpm: 7000,
    images: [
      { src: "/cars/aston-martin-db12/front-34.jpg", angle: "Frente 3/4", alt: "Aston Martin DB12 branco em estrada costeira ao pôr do sol", width: 1200, height: 800 },
    ],
    verify: true,
  },
  {
    slug: "bentley-continental-gt",
    brand: "Bentley",
    model: "Continental GT",
    tagline: "Mil quilômetros como se fossem dez.",
    priceBRL: null,
    priceNote: "Sem tabela brasileira confiável para a 4ª geração híbrida",
    powerCv: 680,
    zeroToHundred: 3.7,
    topSpeedKmh: 285,
    engine: "4.0 V8 biturbo híbrido plug-in",
    drivetrain: "Integral",
    weightKg: 2459,
    lengthMm: 4895,
    wheelbaseMm: 2851,
    heightMm: 1397,
    redlineRpm: 6500,
    images: [
      { src: "/cars/bentley-continental-gt/front-34.jpg", angle: "Frente 3/4", alt: "Bentley Continental GT de quarta geração, prata, em estúdio claro", width: 5160, height: 3440 },
    ],
    verify: true,
    verifyNotes: "Versão exata da foto não confirmada (GT 680 cv x GT Speed 782 cv).",
  },
  {
    slug: "bentley-batur",
    brand: "Bentley",
    model: "Batur",
    tagline: "Dezoito exemplares. Um deles, talvez.",
    priceBRL: null,
    priceNote: "Série limitada Mulliner; disponibilidade apenas em mercado secundário",
    powerCv: 750,
    zeroToHundred: 3.5,
    topSpeedKmh: 336,
    engine: "6.0 W12 biturbo",
    drivetrain: "Integral",
    weightKg: 2300,
    redlineRpm: 6000,
    images: [
      { src: "/cars/bentley-batur/side.jpg", angle: "Lateral", alt: "Bentley Batur branco fosco, vista lateral sobre fundo vermelho escuro", width: 5000, height: 3333 },
    ],
    verify: true,
    verifyNotes: "0–100 e peso estimados; fábrica divulga 0–60 mph.",
  },
  {
    slug: "rolls-royce-spectre",
    brand: "Rolls-Royce",
    model: "Spectre",
    tagline: "O silêncio, finalmente, levado às últimas consequências.",
    priceBRL: null,
    priceNote: "Importação independente; valores públicos divergem",
    powerCv: 585,
    zeroToHundred: 4.5,
    topSpeedKmh: 250,
    engine: "Elétrico, dois motores",
    drivetrain: "Integral",
    weightKg: 2975,
    lengthMm: 5475,
    wheelbaseMm: 3210,
    heightMm: 1559,
    redlineRpm: 10000,
    electric: true,
    images: [
      { src: "/cars/rolls-royce-spectre/front-34.jpg", angle: "Frente 3/4", alt: "Rolls-Royce Spectre verde sob pórtico de pedra", width: 2272, height: 1704 },
    ],
    verify: true,
  },
];

export const getCar = (slug: string | null | undefined): Car =>
  cars.find((c) => c.slug === slug) ?? cars[0];

export const carName = (c: Car) => `${c.brand} ${c.model}`;
