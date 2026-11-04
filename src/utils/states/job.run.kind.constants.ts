/**
 * What a run on the laser is: a real job or the low-power frame trace.
 *
 * @author michael.morosov
 *
 * @since 2026-11-04
 *
 * @copyright michael.morosov - All rights reserved.
 * You may not use, distribute or modify this code without explicit permission by michael.morosov.
 */
export const JOB_RUN_KIND = {
  JOB: 'job',
  FRAME: 'frame',
} as const;

export type JobRunKind = (typeof JOB_RUN_KIND)[keyof typeof JOB_RUN_KIND];
