/** Geometria de instrumentos SVG com arredondamento (evita divergência de hidratação por ponto flutuante). */
const r2 = (n: number) => Math.round(n * 100) / 100;

export const rad = (deg: number) => (deg * Math.PI) / 180;

export function polar(cx: number, cy: number, r: number, deg: number): [number, number] {
  return [r2(cx + Math.cos(rad(deg)) * r), r2(cy + Math.sin(rad(deg)) * r)];
}

export function arcPath(cx: number, cy: number, r: number, from: number, to: number): string {
  const [x0, y0] = polar(cx, cy, r, from);
  const [x1, y1] = polar(cx, cy, r, to);
  return `M ${x0} ${y0} A ${r} ${r} 0 ${to - from > 180 ? 1 : 0} 1 ${x1} ${y1}`;
}
