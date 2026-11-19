/**
 * What a requested job start is: the whole job, a re-run of some layers, or the resume of an interrupted run.
 *
 * @author michael.morosov
 *
 * @since 2026-11-19
 *
 * @copyright 2026 michael.morosov
 * Licensed under the Apache License, Version 2.0. See the LICENSE file.
 */
export const JOB_START_REQUEST_KIND = {
  FULL: 'full',
  RECUT: 'recut',
  RESUME: 'resume',
} as const;

export type JobStartRequestKind = (typeof JOB_START_REQUEST_KIND)[keyof typeof JOB_START_REQUEST_KIND];
