/**
 * What the action that moves, resizes or rotates objects carries.
 *
 * @author michael.morosov
 *
 * @since 2026-11-01
 *
 * @copyright michael.morosov - All rights reserved.
 * You may not use, distribute or modify this code without explicit permission by michael.morosov.
 */
import type { ProjectObjectTransform } from '../../project/interfaces/ProjectObjectTransform';

export interface ProjectObjectTransformsPayload {
  /** The new placement of each object, by object id. */
  transforms: Record<string, ProjectObjectTransform>;
}
