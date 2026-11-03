const brl = new Intl.NumberFormat("pt-BR", {
  style: "currency",
  currency: "BRL",
  maximumFractionDigits: 0,
});

const dec = new Intl.NumberFormat("pt-BR", { maximumFractionDigits: 1, minimumFractionDigits: 1 });
const int = new Intl.NumberFormat("pt-BR", { maximumFractionDigits: 0 });

/** R$ 4.226.670 (com espaço comum, não NBSP, para o odômetro alinhar). */
export function formatBRL(n: number): string {
  return brl.format(n).replace(/ /g, " ");
}

/** R$ 4,2 mi · R$ 950 mil */
export function formatCompact(n: number): string {
  if (n >= 1_000_000) return `R$ ${dec.format(n / 1_000_000)} mi`;
  if (n >= 1_000) return `R$ ${int.format(Math.round(n / 1_000))} mil`;
  return formatBRL(n);
}

export const formatInt = (n: number) => int.format(n);
export const formatDec = (n: number, digits = 1) =>
  new Intl.NumberFormat("pt-BR", { minimumFractionDigits: digits, maximumFractionDigits: digits }).format(n);
