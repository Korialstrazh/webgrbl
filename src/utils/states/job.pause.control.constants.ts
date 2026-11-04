/**
 * What the job card can offer for pausing a running job.
 *
 * @author michael.morosov
 *
 * @since 2026-11-04
 *
 * @copyright michael.morosov - All rights reserved.
 * You may not use, distribute or modify this code without explicit permission by michael.morosov.
 */
export const JOB_PAUSE_CONTROL = {
  /** No job runs, so nothing is offered. */
  HIDDEN: 'hidden',
  /** The job can be paused. */
  PAUSE: 'pause',
  /** Pausing is refused: without laser mode the beam can stay on while the head stands still. */
  PAUSE_BLOCKED: 'pause-blocked',
  /** The job is paused and can go on. */
  RESUME: 'resume',
  /** The machine is still slowing down or a door is open, so GRBL would ignore a resume. */
  RESUME_WAITING: 'resume-waiting',
} as const;

export type JobPauseControl = (typeof JOB_PAUSE_CONTROL)[keyof typeof JOB_PAUSE_CONTROL];

/** The controls offered while the machine holds the job. */
export const JOB_PAUSED_CONTROLS: readonly JobPauseControl[] = [
  JOB_PAUSE_CONTROL.RESUME,
  JOB_PAUSE_CONTROL.RESUME_WAITING,
];
