/**
 * What the actions about a set of project objects carry: deleting and selecting.
 *
 * @author michael.morosov
 *
 * @since 2026-11-01
 *
 * @copyright michael.morosov - All rights reserved.
 * You may not use, distribute or modify this code without explicit permission by michael.morosov.
 */
import type { ProjectObject } from '../../project/interfaces/ProjectObject';

export interface ProjectObjectIdsPayload {
  /** Ids of the objects the action is about. */
  objectIds: ProjectObject['id'][];
}
