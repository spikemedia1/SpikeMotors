/**
 * Mapeamento do pack original (pasta `imagens/`, nomes longos .jfif) → arquivos limpos em /public.
 * Origem e licença das imagens: DESCONHECIDAS. Bloqueia publicação até confirmação.
 */
export type ManifestEntry = {
  original: string; // prefixo do nome original
  model: string;
  angle: string;
  light: string;
  size: string;
  use: string;
  file: string | null; // null = não usada
};

export const imageManifest: ManifestEntry[] = [
  { original: "dvOJ2vKUyhc6…", model: "Coupé escuro (modelo não confirmado)", angle: "Frente 3/4", light: "Low-key", size: "2560×1706", use: "Hero do Salão", file: "/cars/atmosfera/hero.jpg" },
  { original: "3Niue1e5Maqw…", model: "Porsche 911 Turbo S (992)", angle: "Lateral", light: "Estúdio escuro", size: "1147×860", use: "Coleção", file: "/cars/porsche-911-turbo-s/side.jpg" },
  { original: "ySDmBVj4Y8mq…", model: "Porsche 911 Turbo (992)", angle: "Traseira", light: "Estúdio escuro", size: "768×576 (baixa)", use: "Galeria 911 (secundária)", file: "/cars/porsche-911-turbo-s/rear.jpg" },
  { original: "SLhjYZpNy2By…", model: "Ferrari 812 Superfast", angle: "Frente 3/4", light: "Rua, dia nublado", size: "1290×860", use: "Coleção", file: "/cars/ferrari-812-superfast/front-34.jpg" },
  { original: "BSddKbosp693…", model: "McLaren 720S", angle: "Frente 3/4", light: "Estúdio escuro", size: "1920×961", use: "Coleção", file: "/cars/mclaren-720s/front-34.jpg" },
  { original: "HkC0NnlEirO_…", model: "Aston Martin DB12", angle: "Frente 3/4", light: "Rua, pôr do sol", size: "1200×800", use: "Coleção", file: "/cars/aston-martin-db12/front-34.jpg" },
  { original: "Ufo0vJ6leR7v…", model: "Bentley Continental GT (4ª ger.)", angle: "Frente 3/4", light: "Estúdio claro", size: "5160×3440", use: "Coleção", file: "/cars/bentley-continental-gt/front-34.jpg" },
  { original: "XvIiI0v7K6A-…", model: "Bentley Batur", angle: "Lateral", light: "Estúdio, fundo vermelho", size: "5000×3333", use: "Coleção", file: "/cars/bentley-batur/side.jpg" },
  { original: "EVfBRNoIFLv6…", model: "Rolls-Royce Spectre", angle: "Frente 3/4", light: "Dia, arquitetura", size: "2272×1704", use: "Coleção", file: "/cars/rolls-royce-spectre/front-34.jpg" },
  { original: "KTYRgRY2CRjd…", model: "Render sem marca", angle: "Detalhe farol", light: "Low-key", size: "1280×720", use: "Manifesto", file: "/cars/atmosfera/farol.jpg" },
  { original: "kL-HosYD9zT4…", model: "Coupé fosco (render)", angle: "Traseira 3/4 + carbono", light: "Low-key", size: "1200×675", use: "Ateliê", file: "/cars/atmosfera/atelie.jpg" },
  { original: "A93ecPD4q3Lp…", model: "Porsche 911 (render)", angle: "Frente, garagem", light: "Arquitetura suave", size: "1200×800", use: "Concierge", file: "/cars/atmosfera/garagem.jpg" },
  { original: "fncB5dmXr-LqT…", model: "McLaren F1 (silhueta)", angle: "Lateral", light: "Low-key", size: "2500×1579", use: "Atmosfera (reserva)", file: "/cars/atmosfera/silhueta-01.jpg" },
  { original: "BfgWW3DQEHQI…", model: "Bentley (silhueta)", angle: "Lateral", light: "Low-key", size: "1800×1013", use: "Atmosfera (reserva)", file: "/cars/atmosfera/silhueta-02.jpg" },
  { original: "1Srkz_AwE9NU…", model: "Dallara Stradale", angle: "Frente", light: "Estúdio", size: "918×656", use: "Descartada: captura de site com interface", file: null },
  { original: "sL-h1OSe2NyZ…", model: "Koenigsegg Gemera / Jesko", angle: "—", light: "—", size: "1740×2232", use: "Descartada: captura de site com logotipo", file: null },
  { original: "-LWZCMBYiQ_G…", model: "Gordon Murray T.33", angle: "Lateral", light: "Estúdio", size: "2100×1400", use: "Não usada (fora da coleção)", file: null },
  { original: "0-_eB60HCfp0…", model: "Bentley Continental GT (3ª ger.)", angle: "Frente 3/4", light: "Rua", size: "1290×860", use: "Não usada (geração diferente)", file: null },
  { original: "2DZk7v1tuKFC…", model: "Aston Martin DBS (provável IA)", angle: "Frente 3/4", light: "Túnel", size: "1024×1024", use: "Não usada (aparência de IA)", file: null },
  { original: "5uAyGWnjxNR8…", model: "Coupé cromado (render)", angle: "Lateral", light: "Estúdio claro", size: "980×981", use: "Não usada", file: null },
  { original: "DSlv2VCga-Vie…", model: "Bentley Continental GT", angle: "Lateral, garagem", light: "Âmbar", size: "1024×682", use: "Não usada (baixa resolução)", file: null },
  { original: "RHW00NsedP5mm…", model: "McLaren Speedtail", angle: "Detalhe roda", light: "Estúdio", size: "1200×795", use: "Não usada", file: null },
  { original: "XH0k7R6vJM_es…", model: "Porsche 911 Carrera S (992)", angle: "Frente", light: "Estúdio escuro", size: "2000×1499", use: "Não usada (não é Turbo S)", file: null },
  { original: "awxI5_S4eKt7…", model: "Lexus LC 500", angle: "Traseira 3/4 com pessoa", light: "Dia", size: "1280×720", use: "Não usada", file: null },
  { original: "eBeEBGCKQ0nt…", model: "Lexus LC 500", angle: "Frente 3/4", light: "Low-key", size: "2500×1843", use: "Não usada (fora da coleção)", file: null },
  { original: "exnjgRaN4GvM…", model: "Porsche 911 Carrera 4S Cabriolet", angle: "Lateral", light: "Dia", size: "4096×2733", use: "Não usada", file: null },
  { original: "kVr0dlxeN_h7…", model: "Porsche 911 (provável IA)", angle: "Detalhe farol", light: "Dia", size: "1024×1024", use: "Não usada", file: null },
  { original: "qozuDVouE-aQ…", model: "McLaren 765LT", angle: "Frente 3/4", light: "Dia", size: "1400×896", use: "Não usada (fundo claro)", file: null },
  { original: "v3C8FLxYf5U6…", model: "Sedã VW (Magotan)", angle: "Lateral", light: "Arquitetura", size: "1162×775", use: "Não usada (fora do posicionamento)", file: null },
];
