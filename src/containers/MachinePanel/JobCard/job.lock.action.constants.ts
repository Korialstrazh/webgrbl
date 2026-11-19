/**
 * The job actions that can be locked, in the order their buttons stand: Start, Frame, then Export.
 *
 * @author michael.morosov
 *
 * @since 2026-11-07
 *
 * @copyright 2026 michael.morosov
 * Licensed under the Apache License, Version 2.0. See the LICENSE file.
 */
export const JOB_LOCK_ACTION = {
  START: 'start',
  FRAME: 'frame',
  EXPORT: 'export',
} as const;

export type JobLockAction = typeof JOB_LOCK_ACTION[keyof typeof JOB_LOCK_ACTION];
