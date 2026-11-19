/**
 * What the shown name of a project is made from; the creation time is unknown until the project is listed,
 * and objects saved before import times were kept have none.
 *
 * @author michael.morosov
 *
 * @since 2026-11-10
 *
 * @copyright 2026 michael.morosov
 * Licensed under the Apache License, Version 2.0. See the LICENSE file.
 */
import type { ProjectSummary } from './ProjectSummary';

export type ProjectDisplayNameSource = Pick<ProjectSummary, 'name' | 'firstObjectName'> &
  Partial<Pick<ProjectSummary, 'createdAt' | 'firstObjectImportedAt'>>;
