/**
 * What the action that reports a new autosave status carries.
 *
 * @author michael.morosov
 *
 * @since 2026-11-01
 *
 * @copyright michael.morosov - All rights reserved.
 * You may not use, distribute or modify this code without explicit permission by michael.morosov.
 */
import type { ProjectSaveStatus } from '../project.save.status.constants';

export interface ProjectSaveStatusPayload {
  /** Whether the open project is saved, being saved or has unsaved changes. */
  saveStatus: ProjectSaveStatus;
}
