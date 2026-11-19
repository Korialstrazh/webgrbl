/**
 * Gets the G-code context of an export: the machine from the active profile, the S max the laser reports (else the
 * profile's, else the default, as the pointer uses), the project name, the app version and the export time.
 *
 * @author michael.morosov
 *
 * @since 2026-11-01
 *
 * @copyright 2026 michael.morosov
 * Licensed under the Apache License, Version 2.0. See the LICENSE file.
 */
import { APP_VERSION } from '../app.version.constants';
import { getPointerSValueMax } from '../machine/get.pointer.s.value.max';
import { getValidGcodeSValueMax } from './get.valid.gcode.s.value.max';
import type { GcodeContext } from './interfaces/GcodeContext';
import type { GcodeExportContextInput } from './interfaces/GcodeExportContextInput';

export const getGcodeExportContext = (input: GcodeExportContextInput): GcodeContext => {
  const { profile, laserSettings, projectName, createdAtIso } = input;

  return {
    projectName,
    profileName: profile.name,
    originCorner: profile.originCorner,
    workAreaXMm: profile.workAreaXMm,
    workAreaYMm: profile.workAreaYMm,
    sValueMax: getValidGcodeSValueMax(getPointerSValueMax(laserSettings, profile)),
    hasAirAssist: profile.hasAirAssist,
    appVersion: APP_VERSION,
    createdAtIso,
  };
};
