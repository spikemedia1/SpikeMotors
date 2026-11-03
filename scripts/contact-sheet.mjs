// Junta as capturas de um breakpoint numa folha de contato: node scripts/contact-sheet.mjs qa/prod 1440x900 [prefixo-]
import { chromium } from "playwright";
import { readFileSync } from "node:fs";
const dir = process.argv[2];
const vp = process.argv[3];
const prefix = process.argv[4] ?? "";
const rooms = ["salao", "colecao", "spike-control", "atelie", "manifesto", "concierge"];
const [w, h] = vp.split("x").map(Number);
const cols = w < 800 ? 6 : 3;
const scale = w < 800 ? 0.62 : 0.5;
const imgs = rooms
  .map((r) => `<figure><img src="data:image/png;base64,${readFileSync(`${dir}/${prefix}${r}-${vp}.png`).toString("base64")}"><figcaption>${r}</figcaption></figure>`)
  .join("");
const html = `<style>body{margin:0;background:#333;display:grid;grid-template-columns:repeat(${cols},${w * scale}px);gap:6px;padding:6px;font:12px monospace;color:#fff}figure{margin:0}img{width:${w * scale}px;height:${h * scale}px;display:block}</style>${imgs}`;
const b = await chromium.launch();
const p = await b.newPage({ viewport: { width: Math.ceil(cols * (w * scale + 6) + 6), height: 600 } });
await p.setContent(html);
await p.screenshot({ path: `${dir}/${prefix}sheet-${vp}.png`, fullPage: true });
await b.close();
