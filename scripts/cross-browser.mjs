// Firefox e WebKit: Ignição, navegação por teclas, foto de cada sala e erros de JS.
// node scripts/cross-browser.mjs http://localhost:3000   → qa/cross/<motor>-<sala>-<tamanho>.png
import { firefox, webkit } from "playwright";
import { mkdirSync } from "node:fs";

const base = process.argv[2] ?? "http://localhost:3000";
const rooms = ["salao", "colecao", "spike-control", "atelie", "manifesto", "concierge"];
const sizes = [
  { name: "1440x900", viewport: { width: 1440, height: 900 } },
  { name: "390x844", viewport: { width: 390, height: 844 }, mobile: true },
];
mkdirSync("qa/cross", { recursive: true });

const only = process.argv[3];
for (const [engine, type] of [["firefox", firefox], ["webkit", webkit]]) {
  if (only && only !== engine) continue;
  let browser;
  try {
    browser = await type.launch();
  } catch (e) {
    console.log(`[${engine}] não abriu: ${e.message.split("\n")[0]}`);
    continue;
  }
  for (const size of sizes) {
    // Firefox do Playwright não emula isMobile/touch; só a largura.
    const mobile = size.mobile && engine === "webkit" ? { isMobile: true, hasTouch: true } : {};
    const page = await browser.newPage({ viewport: size.viewport, ...mobile });
    const errors = [];
    page.on("pageerror", (e) => errors.push(`pageerror: ${e.message}`));
    page.on("console", (m) => m.type() === "error" && errors.push(`console: ${m.text()}`));

    await page.goto(base + "/", { waitUntil: "networkidle" });
    const support = await page.evaluate(() => ({
      contentVisibility: CSS.supports("content-visibility", "hidden"),
      has: CSS.supports("selector(:has(a))"),
    }));
    await page.keyboard.down("Space");
    await page.waitForTimeout(1600);
    await page.keyboard.up("Space");
    await page.waitForTimeout(2200);
    const ignited = (await page.locator(".ignition-root").count()) === 0;

    const visited = [];
    for (const [i, room] of rooms.entries()) {
      if (i > 0) {
        await page.keyboard.press(String(i + 1));
        await page.waitForTimeout(1600);
      }
      const hash = await page.evaluate(() => location.hash);
      const titleVisible = await page.locator(`[data-room="${room}"] [data-room-title]`).isVisible();
      visited.push(`${room}:${hash === `#${room}` || (i === 0 && hash === "") ? "ok" : hash}${titleVisible ? "" : "(título oculto)"}`);
      await page.screenshot({ path: `qa/cross/${engine}-${room}-${size.name}.png` });
    }

    console.log(`[${engine} ${size.name}] suporte ${JSON.stringify(support)} | ligou: ${ignited}`);
    console.log(`  salas: ${visited.join(" ")}`);
    console.log(`  erros: ${errors.length ? "\n    " + errors.join("\n    ") : "nenhum"}`);
    await page.close();
  }
  await browser.close();
}
