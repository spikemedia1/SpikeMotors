/**
 * Física ilustrativa do Spike Control. Sem dependências (testável com `node --test`).
 *
 * Velocidade: aproximação exponencial v(t) = vmax · (1 − e^(−t/τ)), com τ calibrado
 * para que v(t₁₀₀) = 100 km/h exatamente no tempo oficial do carro (modos PISTA/SPIKE).
 * Acima de 100 km/h a curva é uma estimativa (o "depois continua até 200").
 */

export type DriveMode = "conforto" | "sport" | "pista" | "spike";

export type SimCar = {
  zeroToHundred: number;
  topSpeedKmh: number;
  powerCv: number;
  weightKg?: number;
  redlineRpm: number;
  electric?: boolean;
};

export const MODES: Record<
  DriveMode,
  { label: string; timeFactor: number; rpmLimit: number; lapFactor: number }
> = {
  conforto: { label: "Conforto", timeFactor: 1.3, rpmLimit: 0.7, lapFactor: 1.06 },
  sport: { label: "Sport", timeFactor: 1.08, rpmLimit: 0.85, lapFactor: 1.025 },
  pista: { label: "Pista", timeFactor: 1, rpmLimit: 0.95, lapFactor: 1 },
  spike: { label: "Spike", timeFactor: 1, rpmLimit: 1, lapFactor: 0.985 },
};

export const MODE_ORDER: DriveMode[] = ["conforto", "sport", "pista", "spike"];

/** Tempo 0–100 efetivo no modo (oficial em PISTA e SPIKE). */
export function effectiveZeroToHundred(car: SimCar, mode: DriveMode): number {
  return car.zeroToHundred * MODES[mode].timeFactor;
}

/** Constante de tempo τ (s) que faz v(t₁₀₀) = 100. */
export function tau(car: SimCar, mode: DriveMode): number {
  const vmax = Math.max(car.topSpeedKmh, 110);
  return -effectiveZeroToHundred(car, mode) / Math.log(1 - 100 / vmax);
}

/** Velocidade (km/h) no instante t (s) após a largada. */
export function speedAt(car: SimCar, mode: DriveMode, t: number): number {
  if (t <= 0) return 0;
  return car.topSpeedKmh * (1 - Math.exp(-t / tau(car, mode)));
}

/** Instante (s) em que a velocidade alvo é atingida (inverso de speedAt). */
export function timeToSpeed(car: SimCar, mode: DriveMode, target: number): number {
  if (target >= car.topSpeedKmh) return Infinity;
  return -tau(car, mode) * Math.log(1 - target / car.topSpeedKmh);
}

/** Aceleração longitudinal em g no instante t. */
export function gAt(car: SimCar, mode: DriveMode, t: number): number {
  const v = speedAt(car, mode, t);
  const dvdt = (car.topSpeedKmh - v) / tau(car, mode); // km/h por s
  return dvdt / 3.6 / 9.81;
}

/** Limites de marcha (km/h) escalados pela velocidade máxima; 7 marchas (1 para elétrico). */
export function gearBreaks(car: SimCar): number[] {
  if (car.electric) return [0, car.topSpeedKmh];
  const base = [0, 0.19, 0.31, 0.43, 0.56, 0.7, 0.84, 1];
  return base.map((f) => f * car.topSpeedKmh);
}

/** Giro (rpm) para uma velocidade, com trocas no limite de giro do modo. */
export function rpmAt(car: SimCar, mode: DriveMode, v: number, launchRpm?: number): number {
  const limit = car.redlineRpm * MODES[mode].rpmLimit;
  const breaks = gearBreaks(car);
  let g = 0;
  while (g < breaks.length - 2 && v > breaks[g + 1]) g++;
  const lo = breaks[g];
  const hi = breaks[g + 1];
  const k = Math.min(1, Math.max(0, (v - lo) / (hi - lo)));
  const start = g === 0 ? (launchRpm ?? car.redlineRpm * 0.55) : limit * 0.62;
  return start + (limit - start) * k;
}

/** Relação potência/peso (cv por tonelada). */
export function powerToWeight(car: SimCar): number {
  const kg = car.weightKg ?? 1800;
  return car.powerCv / (kg / 1000);
}

/** Tempo de volta estimado (s) no Circuito Spike pela relação potência/peso. */
export function lapTime(car: SimCar, mode: DriveMode, lengthKm = 4.3): number {
  const ratio = Math.max(80, powerToWeight(car));
  const avgKmh = 95 + 32 * Math.log(ratio / 100);
  return ((lengthKm / avgKmh) * 3600 * MODES[mode].lapFactor);
}

/** "1:46,2" */
export function formatLap(seconds: number): string {
  const m = Math.floor(seconds / 60);
  const s = seconds - m * 60;
  return `${m}:${s.toFixed(1).padStart(4, "0").replace(".", ",")}`;
}

/** "02.500s" para o cronômetro (mono). */
export function formatTimer(seconds: number): string {
  const s = Math.max(0, seconds);
  return `${s.toFixed(3).padStart(6, "0")}s`;
}

/** Duração mínima do "segurar" para não abortar a largada. */
export const MIN_HOLD_S = 0.4;
