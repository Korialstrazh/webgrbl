/**
 * How far a streamed program has been answered.
 *
 * @author michael.morosov
 *
 * @since 2026-11-04
 *
 * @copyright 2026 michael.morosov
 * Licensed under the Apache License, Version 2.0. See the LICENSE file.
 */
import type { GRBL_CONTROLLER_EVENT_KIND } from '../grbl.constants';

export interface GrblProgramProgressEvent {
  kind: typeof GRBL_CONTROLLER_EVENT_KIND.PROGRAM_PROGRESS;
  /** Sent lines answered with ok or error so far. */
  answeredLineCount: number;
  /** Lines of the program that are sent. */
  totalLineCount: number;
}
