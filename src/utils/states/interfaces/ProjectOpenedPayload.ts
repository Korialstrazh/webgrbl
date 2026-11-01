/**
 * What the action that names the open project carries.
 *
 * @author michael.morosov
 *
 * @since 2026-11-01
 *
 * @copyright michael.morosov - All rights reserved.
 * You may not use, distribute or modify this code without explicit permission by michael.morosov.
 */
export interface ProjectOpenedPayload {
  /** Id of the project now open in the editor. */
  projectId: string;
  /** Display name of that project. */
  name: string;
}
