/**
 * State of the safety checklist dialog: the start it asks the user to confirm.
 *
 * @author michael.morosov
 *
 * @since 2026-11-19
 *
 * @copyright 2026 michael.morosov
 * Licensed under the Apache License, Version 2.0. See the LICENSE file.
 */
import type { JobStartRequest } from './JobStartRequest';

export interface JobSafetyChecklistState {
  /** The start waiting for the user's confirmation; undefined while the dialog is closed. */
  request: JobStartRequest | undefined;
}
