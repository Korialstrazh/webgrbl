/**
 * Writes the G-code lines of the open project for a toolpath and profile, each with the move it carries out, so a
 * running job can tell which move a confirmed line belongs to.
 *
 * @author michael.morosov
 *
 * @since 2026-11-19
 *
 * @copyright 2026 michael.morosov
 * Licensed under the Apache License, Version 2.0. See the LICENSE file.
 */
import type { MachineProfile } from '../profiles/interfaces/MachineProfile';
import { getGcodeLines } from '../toolpath/get.gcode.lines';
import type { GcodeContext } from '../toolpath/interfaces/GcodeContext';
import type { Toolpath } from '../toolpath/interfaces/Toolpath';
import { getProjectGcodeContext } from './project.gcode.context.saga';

export function* getProjectGcodeLines(toolpath: Toolpath, profile: MachineProfile): Generator {
  const context: GcodeContext = (yield* getProjectGcodeContext(profile)) as GcodeContext;

  return getGcodeLines(toolpath, context);
}
