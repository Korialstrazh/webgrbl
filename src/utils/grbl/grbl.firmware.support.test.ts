import { describe, expect, it } from 'vitest';
import { getParsedGrblFirmwareIdentity } from './grbl.firmware.banner.parser';
import { isSupportedGrblFirmware } from './grbl.firmware.support';

const isBannerSupported = (banner: string): boolean => {
  const identity = getParsedGrblFirmwareIdentity(banner);

  return identity ? isSupportedGrblFirmware(identity) : false;
};

describe(isSupportedGrblFirmware.name, () => {
  it('accepts 1.1', () => {
    expect(isBannerSupported("Grbl 1.1h ['$' for help]")).toBe(true);
  });

  it('accepts a 1.2 clone', () => {
    expect(isBannerSupported('Grbl 1.2h')).toBe(true);
  });

  it('accepts FluidNC reporting 3.x', () => {
    expect(isBannerSupported('Grbl 3.7 [FluidNC v3.7.8 (wifi) ...]')).toBe(true);
  });

  it('rejects 0.9', () => {
    expect(isBannerSupported('Grbl 0.9j')).toBe(false);
  });
});
