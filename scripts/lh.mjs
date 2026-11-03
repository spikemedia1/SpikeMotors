// Lighthouse pela API Node, conectado a um Chromium aberto pelo Playwright (o chrome-launcher falha
// neste Windows com "spawn UNKNOWN"). node scripts/lh.mjs <url> [--desktop] [--runs=3] [--out=lh.json]
import { chromium } from "playwright";
import lighthouse from "lighthouse";
import desktopConfig from "lighthouse/core/config/desktop-config.js";
import { writeFileSync } from "node:fs";

const args = process.argv.slice(2);
const opt = (name) => args.find((a) => a.startsWith(`--${name}=`))?.split("=")[1];
const url = args.find((a) => !a.startsWith("--")) ?? "http://localhost:3000/";
const preset = args.includes("--desktop") ? "desktop" : undefined;
const runs = Number(opt("runs") ?? 1);
const out = opt("out");
const flags = { port: 9333, output: "json", logLevel: "error", onlyCategories: ["performance", "accessibility", "best-practices", "seo"] };

for (let i = 1; i <= runs; i++) {
  const browser = await chromium.launch({ args: [`--remote-debugging-port=${flags.port}`] });
  const res = await lighthouse(url, flags, preset === "desktop" ? desktopConfig : undefined);
  await browser.close();
  if (out) writeFileSync(runs > 1 ? out.replace(/\.json$/, `-${i}.json`) : out, res.report);

  const score = Object.fromEntries(Object.entries(res.lhr.categories).map(([k, v]) => [k, Math.round(v.score * 100)]));
  const a = res.lhr.audits;
  const metrics = ["first-contentful-paint", "largest-contentful-paint", "total-blocking-time", "cumulative-layout-shift", "speed-index"]
    .map((k) => `${k.replace(/-/g, " ")} ${a[k].displayValue}`)
    .join(" · ");
  console.log(`[${preset ?? "mobile"} ${i}/${runs}] ${JSON.stringify(score)}\n  ${metrics}`);
}
