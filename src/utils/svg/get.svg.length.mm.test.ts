import { getSvgLengthMm } from './get.svg.length.mm';
import { MM_PER_INCH } from './svg.constants';

describe(getSvgLengthMm.name, () => {
  it('reads millimetres as they are', () => {
    expect(getSvgLengthMm('100mm')).toBe(100);
  });

  it('converts inches, points and pixels', () => {
    expect(getSvgLengthMm('2in')).toBeCloseTo(2 * MM_PER_INCH);
    expect(getSvgLengthMm('72pt')).toBeCloseTo(MM_PER_INCH);
    expect(getSvgLengthMm('96px')).toBeCloseTo(MM_PER_INCH);
  });

  it('treats a unitless number as pixels', () => {
    expect(getSvgLengthMm('96')).toBeCloseTo(MM_PER_INCH);
  });

  it('gives undefined for a missing, percent, non-positive or unparseable value', () => {
    expect(getSvgLengthMm('100%')).toBeUndefined();
    expect(getSvgLengthMm('')).toBeUndefined();
    expect(getSvgLengthMm(null)).toBeUndefined();
    expect(getSvgLengthMm('-5mm')).toBeUndefined();
    expect(getSvgLengthMm('0mm')).toBeUndefined();
    expect(getSvgLengthMm('abc')).toBeUndefined();
    expect(getSvgLengthMm('5furlong')).toBeUndefined();
  });
});
