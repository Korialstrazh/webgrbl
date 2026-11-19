/**
 * One job action with the reason key from its own guard; undefined while it can run.
 *
 * @author michael.morosov
 *
 * @since 2026-11-07
 *
 * @copyright 2026 michael.morosov
 * Licensed under the Apache License, Version 2.0. See the LICENSE file.
 */
import type { JobLockAction } from '../job.lock.action.constants';

export interface JobLockActionReason {
  /** The action the reason belongs to. */
  action: JobLockAction;
  /** Why the action is locked, as a text key. */
  blockedReasonKey: string | undefined;
}
