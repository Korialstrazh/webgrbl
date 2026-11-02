import { getValidPanelSizePercents } from './get.valid.panel.size.percents';

const STORED_PERCENTS: number[] = [20, 55, 25];

describe(getValidPanelSizePercents.name, () => {
  it('accepts one finite positive percentage per panel that add up to 100', () => {
    expect(getValidPanelSizePercents(STORED_PERCENTS)).toEqual(STORED_PERCENTS);
  });

  it('accepts a sum that rounding moved a little away from 100', () => {
    const roundedPercents: number[] = [20.4, 55.3, 24.6];

    expect(getValidPanelSizePercents(roundedPercents)).toEqual(roundedPercents);
  });

  it.each([
    ['nothing', undefined],
    ['a string', '20,55,25'],
    ['an object', { design: 20 }],
    ['too few panels', [45, 55]],
    ['too many panels', [20, 20, 30, 30]],
    ['a value that is not a number', [20, '55', 25]],
    ['a value that is not finite', [20, Number.POSITIVE_INFINITY, 25]],
    ['a value that is not a number at all', [20, Number.NaN, 25]],
    ['a collapsed panel', [0, 75, 25]],
    ['a negative size', [-10, 85, 25]],
    ['a sum far below 100', [10, 20, 30]],
    ['a sum far above 100', [40, 50, 30]],
  ])('falls back to nothing for %s', (_caseName: string, storedValue: unknown) => {
    expect(getValidPanelSizePercents(storedValue)).toBeUndefined();
  });
});
