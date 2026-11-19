/**
 * The design of a project: every object on the bed and the laser layers of their colours.
 *
 * @author michael.morosov
 *
 * @since 2026-11-01
 *
 * @copyright 2026 michael.morosov
 * Licensed under the Apache License, Version 2.0. See the LICENSE file.
 */
import type { ProjectLayer } from '../../layers/interfaces/ProjectLayer';
import type { ProjectObject } from './ProjectObject';

export interface ProjectDocument {
  /** The objects in drawing order. */
  objects: ProjectObject[];
  /**
   * Every layer the project has had, including layers whose colour no object draws any more: those are hidden but
   * kept, so an undo brings them back with their settings.
   */
  layers: ProjectLayer[];
  /** The material the project is burned on; missing until the user chooses one. */
  materialId?: string;
}
