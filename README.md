# Spike Motors

Site institucional (showroom em 6 salas + Ignição) em Next.js 16, React 19, Tailwind 4, motion e lucide.

## Rodar

```bash
npm install
npm run dev        # http://localhost:3000
npm run build && npm start
npm test           # física do Spike Control (node:test)
npm run lint
```

QA (Playwright, com o servidor rodando):

```bash
npx playwright install chromium
node scripts/shots.mjs http://localhost:3000            # 6 salas × 5 breakpoints em qa/shots
node scripts/contact-sheet.mjs qa/shots 1440x900         # folha de contato
node scripts/audit.mjs http://localhost:3000             # Web Vitals mobile + axe-core
node scripts/lh.mjs http://localhost:3000/ --runs=3      # Lighthouse mobile (--desktop para desktop)
npx playwright install webkit
node scripts/cross-browser.mjs http://localhost:3000     # WebKit (e Firefox, se abrir) em qa/cross
```

## Onde ficam os dados

Tudo que é dado de negócio está em `src/data/` (carros, pacotes, citações, textos, contatos, `DEMO_MODE`).
Os componentes só leem desses arquivos. Antes de publicar, defina `NEXT_PUBLIC_SITE_URL` e veja `RELATORIO.md` → "Para publicar".
