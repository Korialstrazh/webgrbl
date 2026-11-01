/**
 * Gets a project name trimmed, or undefined when the trimmed name is empty or longer than 100 characters.
 *
 * @author michael.morosov
 *
 * @since 2026-11-01
 *
 * @copyright michael.morosov - All rights reserved.
 * You may not use, distribute or modify this code without explicit permission by michael.morosov.
 */
import { MAX_PROJECT_NAME_LENGTH, MIN_PROJECT_NAME_LENGTH } from './project.constants';

const isProjectNameLengthAllowed = (trimmedName: string): boolean =>
  trimmedName.length >= MIN_PROJECT_NAME_LENGTH && trimmedName.length <= MAX_PROJECT_NAME_LENGTH;

export const getValidProjectName = (projectName: string): string | undefined => {
  const trimmedName: string = projectName.trim();

  return isProjectNameLengthAllowed(trimmedName) ? trimmedName : undefined;
};
