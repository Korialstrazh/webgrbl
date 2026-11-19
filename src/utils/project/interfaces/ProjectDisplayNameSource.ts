/**
 * What the shown name of a project is made from; the creation time is unknown until the project is listed,
 * and objects saved before import times were kept have none.
 *
 * @author michael.morosov
 *
 * @since 2026-11-10
 *
 * @copyright michael.morosov - All rights reserved.
 * You may not use, distribute or modify this code without explicit permission by michael.morosov.
 */
import type { ProjectSummary } from './ProjectSummary';

export type ProjectDisplayNameSource = Pick<ProjectSummary, 'name' | 'firstObjectName'> &
  Partial<Pick<ProjectSummary, 'createdAt' | 'firstObjectImportedAt'>>;
