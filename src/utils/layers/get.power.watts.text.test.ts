import { describe, expect, it } from 'vitest';
import { getPowerWattsText } from './get.power.watts.text';

describe(getPowerWattsText.name, () => {
  it('gives watts with one decimal', () => {
    expect(getPowerWattsText(10, 60)).toBe('6.0');
    expect(getPowerWattsText(7, 33)).toBe('2.3');
  });
});
