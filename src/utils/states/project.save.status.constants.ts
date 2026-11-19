/**
 * The autosave states of the open project, as the top bar shows them.
 *
 * @author michael.morosov
 *
 * @since 2026-11-01
 *
 * @copyright 2026 michael.morosov
 * Licensed under the Apache License, Version 2.0. See the LICENSE file.
 */

export const PROJECT_SAVE_STATUS = {
  /** Every change is stored. */
  SAVED: 'saved',
  /** A save is being written. */
  SAVING: 'saving',
  /** The document has changes that are not stored yet. */
  UNSAVED: 'unsaved',
} as const;

export type ProjectSaveStatus = (typeof PROJECT_SAVE_STATUS)[keyof typeof PROJECT_SAVE_STATUS];
