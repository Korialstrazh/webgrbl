import { describe, expect, it } from 'vitest';
import { getGrblRxBufferSizeFromBuildOption } from './grbl.build.info.parser';

const ACMER_S2_OPT_LINE = '[OPT:VMP,31,511]';
const ACMER_S2_VER_LINE = '[VER:1.0.1,20250515:]';

describe(getGrblRxBufferSizeFromBuildOption.name, () => {
  it('returns the reported buffer size minus the unusable byte', () => {
    expect(getGrblRxBufferSizeFromBuildOption('[OPT:VNML,15,128]')).toBe(127);
    expect(getGrblRxBufferSizeFromBuildOption('[OPT:V,35,1024]')).toBe(1023);
  });

  it('returns 510 for the option line recorded from a real ACMER S2', () => {
    expect(getGrblRxBufferSizeFromBuildOption(ACMER_S2_OPT_LINE)).toBe(510);
  });

  it('returns undefined for the version line recorded from a real ACMER S2', () => {
    expect(getGrblRxBufferSizeFromBuildOption(ACMER_S2_VER_LINE)).toBeUndefined();
  });

  it('returns undefined for a version line', () => {
    expect(getGrblRxBufferSizeFromBuildOption('[VER:1.1h.20190825:]')).toBeUndefined();
  });
});
