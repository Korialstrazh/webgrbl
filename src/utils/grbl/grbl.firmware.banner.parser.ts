/**
 * Reads the firmware name and version from a GRBL welcome banner.
 *
 * @author michael.morosov
 *
 * @since 2026-10-30
 *
 * @copyright 2026 michael.morosov
 * Licensed under the Apache License, Version 2.0. See the LICENSE file.
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
