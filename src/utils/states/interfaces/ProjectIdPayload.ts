/**
 * What an action about one stored project carries, such as a request to open or delete it.
 *
 * @author michael.morosov
 *
 * @since 2026-11-01
 *
 * @copyright michael.morosov - All rights reserved.
 * You may not use, distribute or modify this code without explicit permission by michael.morosov.
 */
export interface ProjectIdPayload {
  /** Id of the stored project. */
  projectId: string;
}
