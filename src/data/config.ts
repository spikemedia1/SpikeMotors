/** Liga a sinalização visível de conteúdo ilustrativo. Desligar não exige tocar em componentes. */
export const DEMO_MODE = true;

/** Prévia privada: fora dos buscadores até definir NEXT_PUBLIC_ALLOW_INDEXING=1 no ambiente de produção. */
export const allowIndexing = process.env.NEXT_PUBLIC_ALLOW_INDEXING === "1";

export const demoNotice = "Conteúdo e valores ilustrativos nesta versão de demonstração.";

export const site = {
  name: "Spike Motors",
  title: "Spike Motors — Automóveis de exceção",
  description:
    "Curadoria de superesportivos e automóveis de luxo, com Ateliê de personalização e Spike Control, o simulador da casa.",
  tagline: "Automóveis de exceção, entregues como obra.",
  headerLabel: "Coleção privada · Brasil",
  year: 2026,
} as const;

/** Placeholders: substituir antes de publicar (ver relatório, "Para publicar"). */
export const contact = {
  city: "[Cidade, UF]",
  address: "[Endereço do showroom]",
  hours: ["Seg a sex · 10h às 19h", "Sáb · com hora marcada"],
  whatsappDisplay: "[+55 00 00000-0000]",
  /** TODO: número real. Sem número, o botão não abre link externo. */
  whatsappNumber: null as string | null,
  email: "[contato@dominio]",
  demo: true,
} as const;
