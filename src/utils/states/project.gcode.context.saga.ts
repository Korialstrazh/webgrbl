/**
 * Gets the G-code context of the open project for a profile: its name, the connected machine's laser settings and the
 * moment the G-code is made.
 *
 * @author michael.morosov
 *
 * @since 2026-11-19
 *
 * @copyright 2026 michael.morosov
 * Licensed under the Apache License, Version 2.0. See the LICENSE file.
 */
import { select } from 'redux-saga/effects';
import type { MachineProfile } from '../profiles/interfaces/MachineProfile';
import { getGcodeExportContext } from '../toolpath/get.gcode.export.context';
import { selectGrblSettings } from './grbl.connection.state';
import { selectProjectName } from './project.state';

export function* getProjectGcodeContext(profile: MachineProfile): Generator {
  const projectName: string = (yield select(selectProjectName)) as string;
  const laserSettings: Record<number, string> = (yield select(selectGrblSettings)) as Record<number, string>;
  const createdAtIso: string = new Date().toISOString();

  return getGcodeExportContext({ profile, laserSettings, projectName, createdAtIso });
}
