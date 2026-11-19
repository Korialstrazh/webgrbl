/**
 * What the action that reports a new autosave status carries.
 *
 * @author michael.morosov
 *
 * @since 2026-11-01
 *
 * @copyright 2026 michael.morosov
 * Licensed under the Apache License, Version 2.0. See the LICENSE file.
 */
import type { ProjectSaveStatus } from '../project.save.status.constants';

export interface ProjectSaveStatusPayload {
  /** Whether the open project is saved, being saved or has unsaved changes. */
  saveStatus: ProjectSaveStatus;
}
