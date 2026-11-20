/**
 * The slice that holds the resume state of the latest run that stopped early.
 *
 * @author michael.morosov
 *
 * @since 2026-11-19
 *
 * @copyright 2026 michael.morosov
 * Licensed under the Apache License, Version 2.0. See the LICENSE file.
 */
import type { JobResumeState } from './JobResumeState';

export interface JobResumeSliceState {
  /** The resume state; undefined while there is nothing to resume. */
  resume: JobResumeState | undefined;
}
