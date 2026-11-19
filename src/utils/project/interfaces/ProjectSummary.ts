/**
 * One row of the project list: what the Open dialog shows without loading any SVG text.
 *
 * @author michael.morosov
 *
 * @since 2026-11-01
 *
 * @copyright 2026 michael.morosov
 * Licensed under the Apache License, Version 2.0. See the LICENSE file.
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
  /** When the first object was imported; the day in a default-named project's shown name comes from it. */
  firstObjectImportedAt?: string;
}
