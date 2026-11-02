import { getColourRelativeLuminance } from './get.colour.relative.luminance';

const WHITE = '#ffffff';
const BLACK = '#000000';
const MID_GREY = '#777777';
const MID_GREY_LUMINANCE = 0.184;

describe(getColourRelativeLuminance.name, () => {
  it('gives 1 for white and 0 for black', () => {
    expect(getColourRelativeLuminance(WHITE)).toBeCloseTo(1);
    expect(getColourRelativeLuminance(BLACK)).toBe(0);
  });

  it('works out a grey with the gamma curve, not linearly', () => {
    expect(getColourRelativeLuminance(MID_GREY)).toBeCloseTo(MID_GREY_LUMINANCE, 3);
  });

  it.each(['', 'red', '#fff', '#12345g', '123456'])('gives undefined for %j, not a six-digit hex colour', (
    value: string,
  ) => {
    expect(getColourRelativeLuminance(value)).toBeUndefined();
  });
});
