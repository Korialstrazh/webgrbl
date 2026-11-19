/**
 * Gets a project name trimmed, or undefined when the trimmed name is empty or longer than 100 characters.
 *
 * @author michael.morosov
 *
 * @since 2026-11-01
 *
 * @copyright 2026 michael.morosov
 * Licensed under the Apache License, Version 2.0. See the LICENSE file.
 */
import { MAX_PROJECT_NAME_LENGTH, MIN_PROJECT_NAME_LENGTH } from './project.constants';

const isProjectNameLengthAllowed = (trimmedName: string): boolean =>
  trimmedName.length >= MIN_PROJECT_NAME_LENGTH && trimmedName.length <= MAX_PROJECT_NAME_LENGTH;

export const getValidProjectName = (projectName: string): string | undefined => {
  const trimmedName: string = projectName.trim();

  return isProjectNameLengthAllowed(trimmedName) ? trimmedName : undefined;
};
