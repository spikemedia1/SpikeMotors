// Evidências de QA sem Lighthouse: Web Vitals (mobile) + axe-core por sala. node scripts/audit.mjs <baseUrl>
import { chromium } from "playwright";
import { AxeBuilder } from "@axe-core/playwright";
const base = process.argv[2] ?? "http://localhost:3200";
const rooms = ["salao", "colecao", "spike-control", "atelie", "manifesto", "concierge"];
const b = await chromium.launch();

// Web Vitals: primeira visita (com Ignição), mobile 390x844, CPU 4x mais lenta
{
  const ctx = await b.newContext({ viewport: { width: 390, height: 844 }, isMobile: true, hasTouch: true });
  const p = await ctx.newPage();
  const cdp = await ctx.newCDPSession(p);
  await cdp.send("Emulation.setCPUThrottlingRate", { rate: 4 });
  let bytes = 0, js = 0;
  p.on("response", async (r) => {
    try { const len = Number(r.headers()["content-length"] ?? (await r.body()).length); bytes += len; if (r.url().endsWith(".js")) js += len; } catch {}
  });
  await p.addInitScript(() => {
    window.__lcp = 0; window.__cls = 0;
    new PerformanceObserver((l) => { for (const e of l.getEntries()) window.__lcp = e.startTime; }).observe({ type: "largest-contentful-paint", buffered: true });
    new PerformanceObserver((l) => { for (const e of l.getEntries()) if (!e.hadRecentInput) window.__cls += e.value; }).observe({ type: "layout-shift", buffered: true });
  });
  await p.goto(base + "/", { waitUntil: "networkidle" });
  await p.waitForTimeout(3000);
  const m = await p.evaluate(() => ({ fcp: performance.getEntriesByName("first-contentful-paint")[0]?.startTime, lcp: window.__lcp, cls: window.__cls }));
  console.log(`MOBILE (CPU 4x): FCP ${Math.round(m.fcp)}ms · LCP ${Math.round(m.lcp)}ms · CLS ${m.cls.toFixed(3)} · transferido ${(bytes / 1024).toFixed(0)} KB (JS ${(js / 1024).toFixed(0)} KB)`);
  await ctx.close();
}

// axe-core por sala (desktop)
const ctx = await b.newContext({ viewport: { width: 1440, height: 900 } });
await ctx.addInitScript(() => sessionStorage.setItem("spike-ignited", "1"));
for (const r of rooms) {
  const p = await ctx.newPage();
  await p.goto(`${base}/#${r}`, { waitUntil: "networkidle" });
  await p.waitForTimeout(2500);
  const res = await new AxeBuilder({ page: p }).include(`[data-room="${r}"]`).withTags(["wcag2a", "wcag2aa", "wcag21aa"]).analyze();
  const v = res.violations.map((x) => `${x.id}(${x.nodes.length}): ${x.nodes.slice(0, 2).map((n) => n.target.join(" ")).join(" | ")}`);
  console.log(`axe ${r}: ${v.length ? v.join("\n   ") : "0 violações"}`);
  await p.close();
}
// shell (header, dock, trilho)
{
  const p = await ctx.newPage();
  await p.goto(`${base}/#salao`, { waitUntil: "networkidle" });
  await p.waitForTimeout(2000);
  const res = await new AxeBuilder({ page: p }).exclude("main").withTags(["wcag2a", "wcag2aa", "wcag21aa"]).analyze();
  console.log(`axe shell: ${res.violations.length ? res.violations.map((x) => `${x.id}(${x.nodes.length}): ${x.nodes[0].target.join(" ")}`).join("\n   ") : "0 violações"}`);
  await p.close();
}
await b.close();
