/**
 * One job action with the reason key from its own guard; undefined while it can run.
 *
 * @author michael.morosov
 *
 * @since 2026-11-07
 *
 * @copyright michael.morosov - All rights reserved.
 * You may not use, distribute or modify this code without explicit permission by michael.morosov.
 */
import type { JobLockAction } from '../job.lock.action.constants';

export interface JobLockActionReason {
  /** The action the reason belongs to. */
  action: JobLockAction;
  /** Why the action is locked, as a text key. */
  blockedReasonKey: string | undefined;
}
