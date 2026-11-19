/**
 * What the action that adds objects to the project carries.
 *
 * @author michael.morosov
 *
 * @since 2026-11-01
 *
 * @copyright 2026 michael.morosov
 * Licensed under the Apache License, Version 2.0. See the LICENSE file.
 */
import type { ProjectLayer } from '../../layers/interfaces/ProjectLayer';
import type { ProjectObject } from '../../project/interfaces/ProjectObject';

export interface ProjectObjectsPayload {
  /** The objects to add. */
  objects: ProjectObject[];
  /**
   * Layers derived from the palette for the colours of the document with the added objects. The reducer adds only the
   * layers whose key is new, so an existing layer keeps its settings, and stores them in the same undo step.
   */
  layers: ProjectLayer[];
}
