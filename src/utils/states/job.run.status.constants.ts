/**
 * The states of a job run on the laser.
 *
 * @author michael.morosov
 *
 * @since 2026-11-03
 *
 * @copyright michael.morosov - All rights reserved.
 * You may not use, distribute or modify this code without explicit permission by michael.morosov.
 */
export const JOB_RUN_STATUS = {
  /** No job has run since the app started. */
  IDLE: 'idle',
  /** The program lines are being sent. */
  SENDING: 'sending',
  /** All lines were answered and the laser works through what it has buffered. */
  FINISHING: 'finishing',
  /** The laser finished the whole job. */
  COMPLETED: 'completed',
  /** A stop, alarm, reset, line error or lost connection ended the job early. */
  INTERRUPTED: 'interrupted',
} as const;

export type JobRunStatus = (typeof JOB_RUN_STATUS)[keyof typeof JOB_RUN_STATUS];
