/**
 * Gets the base of a file name made from the project name: the name without the characters file systems forbid,
 * or the fallback base name when nothing is left.
 *
 * @author michael.morosov
 *
 * @since 2026-11-01
 *
 * @copyright michael.morosov - All rights reserved.
 * You may not use, distribute or modify this code without explicit permission by michael.morosov.
 */
import { PROJECT_FILE_FALLBACK_BASE_NAME, PROJECT_FILE_NAME_FORBIDDEN_CHARACTERS } from './project.constants';

const NO_CHARACTER = '';

export const getProjectFileBaseName = (projectName: string): string =>
  projectName.replace(PROJECT_FILE_NAME_FORBIDDEN_CHARACTERS, NO_CHARACTER).trim() || PROJECT_FILE_FALLBACK_BASE_NAME;
