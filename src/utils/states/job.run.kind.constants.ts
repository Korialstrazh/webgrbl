/**
 * What a run on the laser is: a real job or the low-power frame trace.
 *
 * @author michael.morosov
 *
 * @since 2026-11-04
 *
 * @copyright 2026 michael.morosov
 * Licensed under the Apache License, Version 2.0. See the LICENSE file.
 */
export const JOB_RUN_KIND = {
  JOB: 'job',
  FRAME: 'frame',
} as const;

export type JobRunKind = (typeof JOB_RUN_KIND)[keyof typeof JOB_RUN_KIND];
