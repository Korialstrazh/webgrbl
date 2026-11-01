/**
 * What the action that carries the stored project list carries.
 *
 * @author michael.morosov
 *
 * @since 2026-11-01
 *
 * @copyright michael.morosov - All rights reserved.
 * You may not use, distribute or modify this code without explicit permission by michael.morosov.
 */
import type { ProjectSummary } from '../../project/interfaces/ProjectSummary';

export interface ProjectSummariesPayload {
  /** Every stored project, most recently changed first. */
  summaries: ProjectSummary[];
}
