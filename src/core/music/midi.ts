/** Nota MIDI do Lá 4 (A4), a referência da afinação padrão. */
const A4_MIDI = 69;

/** Frequência do Lá 4 na afinação padrão, em Hz. */
const A4_FREQUENCY_HZ = 440;

/**
 * Frequência em Hz de uma nota MIDI no temperamento igual com Lá 4 = 440 Hz:
 * f = 440 × 2^((midi − 69) / 12). Cada semitom multiplica a frequência por 2^(1/12)
 * e cada oitava (12 semitons) a dobra.
 *
 * Devolve a precisão total. O protótipo TAB Simplifier Pro arredonda para 1 casa porque só
 * exibe o valor; esse arredondamento fica para a interface.
 * Custo O(1) em tempo e memória.
 */
export function midiToFreqHz(midi: number): number {
  return A4_FREQUENCY_HZ * 2 ** ((midi - A4_MIDI) / 12);
}
