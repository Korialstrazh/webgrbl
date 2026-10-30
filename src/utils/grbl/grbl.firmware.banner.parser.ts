/**
 * Reads the firmware name and version from a GRBL welcome banner.
 *
 * @author michael.morosov
 *
 * @since 2026-10-30
 *
 * @copyright michael.morosov - All rights reserved.
 * You may not use, distribute or modify this code without explicit permission by michael.morosov.
 */
import { GRBL_BANNER_PATTERN, GRBL_EMPTY_TEXT } from './grbl.constants';
import type { GrblFirmwareIdentity } from './interfaces/GrblFirmwareIdentity';

export const getParsedGrblFirmwareIdentity = (line: string): GrblFirmwareIdentity | undefined => {
  const bannerMatch: RegExpMatchArray | null = line.trim().match(GRBL_BANNER_PATTERN);

  if (!bannerMatch) {
    return undefined;
  }

  const [, firmwareName = GRBL_EMPTY_TEXT, version = GRBL_EMPTY_TEXT, vendorText = GRBL_EMPTY_TEXT] = bannerMatch;

  return { firmwareName, version, vendorText };
};
