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
import {
  PROJECT_FILE_EXTENSION,
  PROJECT_FILE_FALLBACK_BASE_NAME,
  PROJECT_FILE_NAME_FORBIDDEN_CHARACTERS,
} from './project.constants';

const NO_CHARACTER = '';

export const getProjectFileName = (projectName: string): string => {
  const allowedBaseName: string = projectName.replace(PROJECT_FILE_NAME_FORBIDDEN_CHARACTERS, NO_CHARACTER).trim();

  return (allowedBaseName || PROJECT_FILE_FALLBACK_BASE_NAME) + PROJECT_FILE_EXTENSION;
};
