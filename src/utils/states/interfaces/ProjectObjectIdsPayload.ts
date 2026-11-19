/**
 * What the actions about a set of project objects carry: deleting and selecting.
 *
 * @author michael.morosov
 *
 * @since 2026-11-01
 *
 * @copyright 2026 michael.morosov
 * Licensed under the Apache License, Version 2.0. See the LICENSE file.
 */
import type { ProjectObject } from '../../project/interfaces/ProjectObject';

export interface ProjectObjectIdsPayload {
  /** Ids of the objects the action is about. */
  objectIds: ProjectObject['id'][];
}
