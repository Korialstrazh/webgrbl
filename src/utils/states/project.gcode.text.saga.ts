/**
 * Writes the G-code of the open project for a toolpath and profile. The export and a job run share it, so the laser
 * runs the same program a user can export.
 *
 * @author michael.morosov
 *
 * @since 2026-11-04
 *
 * @copyright 2026 michael.morosov
 * Licensed under the Apache License, Version 2.0. See the LICENSE file.
 */
import { select } from 'redux-saga/effects';
import type { MachineProfile } from '../profiles/interfaces/MachineProfile';
import { getGcodeExportContext } from '../toolpath/get.gcode.export.context';
import { getGcodeText } from '../toolpath/get.gcode.text';
import type { Toolpath } from '../toolpath/interfaces/Toolpath';
import { selectGrblSettings } from './grbl.connection.state';
import { selectProjectName } from './project.state';

export function* getProjectGcodeText(toolpath: Toolpath, profile: MachineProfile): Generator {
  const projectName: string = (yield select(selectProjectName)) as string;
  const laserSettings: Record<number, string> = (yield select(selectGrblSettings)) as Record<number, string>;
  const createdAtIso: string = new Date().toISOString();

  return getGcodeText(toolpath, getGcodeExportContext({ profile, laserSettings, projectName, createdAtIso }));
}
