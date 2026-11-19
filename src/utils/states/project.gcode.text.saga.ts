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
import type { MachineProfile } from '../profiles/interfaces/MachineProfile';
import { getGcodeText } from '../toolpath/get.gcode.text';
import type { GcodeContext } from '../toolpath/interfaces/GcodeContext';
import type { Toolpath } from '../toolpath/interfaces/Toolpath';
import { getProjectGcodeContext } from './project.gcode.context.saga';

export function* getProjectGcodeText(toolpath: Toolpath, profile: MachineProfile): Generator {
  const context: GcodeContext = (yield* getProjectGcodeContext(profile)) as GcodeContext;

  return getGcodeText(toolpath, context);
}
