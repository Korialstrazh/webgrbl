/**
 * Tests for the lookup of the description key of a GRBL error code.
 *
 * @author michael.morosov
 *
 * @since 2026-10-30
 *
 * @copyright 2026 michael.morosov
 * Licensed under the Apache License, Version 2.0. See the LICENSE file.
 */
import { describe, expect, it } from 'vitest';
import { NON_ASCII_LINE_ERROR_CODE } from '../grbl/grbl.constants';
import { DEFAULT } from '../localization/default.locales';
import { getGrblErrorDescriptionKey } from './grbl.error.description.key';

const FIRST_ERROR_CODE = 1;
const LAST_ERROR_CODE = 38;
const KNOWN_ERROR_CODES: number[] = Array.from(
  { length: LAST_ERROR_CODE - FIRST_ERROR_CODE + 1 },
  (_unused: unknown, index: number) => FIRST_ERROR_CODE + index,
);
const UNKNOWN_ERROR_CODES: number[] = [0, LAST_ERROR_CODE + 1, 99, -2];
const SAMPLE_ERROR_CODE = 20;

describe(getGrblErrorDescriptionKey.name, () => {
  it('maps a sample code to its key', () => {
    expect(getGrblErrorDescriptionKey(SAMPLE_ERROR_CODE)).toBe('GRBL_ERROR_20');
  });

  it.each(KNOWN_ERROR_CODES)('maps code %i to a key that exists', (code: number) => {
    expect(getGrblErrorDescriptionKey(code)).toBe(DEFAULT[`GRBL_ERROR_${code}` as keyof typeof DEFAULT]);
  });

  it.each(UNKNOWN_ERROR_CODES)('maps unknown code %i to the unknown key', (code: number) => {
    expect(getGrblErrorDescriptionKey(code)).toBe(DEFAULT.GRBL_ERROR_UNKNOWN);
  });

  it('maps the client-side non-ASCII line code to its own key', () => {
    expect(getGrblErrorDescriptionKey(NON_ASCII_LINE_ERROR_CODE)).toBe(DEFAULT.GRBL_ERROR_NON_ASCII_LINE);
  });
});
