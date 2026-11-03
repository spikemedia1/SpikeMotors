# Spike Motors — Progresso

## Fases
- [x] Fase 0 — Reconhecimento: 29 imagens inspecionadas uma a uma; mapeamento em `src/data/image-manifest.ts`.
- [x] Fase 1 — Fundação: Next 16.4.4 + Tailwind 4 + shadcn (base-nova) + motion + lucide; tokens, fontes, logo, ícones/OG via ImageResponse, robots/sitemap; Velaris, ShinyButton e Dock adaptados; preços pesquisados (todos `verify`).
- [x] Fase 2 — Shell de abas: estado único, dock, trilho, teclado/roda/swipe/hash, obturador, cursor, foco no título, `aria-live`, `<noscript>`.
- [x] Fase 3 — Ignição + Salão: segurar 1,2 s (conclusão por timer), sweep do conta-giros, tremor, obturador; Velaris, Headlight Reveal, Split Reveal, parallax, ticker, citação.
- [x] Fase 4 — Coleção: lista + miniatura flutuante, wipe de luz, nome por máscara, Blueprint, contadores, odômetro BRL, arrastar/setas/`[ ]`, gaveta de ficha.
- [x] Fase 5 — Spike Control: `lib/sim.ts` + 6 testes; 4 modos; instrumentos com spring; Launch Control (aborto < 0,4 s, teclado, "largar automaticamente"); comparação; G-force; telemetria em canvas; circuito; som Web Audio.
- [x] Fase 6 — Ateliê (3 programas, 8 avulsos, total vivo em odômetro, resumo → Concierge), Manifesto (Headlight Reveal, contadores, Chanel, linha do tempo), Concierge (validação, máscara BR, consentimento, sucesso, rodapé).
- [x] Fase 7 — QA visual: 6 salas × 5 breakpoints com Playwright no build de produção, folhas de contato revisadas e corrigidas; reduced-motion; axe-core 0 violações; ESLint 0; build limpo. Lighthouse: NÃO MEDIDO (ver relatório).

## Camadas
- [x] Camada 1 — obrigatória e publicável
- [x] Camada 2 — assinatura
- [x] Camada 3 — desejável (nada cortado)

Relatório completo: `RELATORIO.md`.
