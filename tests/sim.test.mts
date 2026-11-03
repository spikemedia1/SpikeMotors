import { test } from "node:test";
import assert from "node:assert/strict";
import {
  effectiveZeroToHundred,
  formatLap,
  formatTimer,
  gAt,
  lapTime,
  rpmAt,
  speedAt,
  timeToSpeed,
  type SimCar,
} from "../src/lib/sim.ts";

const turboS: SimCar = { zeroToHundred: 2.5, topSpeedKmh: 322, powerCv: 711, weightKg: 1720, redlineRpm: 7200 };
const spectre: SimCar = { zeroToHundred: 4.5, topSpeedKmh: 250, powerCv: 585, weightKg: 2975, redlineRpm: 10000, electric: true };

test("100 km/h exatamente no tempo oficial (PISTA)", () => {
  assert.ok(Math.abs(speedAt(turboS, "pista", 2.5) - 100) < 1e-9);
  assert.ok(Math.abs(timeToSpeed(turboS, "pista", 100) - 2.5) < 1e-9);
  assert.ok(Math.abs(timeToSpeed(spectre, "spike", 100) - 4.5) < 1e-9);
});

test("modos mais calmos são mais lentos", () => {
  assert.ok(effectiveZeroToHundred(turboS, "conforto") > effectiveZeroToHundred(turboS, "sport"));
  assert.equal(effectiveZeroToHundred(turboS, "pista"), effectiveZeroToHundred(turboS, "spike"));
});

test("velocidade é monotônica e limitada", () => {
  let prev = -1;
  for (let t = 0; t <= 30; t += 0.25) {
    const v = speedAt(turboS, "pista", t);
    assert.ok(v >= prev);
    assert.ok(v < turboS.topSpeedKmh);
    prev = v;
  }
  assert.ok(Number.isFinite(timeToSpeed(turboS, "pista", 200)));
  assert.equal(timeToSpeed(spectre, "pista", 260), Infinity);
});

test("g positivo e decrescente", () => {
  assert.ok(gAt(turboS, "pista", 0) > gAt(turboS, "pista", 3));
  assert.ok(gAt(turboS, "pista", 0) > 0.8 && gAt(turboS, "pista", 0) < 2.5);
});

test("giro dentro do limite do modo", () => {
  for (let v = 0; v <= 320; v += 5) {
    const r = rpmAt(turboS, "sport", v);
    assert.ok(r <= turboS.redlineRpm * 0.85 + 1e-6, `v=${v} rpm=${r}`);
    assert.ok(r > 0);
  }
});

test("volta: mais potência/peso = mais rápido", () => {
  assert.ok(lapTime(turboS, "pista") < lapTime(spectre, "pista"));
  assert.match(formatLap(106.24), /^1:46,2$/);
  assert.equal(formatTimer(2.5), "02.500s");
});
