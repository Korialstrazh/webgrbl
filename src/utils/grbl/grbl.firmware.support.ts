/**
 * Decides whether a firmware version is new enough for this engine (GRBL 1.1 or later).
 *
 * @author michael.morosov
 *
 * @since 2026-10-30
 *
 * @copyright 2026 michael.morosov
 * Licensed under the Apache License, Version 2.0. See the LICENSE file.
 */
import {
  GRBL_MIN_SUPPORTED_MAJOR_VERSION,
  GRBL_MIN_SUPPORTED_MINOR_VERSION,
  GRBL_VERSION_NUMBER_PATTERN,
} from './grbl.constants';
import type { GrblFirmwareIdentity } from './interfaces/GrblFirmwareIdentity';

export const isSupportedGrblFirmware = (identity: GrblFirmwareIdentity): boolean => {
  const versionMatch: RegExpMatchArray | null = identity.version.match(GRBL_VERSION_NUMBER_PATTERN);

  if (!versionMatch) {
    return false;
  }

  const majorVersion: number = Number(versionMatch[1]);
  const minorVersion: number = Number(versionMatch[2]);

  if (majorVersion !== GRBL_MIN_SUPPORTED_MAJOR_VERSION) {
    return majorVersion > GRBL_MIN_SUPPORTED_MAJOR_VERSION;
  }

  return minorVersion >= GRBL_MIN_SUPPORTED_MINOR_VERSION;
};
