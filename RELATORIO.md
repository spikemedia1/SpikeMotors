# Spike Motors — Relatório final

Projeto em `spike-motors/` (Next.js 16.4.4, React 19.3, Tailwind 4, motion 14, lucide). Repositório git local, um commit por fase, sem remote.

---

## 1. Verificado (com evidência) e não verificado

### Verificado
| Item | Evidência |
|---|---|
| Build de produção | `npm run build` sem erros e sem avisos (9 rotas estáticas). |
| Tipos e lint | `tsc --noEmit` limpo; ESLint (config do Next 16 + React Compiler rules): **0 problemas**. |
| Física do simulador | `npm test`: **6/6** (100 km/h exatamente no tempo oficial, monotonicidade, giro dentro do limite do modo, g decrescente, volta por potência/peso, formatação). |
| Revisão visual | Playwright no build de produção: **6 salas × 5 breakpoints** (390×844, 768×1024, 1280×800, 1440×900, 1920×1080) + folhas de contato revisadas; correções aplicadas (sobreposição de dock, faixa no hero, painel de Launch Control, barra do Ateliê em ≤1280px e no celular, textos sob o header). Capturas em `qa/` (fora do git). |
| Console | Nenhum erro, aviso de hidratação ou de React nas 30 capturas e nos fluxos. Únicos avisos: mensagens do driver de GPU do Chromium headless ("GPU stall due to ReadPixels"), que vêm da captura de tela de WebGL no ambiente de teste. |
| Ignição | Sem sessão: Ignição visível; Espaço segurado 1,4 s → sweep → obturador → foco em `#salao-title`; `sessionStorage` gravado. Soltar antes: anel esvazia (código), recarregar com sessão: Ignição pulada. |
| Navegação | Testado: dock, trilho, teclas `2`, `→`, roda do mouse; hash acompanha (`#colecao`, `#spike-control`, `#atelie`); `aria-live` anuncia "Sala: Ateliê"; foco vai para o título da sala. |
| Coleção | Troca de carro (wipe), Blueprint no hover, gaveta "Ver ficha completa", Esc fecha. |
| Spike Control | Soltar com 150 ms → `LARGADA ABORTADA`; largada real do 911 Turbo S → cronômetro **02.500s** (dado de `cars.ts`), segue a 200 km/h, comparação e telemetria preenchidas; modo SPIKE ativa lime, Velaris e "Spike mode · engajado". |
| Ateliê → Concierge | 812 Superfast + Black Label + Spike Guard + Spike Care = **R$ 5.781.178** (Spike Care mensal fica fora do total, como informado na tela); resumo aparece no Concierge. |
| Formulário | Envio vazio → 4 campos inválidos, foco no primeiro; máscara `(11) 98765-4321`; envio válido → estado de sucesso. Nenhum dado sai do navegador. |
| Acessibilidade automática | **axe-core** (WCAG 2.0/2.1 A e AA) no build final: **0 violações** em cada uma das 6 salas e no shell (header, trilho, dock). Antes da correção havia contraste baixo em 2 salas e semântica de lista no Ateliê. |
| Reduced motion | Capturas com `prefers-reduced-motion: reduce`: conteúdo imediato, sem shader animado, sem Ignição, sem cursor customizado. |
| `<head>` | `link rel=icon` (512 px) e `apple-touch-icon` (180 px), `og:*` (1200×630, `pt_BR`), `twitter:card=summary_large_image`, `theme-color #080808`; `/icon`, `/apple-icon`, `/opengraph-image`, `/twitter-image`, `/robots.txt`, `/sitemap.xml` respondem 200. Imagem OG e ícone abertos e conferidos. |
| Sem JavaScript | Com JS desligado, o HTML traz o conteúdo essencial de todas as salas empilhadas (título, preços, citações, números). |
| **Lighthouse 12.8** (alvo: Perf ≥ 85 mobile, A11y ≥ 95) | Build de produção em localhost, `node scripts/lh.mjs` (API Node ligada ao Chromium do Playwright, throttling simulado padrão). **Mobile: Performance 86–87** (6 rodadas: 87, 87, 87, 87, 86, 86), Acessibilidade 100, Boas práticas 100, SEO 100. **Desktop: 100 / 100 / 100 / 100.** Mobile: FCP 1,1 s · LCP 3,8 s (simulado) · TBT 180–200 ms · CLS 0. |
| LCP real × simulado | O LCP de 3,8 s é do modelo do Lighthouse, que soma todo o JavaScript executado antes da pintura observada. Medido de verdade (Playwright, Moto G4, CPU 4×, rede lenta), o LCP acontece **no primeiro quadro, junto com o FCP (≈ 0,8 s)**. |
| Web Vitals (Playwright) | `scripts/audit.mjs`, 390×844, CPU 4×, localhost: FCP 192 ms · LCP 192 ms · CLS 0,000. |
| WebKit (motor do Safari) | `scripts/cross-browser.mjs`, Playwright WebKit 27.2, 1440×900 e 390×844 (toque emulado): Ignição liga, as 6 salas abrem por tecla com o hash certo, **nenhum erro de JS**; `content-visibility` e `:has()` suportados. Capturas revisadas em `qa/cross/`. |
| Pasta original | `imagens/` intacta (41 arquivos, nenhum modificado depois do início); nada escrito fora de `spike-motors/`. |

### Não verificado
| Item | Motivo |
|---|---|
| Lighthouse em produção | As notas acima são de localhost. Repetir na URL publicada (HTTPS, CDN, servidor real). |
| Som (Web Audio) | O código roda sem erros, mas não foi possível ouvir o resultado. |
| Swipe em toque real e arrastar com inércia na Coleção | Implementados; não exercitados nos testes automatizados (apenas roda, teclado e cliques). |
| Safari real, Firefox e aparelhos reais | Testados Chromium e o WebKit do Playwright no Windows, que é o motor do Safari mas não o Safari de iOS/macOS. O Firefox do Playwright não abriu nesta máquina (`spawn UNKNOWN`, também fora do sandbox; o mesmo bloqueio impede o `chrome-launcher`). |
| Leitor de tela real | Só verificação automática (axe) e estrutura de foco. |
| Fallback CSS do Velaris sem WebGL | Implementado (checagem de compilação e link); não forçado em teste. |
| Sem JS: imagem do hero | Sem JavaScript o carro do hero fica apagado (a revelação é por script). O texto aparece. |

---

## 2. Implementado por camada

- **Camada 1:** shell de abas com estado único, dock, trilho, teclado, roda, swipe e hash; obturador; Salão; Coleção (troca, odômetro, specs); Ateliê com configurador; Concierge; metadata, ícones e OG; acessibilidade (h1 único, h2 por sala, skip link, `aria-live`, foco, `inert`/`aria-hidden`, `<noscript>`); build limpo.
- **Camada 2:** Ignição; Spike Control com 4 modos, conta-giros, velocímetro, Launch Control, resultado e comparação; Headlight Reveal; Split Reveal; cursor-lente magnético; Blueprint; Manifesto completo.
- **Camada 3:** G-force, telemetria em canvas, mini-mapa do circuito, som Web Audio, specular sweep, borda shiny do Black Label, linha do tempo do Manifesto.
- **Cortado:** nada.

---

## 3. Checklist da seção 11

- [x] Abre na Ignição; segurar leva ao Salão com o sweep do conta-giros.
- [x] As 6 salas trocam por dock, trilho, teclado, roda e swipe, com o obturador; o hash acompanha. (Swipe implementado, não testado em toque real.)
- [x] Todas as imagens vêm do pack; nenhuma URL externa de imagem.
- [x] Coleção: preço em odômetro, nota de referência, specs animadas e Blueprint.
- [x] Spike Control: 4 modos, Launch Control com o 0–100 real de cada carro (modos PISTA e SPIKE), comparação, G-force e telemetria.
- [x] Ateliê calcula carro + programa + avulsos ao vivo e leva o resumo ao Concierge.
- [x] Velaris, ShinyButton e Dock em uso e adaptados.
- [x] Favicon, apple icon e OG no `<head>` (verificado).
- [x] Lime só no ponto do logo, indicadores "ao vivo" (badge LIVE, ponto do ticker, Ignição, sucesso do Concierge) e Modo Spike. Paleta final: Obsidian Champagne mantida, com `--text-muted` a 60% em vez de 56%.
- [x] Build sem erros; nenhum aviso de hidratação; reduced-motion respeitado.
- [x] Listas de `verify: true` e `demo: true` (seção 5).
- [x] Pasta de imagens original intacta; nada escrito fora do projeto.
- [x] Git local com um commit por fase, sem remote; `PROGRESS.md` atualizado.
- [x] Nenhum dado de negócio fixo em componente; tudo em `src/data/`.
- [x] Relatório entregue (este arquivo).
- [x] Lighthouse mobile: Performance 86–87 (alvo ≥ 85), Acessibilidade 100 (alvo ≥ 95); medido em localhost (ver seção 1).

---

## 4. Decisões que divergiram do PROMPT.md

- **Coleção:** só o 911 Turbo S da tabela 6.1 está no pack. G 63, 296 GTB, 750S, Revuelto, Cullinan e Urus ficaram de fora. Entraram os carros identificáveis do pack: 812 Superfast, 720S, DB12, Continental GT, Batur e Spectre.
- **911 Turbo S:** potência de 711 cv (ficha 992.2: 523 kW) em vez de 701 cv; marcado `verify`. A foto do pack é da geração 992.1.
- **Imagem com mapeamento corrigido:** a lateral do 911 é o arquivo `3Niue1e5…`, não o `5uAyGW…` (um render cromado). Erro meu na cópia inicial, corrigido antes da Fase 1.
- **Imagem de compartilhamento:** "0–100 · 2,4s" virou o 0–100 do carro mais rápido nos dados (hoje 2,5s). Nenhum carro da coleção faz 2,4s.
- **Modos:** CONFORTO (+30%) e SPORT (+8%) alongam o 0–100; PISTA e SPIKE usam o tempo oficial.
- **Ícones:** `icon.svg` estático trocado por `icon.png` e `apple-icon.png` gerados com `ImageResponse` e a fonte Epilogue local (um SVG cairia em fonte do sistema).
- **Fontes da imagem OG:** pacotes `@fontsource` locais, sem rede no build.
- **`next.config`:** `cacheComponents` e `partialPrefetching` (padrão do template) removidos; o site é estático, de página única.
- **Lâminas do obturador:** animadas com `transform` em vez de `clip-path`; o filete champagne acompanha a borda.
- **Ignição:** a conclusão do "segurar" é por timer e o rAF só cuida do visual. Em abas estranguladas o rAF quase para.
- **Pulso do Modo Spike:** feito por opacidade de um contorno sobreposto, não por `border-color` animado.
- **Concierge:**
  - checkbox de consentimento (LGPD) com placeholder da política de privacidade;
  - seletor "Modelo" quando o interesse é um carro;
  - o botão de WhatsApp fica inativo até haver número real.
- **Configurador do Ateliê:** o Spike Care é mensal e fica fora do total, exibido à parte ("+ R$ 4.900/mês").
- **Trilho lateral:** o rótulo ativo é revelado com `clip-path`, não com largura.
- **Conteúdo sob o header:** o header não tem fundo, então o contêiner de cada sala tem uma máscara de 76 px no topo para o conteúdo sumir ao rolar.
- **Componentes extras:** o cliente não enviou nenhum, então não houve veredictos.

---

## 5. Imagens, `verify` e `demo`

### Tabela de imagens (original → modelo → uso)
| Original (prefixo) | Modelo | Uso |
|---|---|---|
| dvOJ2vKUyhc6… | Coupé escuro, modelo não confirmado | Hero do Salão |
| 3Niue1e5Maqw… | Porsche 911 Turbo S (992) | Coleção |
| ySDmBVj4Y8mq… | Porsche 911 Turbo (992), traseira, 768 px | Galeria do 911 (baixa resolução) |
| SLhjYZpNy2By… | Ferrari 812 Superfast | Coleção |
| BSddKbosp693… | McLaren 720S | Coleção |
| HkC0NnlEirO_… | Aston Martin DB12 | Coleção |
| Ufo0vJ6leR7v… | Bentley Continental GT (4ª geração) | Coleção |
| XvIiI0v7K6A-… | Bentley Batur | Coleção |
| EVfBRNoIFLv6… | Rolls-Royce Spectre | Coleção |
| KTYRgRY2CRjd… | Render sem marca, farol | Manifesto |
| kL-HosYD9zT4… | Coupé fosco + fibra de carbono (render) | Fundo do Ateliê |
| A93ecPD4q3Lp… | Garagem com 911 (render) | Concierge |
| fncB5dmXr-Lq… / BfgWW3DQEHQI… | Silhuetas (McLaren F1 / Bentley) | Copiadas como reserva; não exibidas |
| 1Srkz_AwE9NU… / sL-h1OSe2NyZ… | Capturas de sites (Dallara / Koenigsegg) | **Descartadas** (interface e logotipo) |
| Demais 15 | 911 Carrera e Cabriolet, Continental 3ª ger., 765LT, LC 500, VW, T.33, renders | Não usadas (motivo em `src/data/image-manifest.ts`) |

### `verify: true` (conferir antes de publicar)
- **Preços:**
  - 911 Turbo S R$ 2.700.000 (FIPE 0 km ago/2026, vindo do PROMPT);
  - 812 Superfast R$ 5.181.178 (FIPE set/2026, ano 2018);
  - 720S R$ 3.395.037 (FIPE set/2026, Coupé 2022);
  - DB12 R$ 3.500.000 (FIPE 0 km jul/2026);
  - Os três valores FIPE vieram de sites espelho de terceiros, não do site oficial da FIPE.
  - Continental GT, Batur e Spectre: "Sob consulta".
- **Specs:** todos os 7 carros. Em particular:
  - potência do 911 Turbo S;
  - versão exata do Continental GT na foto (GT 680 cv ou Speed 782 cv);
  - 0–100 e peso do Batur, que são estimados.
- **Citações (sem fonte primária localizada):**
  - Henry Royce, "Pegue o melhor que existe…";
  - "O melhor carro é sempre o próximo." (inspirada em Enzo Ferrari);
  - Coco Chanel, "O luxo deve ser confortável…".

### `demo: true` (conteúdo ilustrativo da marca)
- Os 3 programas e as 8 melhorias do Ateliê, com valores.
- Números do Manifesto: +120 entregas, 48h de resposta, 100% com laudo cautelar, 1 cliente por visita.
- Texto de resposta "em até 48 horas".
- Contatos: `[Cidade, UF]`, `[Endereço do showroom]`, `[+55 00 00000-0000]`, `[contato@dominio]`.
- Horário de atendimento.
- Circuito Spike e tempo de volta estimado.
- `DEMO_MODE = true` em `src/data/config.ts` mostra a nota no rodapé e o marcador "· ilustrativo" nos números.

---

## 6. Para publicar

1. **Licença das imagens do pack:** origem desconhecida e licença não confirmada. São fotos de imprensa ou de terceiros, algumas com placas e logotipos de montadoras. **Bloqueia a publicação** até haver confirmação ou troca por fotos próprias.
2. **Marcas de terceiros:** nomes de montadoras e modelos aparecem como texto. Avaliar com o jurídico o uso comercial e a relação com cada importadora.
3. **Preços e specs:** conferir todos os itens `verify`. Definir a política para os "Sob consulta" e a data de referência.
4. **Números e prazos do Manifesto e do Concierge:** confirmar ou trocar. Depois, `DEMO_MODE = false`.
5. **Citações:** confirmar as fontes ou trocar.
6. **Contatos:** endereço, cidade/UF, telefone ou WhatsApp (`contact.whatsappNumber` liga o link `wa.me`), e-mail e horário.
7. **Formulário:** integrar o envio (há um `TODO` em `concierge.tsx`) a CRM, e-mail ou WhatsApp Business.
8. **Privacidade:** publicar a política (hoje há um placeholder no consentimento), definir a base legal LGPD, a retenção de dados e o aviso de cookies, se houver analytics no futuro.
9. **Configuração:** definir `NEXT_PUBLIC_SITE_URL` (canonical, OG, sitemap, robots).
10. **SEO:** a página é única com salas por hash, então a indexação por sala é limitada. Se SEO por sala importar, criar rotas reais.
11. **Lighthouse:** repetir na URL publicada; a nota mobile medida (86–87) tem pouca folga sobre o alvo de 85.
12. **Navegadores:** testar no Safari de iPhone e Mac, no Firefox e em um Android real.

---

## 7. Dependências e como rodar

**Dependências:** `next`, `react`, `react-dom`, `motion`, `lucide-react`, `clsx`, `tailwind-merge`, `class-variance-authority`, `@base-ui/react`, `shadcn`, `tw-animate-css` e `@fontsource/{epilogue, cormorant-garamond, jetbrains-mono}` (fontes da imagem OG).

**Dev:** `tailwindcss` 4, `@tailwindcss/turbopack`, `typescript`, `eslint`, `eslint-config-next`, `playwright`, `@axe-core/playwright`, `lighthouse` 12.

```bash
cd spike-motors
npm install
npm run dev            # http://localhost:3000
npm run build && npm start
npm test
npm run lint
npx playwright install chromium && node scripts/shots.mjs http://localhost:3000
node scripts/audit.mjs http://localhost:3000
node scripts/lh.mjs http://localhost:3000/ --runs=3          # Lighthouse mobile (--desktop para desktop)
npx playwright install webkit && node scripts/cross-browser.mjs http://localhost:3000
```

---

## 8. Rodada pós-entrega (performance, rótulos e WebKit)

- **Ignição primeiro no DOM.** Ela vinha depois de todas as salas, e o navegador pintava o cabeçalho antes de receber o resto do HTML; o texto "Segure para ligar" (o elemento de LCP) só aparecia ~300 ms depois. Agora pinta no primeiro quadro. Visualmente nada muda: ela é `fixed` com z-index próprio.
- **Salas fora de cena dormem** (`content-visibility: hidden` em `.room[data-dormant]`, e na pilha inteira enquanto a Ignição cobre a tela). Elas continuavam calculando estilo e as animações infinitas do ShinyButton mesmo invisíveis. Estilo e layout no carregamento caíram de 1.984 ms para 310 ms (CPU 4×). O fallback sem JS desfaz a regra.
- **Nome acessível contém o rótulo visível** (WCAG 2.5.3) no logo, no ícone Spike Control com o selo LIVE e no botão ENGINE START · STOP.
- **Selects iguais em todos os motores:** `appearance: none` com chevron na cor do tema (o WebKit desenhava uma caixa cinza nativa).
- Scripts: `lh.mjs` refeito (o anterior não rodava aqui), `cross-browser.mjs` novo, `contact-sheet.mjs` aceita prefixo, `interact-*.mjs` aceitam a URL base.
