/**
 * What the action that adds objects to the project carries.
 *
 * @author michael.morosov
 *
 * @since 2026-11-01
 *
 * @copyright michael.morosov - All rights reserved.
 * You may not use, distribute or modify this code without explicit permission by michael.morosov.
 */
import type { ProjectObject } from '../../project/interfaces/ProjectObject';

export interface ProjectObjectsPayload {
  /** The objects to add. */
  objects: ProjectObject[];
}
