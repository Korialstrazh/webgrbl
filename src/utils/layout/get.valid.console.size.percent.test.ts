import { getValidConsoleSizePercent } from './get.valid.console.size.percent';

const STORED_PERCENT = 35;

describe(getValidConsoleSizePercent.name, () => {
  it('accepts a percentage between 0 and 100', () => {
    expect(getValidConsoleSizePercent(STORED_PERCENT)).toBe(STORED_PERCENT);
  });

  it.each([
    ['nothing', undefined],
    ['a string', '35'],
    ['a list', [STORED_PERCENT]],
    ['a value that is not finite', Number.POSITIVE_INFINITY],
    ['a value that is not a number at all', Number.NaN],
    ['a collapsed console', 0],
    ['a negative size', -10],
    ['the whole column', 100],
  ])('falls back to nothing for %s', (_caseName: string, storedValue: unknown) => {
    expect(getValidConsoleSizePercent(storedValue)).toBeUndefined();
  });
});
