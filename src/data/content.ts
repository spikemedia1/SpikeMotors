/** Textos editoriais e números da marca (fictícios, demo: true). */

export const salaoCopy = {
  titleLines: ["Exceção,", "por definição."],
  italicLine: 1,
  subtitle: "Curadoria de automóveis que não se repetem. E um ateliê para torná-los ainda mais seus.",
  ctaPrimary: "Entrar na coleção",
  ctaSecondary: "Agendar visita privada",
} as const;

export const colecaoCopy = {
  label: "A garagem",
  priceLabel: "A partir de",
  onRequest: "Sob consulta",
  priceDisclaimer: "Valor de referência, 2026. Sujeito a configuração, câmbio e disponibilidade.",
} as const;

export const manifestoCopy = {
  title: ["Uma recusa,", "não um catálogo."],
  body: "A Spike Motors nasceu de uma recusa: a de vender carros como se vendem produtos. Cada automóvel que entra na nossa coleção é escolhido, inspecionado e documentado como uma peça de acervo. E quando sai, sai como o dono imaginou.",
  stats: [
    { value: 120, prefix: "+", suffix: "", label: "Entregas privadas", demo: true },
    { value: 48, prefix: "", suffix: "h", label: "Resposta média do Concierge", demo: true },
    { value: 100, prefix: "", suffix: "%", label: "Veículos com laudo cautelar", demo: true },
    { value: 1, prefix: "", suffix: "", label: "Cliente por visita no showroom", demo: true },
  ],
  timeline: ["MMXXVI · Fundação", "Coleção privada", "Ateliê Spike", "Spike Control"],
} as const;

export const conciergeCopy = {
  titleLines: ["Uma visita,", "sob medida."],
  intro: "Um especialista, um horário e o carro preparado antes de você chegar.",
  interests: ["Modelo da coleção", "Ateliê", "Spike Care", "Outro"],
  submit: "Solicitar visita privada",
  success: "Recebido. Um especialista retorna em até 48 horas.",
  consent: "Autorizo o contato da Spike Motors sobre esta solicitação.",
  demo: true,
} as const;

export const spikeControlCopy = {
  footer: "Simulação ilustrativa baseada em dados oficiais de fábrica. Não representa desempenho em vias públicas.",
  circuit: { name: "Circuito Spike", lengthKm: 4.3 },
} as const;

export const ignitionCopy = {
  hint: "Segure para ligar",
  skip: "Pular",
} as const;
