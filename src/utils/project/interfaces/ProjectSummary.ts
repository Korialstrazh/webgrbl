/**
 * One row of the project list: what the Open dialog shows without loading any SVG text.
 *
 * @author michael.morosov
 *
 * @since 2026-11-01
 *
 * @copyright michael.morosov - All rights reserved.
 * You may not use, distribute or modify this code without explicit permission by michael.morosov.
 */
import type { ProjectObjectTransform } from './ProjectObjectTransform';
import type { StoredProject } from './StoredProject';

export interface ProjectSummary extends Pick<StoredProject, 'id' | 'name' | 'createdAt' | 'updatedAt'> {
  /** How many objects the project holds. */
  objectCount: number;
  /** Where each object sits on the bed, in drawing order, for the row's thumbnail. */
  objectBoxes: ProjectObjectTransform[];
  /** The name of the first object, which stands in for a project that still has the default name. */
  firstObjectName?: string;
}
