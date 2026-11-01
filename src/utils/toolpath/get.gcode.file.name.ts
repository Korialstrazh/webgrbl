/**
 * Gets the name the exported G-code is saved under: the project name without the characters file systems forbid,
 * plus the .gcode extension.
 *
 * @author michael.morosov
 *
 * @since 2026-11-01
 *
 * @copyright michael.morosov - All rights reserved.
 * You may not use, distribute or modify this code without explicit permission by michael.morosov.
 */
import { GCODE_FILE_EXTENSION } from './gcode.constants';
import { getProjectFileBaseName } from '../project/get.project.file.base.name';

export const getGcodeFileName = (projectName: string): string =>
  getProjectFileBaseName(projectName) + GCODE_FILE_EXTENSION;
