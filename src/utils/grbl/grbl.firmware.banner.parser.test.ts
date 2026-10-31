import { describe, expect, it } from 'vitest';
import { getParsedGrblFirmwareIdentity } from './grbl.firmware.banner.parser';

const FIRMWARE_NAME_GRBL = 'Grbl';
const ACMER_S2_BANNER = "Grbl 1.1h ['$' for help]";

describe(getParsedGrblFirmwareIdentity.name, () => {
  it('parses a Grbl banner and keeps the letter suffix', () => {
    expect(getParsedGrblFirmwareIdentity("Grbl 1.1h ['$' for help]")).toEqual({
      firmwareName: FIRMWARE_NAME_GRBL,
      version: '1.1h',
      vendorText: "['$' for help]",
    });
  });

  it('parses the banner recorded from a real ACMER S2', () => {
    expect(getParsedGrblFirmwareIdentity(ACMER_S2_BANNER)).toMatchObject({
      firmwareName: FIRMWARE_NAME_GRBL,
      version: '1.1h',
    });
  });

  it('parses a GrblHAL banner', () => {
    expect(getParsedGrblFirmwareIdentity("GrblHAL 1.1f ['$' or '$HELP' for help]")).toMatchObject({
      firmwareName: 'GrblHAL',
      version: '1.1f',
    });
  });

  it('parses a version without suffix or vendor text', () => {
    expect(getParsedGrblFirmwareIdentity('Grbl 1.2')).toEqual({
      firmwareName: FIRMWARE_NAME_GRBL,
      version: '1.2',
      vendorText: '',
    });
  });

  it('returns undefined for other firmware', () => {
    expect(getParsedGrblFirmwareIdentity('Marlin 2.1')).toBeUndefined();
  });
});
