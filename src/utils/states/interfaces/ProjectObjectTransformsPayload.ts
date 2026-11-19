/**
 * What the action that moves, resizes or rotates objects carries.
 *
 * @author michael.morosov
 *
 * @since 2026-11-01
 *
 * @copyright 2026 michael.morosov
 * Licensed under the Apache License, Version 2.0. See the LICENSE file.
 */
import type { ProjectObjectTransform } from '../../project/interfaces/ProjectObjectTransform';

export interface ProjectObjectTransformsPayload {
  /** The new placement of each object, by object id. */
  transforms: Record<string, ProjectObjectTransform>;
}
