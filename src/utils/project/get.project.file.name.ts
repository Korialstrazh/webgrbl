/**
 * Gets the name a downloaded project file is saved under: the project name without the characters file systems forbid,
 * plus the .webgrbl.json extension.
 *
 * @author michael.morosov
 *
 * @since 2026-11-01
 *
 * @copyright 2026 michael.morosov
 * Licensed under the Apache License, Version 2.0. See the LICENSE file.
 */
import { getProjectFileBaseName } from './get.project.file.base.name';
import { PROJECT_FILE_EXTENSION } from './project.constants';

export const getProjectFileName = (projectName: string): string =>
  getProjectFileBaseName(projectName) + PROJECT_FILE_EXTENSION;
