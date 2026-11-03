// Checagens finais: hidratação (dev), <head> (ícones/OG), Ignição sem sessão, foco por teclado.
import { chromium } from "playwright";
const base = process.argv[2] ?? "http://localhost:3100";
const b = await chromium.launch();
const p = await b.newPage({ viewport: { width: 1440, height: 900 } });
const logs = [];
p.on("console", (m) => ["error", "warning"].includes(m.type()) && !/GL Driver|GPU stall/.test(m.text()) && logs.push(`${m.type()}: ${m.text().slice(0, 160)}`));
p.on("pageerror", (e) => logs.push("pageerror: " + e.message));
await p.goto(base + "/", { waitUntil: "networkidle" });
await p.waitForTimeout(1500);
console.log("Ignição visível (sem sessão):", await p.isVisible(".ignition-root"));
const head = await p.evaluate(() =>
  [...document.head.querySelectorAll("link[rel*=icon], meta[property^='og:'], meta[name^='twitter:'], meta[name=theme-color], meta[name=description]")].map(
    (e) => e.outerHTML.replace(/\?[a-z0-9]+/i, "")),
);
console.log(head.join("\n"));
for (const u of ["/icon", "/apple-icon", "/opengraph-image", "/twitter-image", "/robots.txt", "/sitemap.xml"]) {
  const r = await p.request.get(base + u);
  console.log(u, r.status(), r.headers()["content-type"]);
}
// segurar Espaço 1,4s
await p.keyboard.down(" ");
await p.waitForTimeout(1400);
await p.keyboard.up(" ");
await p.waitForTimeout(3200);
console.log("após Ignição -> foco:", await p.evaluate(() => document.activeElement?.id), "| sessionStorage:", await p.evaluate(() => sessionStorage.getItem("spike-ignited")));
// Tab até o dock e captura do foco
for (let i = 0; i < 4; i++) await p.keyboard.press("Tab");
await p.screenshot({ path: "qa/shots/focus-tab.png" });
console.log("foco após 4×Tab:", await p.evaluate(() => document.activeElement?.outerHTML.slice(0, 120)));
console.log(logs.length ? logs.join("\n") : "console: sem erros/avisos");
await b.close();
