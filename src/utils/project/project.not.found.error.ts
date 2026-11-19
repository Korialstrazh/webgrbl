/** Developer-facing message of the error. */
const getProjectNotFoundErrorMessage = (projectId: string): string => `No stored project has the id "${projectId}"`;

/**
 * Rejects a write to a project that is not in the database, for example one deleted in the meantime, so a late save
 * never brings a deleted project back.
 *
 * @author michael.morosov
 *
 * @since 2026-11-01
 *
 * @copyright 2026 michael.morosov
 * Licensed under the Apache License, Version 2.0. See the LICENSE file.
 */
export class ProjectNotFoundError extends Error {
  public constructor(projectId: string) {
    super(getProjectNotFoundErrorMessage(projectId));
    this.name = ProjectNotFoundError.name;
  }
}
