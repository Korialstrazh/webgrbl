import { getConsoleSizePercent } from './get.console.size.percent';

describe(getConsoleSizePercent.name, () => {
  it('gives the console height in percent of the column', () => {
    expect(getConsoleSizePercent([300, 100])).toBe(25);
  });

  it('gives nothing when the column has no height yet', () => {
    expect(getConsoleSizePercent([0, 0])).toBeUndefined();
  });

  it('gives nothing when the console panel is missing', () => {
    expect(getConsoleSizePercent([400])).toBeUndefined();
  });
});
