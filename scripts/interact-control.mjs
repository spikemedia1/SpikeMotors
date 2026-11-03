import { chromium } from "playwright";
const b = await chromium.launch();
const p = await b.newPage({ viewport: { width: 1440, height: 900 } });
const errs = [];
p.on("console", (m) => m.type() === "error" && errs.push(m.text().slice(0, 200)));
p.on("pageerror", (e) => errs.push(e.message));
await p.addInitScript(() => sessionStorage.setItem("spike-ignited", "1"));
await p.goto("http://localhost:3100/#spike-control", { waitUntil: "networkidle" });
await p.waitForTimeout(2500);
await p.screenshot({ path: "qa/shots/control-idle.png" });
// aborto: solta cedo
const btn = p.getByRole("button", { name: "Segure para largar" });
await btn.hover();
await p.mouse.down(); await p.waitForTimeout(150); await p.mouse.up();
await p.waitForTimeout(200);
console.log("status after early release:", await p.locator("[role=status]").filter({ hasText: /LARGADA|PRONTO|ARMED/ }).first().textContent());
await p.waitForTimeout(1800);
// largada real
await p.mouse.down(); await p.waitForTimeout(900);
await p.screenshot({ path: "qa/shots/control-armed.png" });
await p.mouse.up();
await p.waitForTimeout(1500);
await p.screenshot({ path: "qa/shots/control-running.png" });
await p.waitForTimeout(8000);
await p.screenshot({ path: "qa/shots/control-done.png" });
// modo spike
await p.getByRole("radio", { name: "Spike" }).click();
await p.waitForTimeout(1500);
await p.screenshot({ path: "qa/shots/control-spike.png" });
console.log(errs.length ? errs.join("\n") : "sem erros");
await b.close();
