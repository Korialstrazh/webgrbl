import { describe, expect, it } from 'vitest';
import { getGrblRxBufferSizeFromBuildOption } from './grbl.build.info.parser';

describe(getGrblRxBufferSizeFromBuildOption.name, () => {
  it('returns the reported buffer size minus the unusable byte', () => {
    expect(getGrblRxBufferSizeFromBuildOption('[OPT:VNML,15,128]')).toBe(127);
    expect(getGrblRxBufferSizeFromBuildOption('[OPT:V,35,1024]')).toBe(1023);
  });

  it('returns undefined for a version line', () => {
    expect(getGrblRxBufferSizeFromBuildOption('[VER:1.1h.20190825:]')).toBeUndefined();
  });
});
