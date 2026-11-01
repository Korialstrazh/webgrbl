import { MAX_PROJECT_NAME_LENGTH, MIN_PROJECT_NAME_LENGTH } from './project.constants';

/** Developer-facing message of the error. */
const INVALID_PROJECT_NAME_ERROR_MESSAGE =
  `A project name must have ${MIN_PROJECT_NAME_LENGTH} to ${MAX_PROJECT_NAME_LENGTH} characters after trimming`;

/**
 * Rejects a project name that is empty or too long after trimming, so no such name ever reaches the database.
 *
 * @author michael.morosov
 *
 * @since 2026-11-01
 *
 * @copyright michael.morosov - All rights reserved.
 * You may not use, distribute or modify this code without explicit permission by michael.morosov.
 */
export class InvalidProjectNameError extends Error {
  public constructor() {
    super(INVALID_PROJECT_NAME_ERROR_MESSAGE);
    this.name = InvalidProjectNameError.name;
  }
}
