/**
 * Splits a prepared G-code line into letter-and-number words.
 *
 * @author michael.morosov
 *
 * @since 2026-10-30
 *
 * @copyright michael.morosov - All rights reserved.
 * You may not use, distribute or modify this code without explicit permission by michael.morosov.
 */
import {
  GRBL_SIMULATOR_ERROR_BAD_NUMBER,
  GRBL_SIMULATOR_ERROR_INVALID_LETTER,
  GRBL_SIMULATOR_IGNORED_WORD_LETTERS,
  GRBL_SIMULATOR_LINE_START_PATTERN,
  GRBL_SIMULATOR_NUMBER_PATTERN,
  GRBL_SIMULATOR_WORD,
  GRBL_SIMULATOR_WORD_PATTERN,
} from './grbl.simulator.constants';
import type { GrblSimulatorGcodeError } from './interfaces/GrblSimulatorGcodeError';
import type { GrblSimulatorGcodeWord } from './interfaces/GrblSimulatorGcodeWord';

const KNOWN_LETTERS: readonly string[] = [
  ...Object.values(GRBL_SIMULATOR_WORD),
  ...GRBL_SIMULATOR_IGNORED_WORD_LETTERS,
];

export const getParsedGcodeWords = (line: string): GrblSimulatorGcodeWord[] | GrblSimulatorGcodeError => {
  const upperLine: string = line.toUpperCase();

  if (!upperLine) {
    return [];
  }

  if (!GRBL_SIMULATOR_LINE_START_PATTERN.test(upperLine)) {
    return { errorCode: GRBL_SIMULATOR_ERROR_INVALID_LETTER };
  }

  const words: GrblSimulatorGcodeWord[] = [];

  for (const wordText of upperLine.match(GRBL_SIMULATOR_WORD_PATTERN) ?? []) {
    const letter: string = wordText.slice(0, 1);
    const valueText: string = wordText.slice(1);

    if (!KNOWN_LETTERS.includes(letter)) {
      return { errorCode: GRBL_SIMULATOR_ERROR_INVALID_LETTER };
    }

    if (!GRBL_SIMULATOR_NUMBER_PATTERN.test(valueText)) {
      return { errorCode: GRBL_SIMULATOR_ERROR_BAD_NUMBER };
    }

    words.push({ letter, value: Number(valueText) });
  }

  return words;
};
