/**
 * Gets the base of a file name made from the project name: the name without the characters file systems forbid,
 * or the fallback base name when nothing is left.
 *
 * @author michael.morosov
 *
 * @since 2026-11-01
 *
 * @copyright 2026 michael.morosov
 * Licensed under the Apache License, Version 2.0. See the LICENSE file.
 */
import { PROJECT_FILE_FALLBACK_BASE_NAME, PROJECT_FILE_NAME_FORBIDDEN_CHARACTERS } from './project.constants';

const NO_CHARACTER = '';

export const getProjectFileBaseName = (projectName: string): string =>
  projectName.replace(PROJECT_FILE_NAME_FORBIDDEN_CHARACTERS, NO_CHARACTER).trim() || PROJECT_FILE_FALLBACK_BASE_NAME;
