/**
 * The locked job actions that share one short reason.
 *
 * @author michael.morosov
 *
 * @since 2026-11-07
 *
 * @copyright michael.morosov - All rights reserved.
 * You may not use, distribute or modify this code without explicit permission by michael.morosov.
 */
import type { JobLockAction } from '../job.lock.action.constants';

export interface JobLockReasonGroup {
  /** The few words shown for these actions, as a text key. */
  shortReasonKey: string;
  /** The actions held back by it, in button order. */
  actions: JobLockAction[];
}
