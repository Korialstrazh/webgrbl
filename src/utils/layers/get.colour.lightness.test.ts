import { getColourLightness } from './get.colour.lightness';

describe(getColourLightness.name, () => {
  it('is 0 for black and 1 for white', () => {
    expect(getColourLightness('#000000')).toBe(0);
    expect(getColourLightness('#ffffff')).toBe(1);
  });

  it('averages the channels', () => {
    expect(getColourLightness('#ff0000')).toBeCloseTo(1 / 3);
  });
});
