/**
 * The autosave states of the open project, as the top bar shows them.
 *
 * @author michael.morosov
 *
 * @since 2026-11-01
 *
 * @copyright michael.morosov - All rights reserved.
 * You may not use, distribute or modify this code without explicit permission by michael.morosov.
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
