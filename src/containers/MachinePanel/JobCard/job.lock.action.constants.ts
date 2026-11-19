/**
 * The job actions that can be locked, in the order their buttons stand: Start, Frame, then Export.
 *
 * @author michael.morosov
 *
 * @since 2026-11-07
 *
 * @copyright michael.morosov - All rights reserved.
 * You may not use, distribute or modify this code without explicit permission by michael.morosov.
 */
export const JOB_LOCK_ACTION = {
  START: 'start',
  FRAME: 'frame',
  EXPORT: 'export',
} as const;

export type JobLockAction = typeof JOB_LOCK_ACTION[keyof typeof JOB_LOCK_ACTION];
