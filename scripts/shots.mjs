// Capturas de QA: node scripts/shots.mjs [baseUrl] [salas] [viewports]
// Ex.: node scripts/shots.mjs http://localhost:3100 salao,colecao 1440x900,390x844
import { chromium } from "playwright";
import { mkdir } from "node:fs/promises";

const base = process.argv[2] ?? "http://localhost:3100";
const rooms = (process.argv[3] ?? "salao,colecao,spike-control,atelie,manifesto,concierge").split(",");
const viewports = (process.argv[4] ?? "390x844,768x1024,1280x800,1440x900,1920x1080")
  .split(",")
  .map((v) => v.split("x").map(Number));
const wait = Number(process.env.WAIT ?? 3200);
const out = process.env.OUT ?? "qa/shots";
await mkdir(out, { recursive: true });

const browser = await chromium.launch();
const errors = [];
for (const [w, h] of viewports) {
  const ctx = await browser.newContext({
    viewport: { width: w, height: h },
    deviceScaleFactor: 1,
    isMobile: w < 768,
    hasTouch: w < 768,
    reducedMotion: process.env.REDUCED ? "reduce" : "no-preference",
  });
  await ctx.addInitScript(() => {
    try {
      sessionStorage.setItem("spike-ignited", "1");
    } catch {}
  });
  for (const room of rooms) {
    const page = await ctx.newPage();
    page.on("console", (m) => {
      if (m.type() === "error" || m.type() === "warning") errors.push(`[${w}x${h} ${room}] ${m.type()}: ${m.text().slice(0, 300)}`);
    });
    page.on("pageerror", (e) => errors.push(`[${w}x${h} ${room}] pageerror: ${e.message}`));
    await page.goto(`${base}/#${room}`, { waitUntil: "networkidle" });
    await page.waitForTimeout(wait);
    await page.screenshot({ path: `${out}/${room}-${w}x${h}.png` });
    await page.close();
  }
  await ctx.close();
}
await browser.close();
console.log(errors.length ? errors.join("\n") : "sem erros de console");
