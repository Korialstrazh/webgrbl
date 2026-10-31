import { describe, expect, it } from 'vitest';
import { getFormattedGcodeNumber } from './format.gcode.number';

describe(getFormattedGcodeNumber.name, () => {
  it.each([
    [10, '10'],
    [0.1, '0.1'],
    [-0.1, '-0.1'],
    [1.23456, '1.235'],
    [2.5, '2.5'],
    [-0, '0'],
    [-0.0001, '0'],
  ])('formats %s as %s', (value: number, expected: string) => {
    expect(getFormattedGcodeNumber(value)).toBe(expected);
  });
});
