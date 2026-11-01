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
 * @copyright michael.morosov - All rights reserved.
 * You may not use, distribute or modify this code without explicit permission by michael.morosov.
 */
export class ProjectNotFoundError extends Error {
  public constructor(projectId: string) {
    super(getProjectNotFoundErrorMessage(projectId));
    this.name = ProjectNotFoundError.name;
  }
}
