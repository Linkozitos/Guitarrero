import { describe, expect, it } from "vitest";
import { midiToFreqHz } from "@core/music";

// Referência: midiToFreqHz do protótipo TAB Simplifier Pro
// (docs/prototipos/tab-simplifier-pro-2026-11-21.html, linha 1757). A fórmula é a mesma,
// 440 × 2^((midi − 69) / 12); o protótipo só arredonda o resultado para 1 casa ao exibir.
describe("midiToFreqHz", () => {
  it("devolve 440 Hz para o Lá 4 (MIDI 69)", () => {
    expect(midiToFreqHz(69)).toBe(440);
  });

  it("divide a frequência por 2 a cada oitava abaixo do Lá 4", () => {
    expect(midiToFreqHz(57)).toBe(220);
    expect(midiToFreqHz(45)).toBe(110);
  });

  it("calcula as cordas Mi grave (E2, MIDI 40) e Mi aguda (E4, MIDI 64) com precisão total", () => {
    expect(midiToFreqHz(40)).toBeCloseTo(82.4069, 4);
    expect(midiToFreqHz(64)).toBeCloseTo(329.6276, 4);
  });

  it("arredondado a 1 casa, reproduz os valores exibidos pelo protótipo", () => {
    expect(Number(midiToFreqHz(40).toFixed(1))).toBe(82.4);
    expect(Number(midiToFreqHz(64).toFixed(1))).toBe(329.6);
  });
});
