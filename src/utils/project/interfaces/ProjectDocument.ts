/**
 * The design of a project: every object on the bed.
 *
 * @author michael.morosov
 *
 * @since 2026-11-01
 *
 * @copyright michael.morosov - All rights reserved.
 * You may not use, distribute or modify this code without explicit permission by michael.morosov.
 */
import type { ProjectObject } from './ProjectObject';

export interface ProjectDocument {
  /** The objects in drawing order. */
  objects: ProjectObject[];
}
