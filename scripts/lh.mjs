// Lighthouse via Chromium do Playwright (porta de depuração): node scripts/lh.mjs <url> <saida.json> [desktop]
import { chromium } from "playwright";
import { spawnSync } from "node:child_process";
const [url, out, preset] = process.argv.slice(2);
const browser = await chromium.launch({ channel: "chromium", args: ["--remote-debugging-port=9333"] });
const args = ["--yes", "lighthouse@12", url, "--port=9333", "--quiet", "--output=json", `--output-path=${out}`,
  "--only-categories=performance,accessibility,best-practices,seo"];
if (preset === "desktop") args.push("--preset=desktop");
const r = spawnSync("npx", args, { stdio: "inherit", shell: true });
await browser.close();
process.exit(r.status ?? 0);
