/**
 * Gets the name the exported G-code is saved under: the project name without the characters file systems forbid,
 * plus the .gcode extension.
 *
 * @author michael.morosov
 *
 * @since 2026-11-01
 *
 * @copyright 2026 michael.morosov
 * Licensed under the Apache License, Version 2.0. See the LICENSE file.
 */
import { getProjectFileBaseName } from '../project/get.project.file.base.name';
import { GCODE_FILE_EXTENSION } from './gcode.constants';

export const getGcodeFileName = (projectName: string): string =>
  getProjectFileBaseName(projectName) + GCODE_FILE_EXTENSION;
