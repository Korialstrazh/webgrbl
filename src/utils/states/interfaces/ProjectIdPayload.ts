/**
 * What an action about one stored project carries, such as a request to open or delete it.
 *
 * @author michael.morosov
 *
 * @since 2026-11-01
 *
 * @copyright 2026 michael.morosov
 * Licensed under the Apache License, Version 2.0. See the LICENSE file.
 */
export interface ProjectIdPayload {
  /** Id of the stored project. */
  projectId: string;
}
