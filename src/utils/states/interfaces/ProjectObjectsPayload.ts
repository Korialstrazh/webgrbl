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
