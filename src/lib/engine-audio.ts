/**
 * Ronco sintetizado com Web Audio: 2 osciladores + ruído filtrado, frequência seguindo o giro.
 * Sem arquivos externos. Desligado por padrão; só inicia após gesto do usuário (ícone do dock).
 */
export class EngineAudio {
  private ctx: AudioContext | null = null;
  private master: GainNode | null = null;
  private o1: OscillatorNode | null = null;
  private o2: OscillatorNode | null = null;
  private filter: BiquadFilterNode | null = null;
  private noiseGain: GainNode | null = null;
  private noise: AudioBufferSourceNode | null = null;
  private cylinders: number;
  private electric: boolean;

  constructor(opts: { cylinders: number; electric?: boolean }) {
    this.cylinders = opts.cylinders;
    this.electric = !!opts.electric;
  }

  start() {
    if (this.ctx) return;
    const Ctx = window.AudioContext ?? (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
    if (!Ctx) return;
    const ctx = new Ctx();
    this.ctx = ctx;

    const master = ctx.createGain();
    master.gain.value = 0;
    master.connect(ctx.destination);
    master.gain.linearRampToValueAtTime(this.electric ? 0.035 : 0.06, ctx.currentTime + 0.4);
    this.master = master;

    const filter = ctx.createBiquadFilter();
    filter.type = "lowpass";
    filter.frequency.value = 400;
    filter.Q.value = 2;
    filter.connect(master);
    this.filter = filter;

    const o1 = ctx.createOscillator();
    o1.type = this.electric ? "sine" : "sawtooth";
    const o2 = ctx.createOscillator();
    o2.type = this.electric ? "triangle" : "square";
    const g2 = ctx.createGain();
    g2.gain.value = this.electric ? 0.3 : 0.45;
    o1.connect(filter);
    o2.connect(g2).connect(filter);
    o1.start();
    o2.start();
    this.o1 = o1;
    this.o2 = o2;

    // ruído filtrado (admissão/escape)
    const buf = ctx.createBuffer(1, ctx.sampleRate, ctx.sampleRate);
    const data = buf.getChannelData(0);
    for (let i = 0; i < data.length; i++) data[i] = Math.random() * 2 - 1;
    const noise = ctx.createBufferSource();
    noise.buffer = buf;
    noise.loop = true;
    const bp = ctx.createBiquadFilter();
    bp.type = "bandpass";
    bp.frequency.value = 900;
    bp.Q.value = 0.8;
    const ng = ctx.createGain();
    ng.gain.value = this.electric ? 0.02 : 0.08;
    noise.connect(bp).connect(ng).connect(master);
    noise.start();
    this.noise = noise;
    this.noiseGain = ng;
  }

  /** Atualiza com o giro atual (rpm) e carga 0..1. */
  update(rpm: number, load = 0.3) {
    if (!this.ctx || !this.o1 || !this.o2 || !this.filter) return;
    const t = this.ctx.currentTime;
    const f = this.electric ? 80 + rpm / 9 : (rpm / 60) * (this.cylinders / 2);
    this.o1.frequency.setTargetAtTime(f, t, 0.03);
    this.o2.frequency.setTargetAtTime(f * (this.electric ? 2.01 : 0.5), t, 0.03);
    this.filter.frequency.setTargetAtTime(300 + rpm * 0.25 + load * 900, t, 0.05);
    this.noiseGain?.gain.setTargetAtTime((this.electric ? 0.01 : 0.04) + load * 0.06, t, 0.08);
  }

  stop() {
    const ctx = this.ctx;
    if (!ctx) return;
    this.master?.gain.setTargetAtTime(0, ctx.currentTime, 0.08);
    window.setTimeout(() => {
      try {
        this.o1?.stop();
        this.o2?.stop();
        this.noise?.stop();
      } catch {}
      void ctx.close();
    }, 300);
    this.ctx = null;
  }
}

/** Número de cilindros pelo texto do motor ("V8", "V12", "W12", "V6"). */
export function cylindersOf(engine: string): number {
  const m = engine.match(/[VW](\d{1,2})/i);
  if (m) return Number(m[1]);
  if (/3\.6/.test(engine)) return 6; // flat-6 do 911
  return 8;
}
