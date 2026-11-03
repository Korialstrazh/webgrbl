import { DEFAULT } from '../localization/default.locales';
import { getTestDepthErrorKey } from './get.test.depth.error.key';

describe(getTestDepthErrorKey.name, () => {
  it.each([0.1, 3])('accepts the depth %s for a 3 mm sheet', (depthMm: number) => {
    expect(getTestDepthErrorKey(depthMm, 3)).toBeUndefined();
  });

  it.each([0, -1, 3.1, Number.NaN])('rejects the depth %s for a 3 mm sheet', (depthMm: number) => {
    expect(getTestDepthErrorKey(depthMm, 3)).toBe(DEFAULT.TEST_SAMPLE_DIALOG_DEPTH_INVALID);
  });
});
