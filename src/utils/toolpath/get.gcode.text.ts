/**
 * Writes the toolpath as GRBL 1.1 laser G-code. Each layer in the toolpath is already an enabled layer, so nothing
 * else is written.
 *
 * @author michael.morosov
 *
 * @since 2026-11-01
 *
 * @copyright 2026 michael.morosov
 * Licensed under the Apache License, Version 2.0. See the LICENSE file.
 */
import { GCODE_LINE_SEPARATOR } from './gcode.constants';
import { getGcodeLines } from './get.gcode.lines';
import type { GcodeContext } from './interfaces/GcodeContext';
import type { GcodeLine } from './interfaces/GcodeLine';
import type { Toolpath } from './interfaces/Toolpath';

export const getGcodeText = (toolpath: Toolpath, context: GcodeContext): string =>
  getGcodeLines(toolpath, context)
    .map((line: GcodeLine): string => line.text)
    .join(GCODE_LINE_SEPARATOR);
