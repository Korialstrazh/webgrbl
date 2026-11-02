/**
 * Gets the name a downloaded project file is saved under: the project name without the characters file systems forbid,
 * plus the .webgrbl.json extension.
 *
 * @author michael.morosov
 *
 * @since 2026-11-01
 *
 * @copyright michael.morosov - All rights reserved.
 * You may not use, distribute or modify this code without explicit permission by michael.morosov.
 */
import { getProjectFileBaseName } from './get.project.file.base.name';
import { PROJECT_FILE_EXTENSION } from './project.constants';

export const getProjectFileName = (projectName: string): string =>
  getProjectFileBaseName(projectName) + PROJECT_FILE_EXTENSION;
