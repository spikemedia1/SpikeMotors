export type Quote = {
  id: "salao" | "colecao" | "manifesto";
  text: string;
  attribution: string;
  role?: string;
  /** As três frases circulam sem fonte primária localizada. */
  verify: true;
};

export const quotes: Record<Quote["id"], Quote> = {
  salao: {
    id: "salao",
    text: "Pegue o melhor que existe e torne-o melhor. Quando não existir, crie-o.",
    attribution: "Sir Henry Royce",
    role: "cofundador da Rolls-Royce",
    verify: true,
  },
  colecao: {
    id: "colecao",
    text: "O melhor carro é sempre o próximo.",
    attribution: "Inspirado em Enzo Ferrari",
    verify: true,
  },
  manifesto: {
    id: "manifesto",
    text: "O luxo deve ser confortável; caso contrário, não é luxo.",
    attribution: "Coco Chanel",
    verify: true,
  },
};
