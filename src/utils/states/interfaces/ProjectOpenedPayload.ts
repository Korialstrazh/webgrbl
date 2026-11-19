/**
 * What the action that names the open project carries.
 *
 * @author michael.morosov
 *
 * @since 2026-11-01
 *
 * @copyright 2026 michael.morosov
 * Licensed under the Apache License, Version 2.0. See the LICENSE file.
 */
export interface ProjectOpenedPayload {
  /** Id of the project now open in the editor. */
  projectId: string;
  /** Display name of that project. */
  name: string;
}
