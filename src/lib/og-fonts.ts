import { readFile } from "node:fs/promises";
import { join } from "node:path";

/** Fontes locais (pacotes @fontsource, .woff) para ImageResponse — sem rede no build. */
const file = (pkg: string, name: string) => join(process.cwd(), "node_modules", "@fontsource", pkg, "files", name);

export async function loadOgFonts() {
  const [logo, display, displayItalic, mono] = await Promise.all([
    readFile(file("epilogue", "epilogue-latin-800-normal.woff")),
    readFile(file("cormorant-garamond", "cormorant-garamond-latin-500-normal.woff")),
    readFile(file("cormorant-garamond", "cormorant-garamond-latin-500-italic.woff")),
    readFile(file("jetbrains-mono", "jetbrains-mono-latin-500-normal.woff")),
  ]);
  return [
    { name: "Epilogue", data: logo, weight: 800 as const, style: "normal" as const },
    { name: "Cormorant", data: display, weight: 500 as const, style: "normal" as const },
    { name: "Cormorant", data: displayItalic, weight: 500 as const, style: "italic" as const },
    { name: "JetBrains", data: mono, weight: 500 as const, style: "normal" as const },
  ];
}
