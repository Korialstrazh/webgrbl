import { describe, expect, it } from 'vitest';
import { getNormalizedColour } from './normalize.colour';

const NORMALIZED_CASES: Array<[string, string]> = [
  ['red', '#ff0000'],
  ['Orange', '#ffa500'],
  ['#F00', '#ff0000'],
  ['#00A0FF', '#00a0ff'],
  ['rgb(0, 0, 255)', '#0000ff'],
  ['rgb(0,16,255)', '#0010ff'],
];
const UNSUPPORTED_VALUES = ['none', 'transparent', 'currentColor', 'url(#g)', '', 'rgb(256, 0, 0)', '#ff', 'toString'];

describe(getNormalizedColour.name, () => {
  it.each(NORMALIZED_CASES)('turns %s into %s', (value: string, expectedColour: string) => {
    expect(getNormalizedColour(value)).toBe(expectedColour);
  });

  it.each(UNSUPPORTED_VALUES)('gives undefined for %s', (value: string) => {
    expect(getNormalizedColour(value)).toBeUndefined();
  });
});
