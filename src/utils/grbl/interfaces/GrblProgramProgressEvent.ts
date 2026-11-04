/**
 * How far a streamed program has been answered.
 *
 * @author michael.morosov
 *
 * @since 2026-11-04
 *
 * @copyright michael.morosov - All rights reserved.
 * You may not use, distribute or modify this code without explicit permission by michael.morosov.
 */
import type { GRBL_CONTROLLER_EVENT_KIND } from '../grbl.constants';

export interface GrblProgramProgressEvent {
  kind: typeof GRBL_CONTROLLER_EVENT_KIND.PROGRAM_PROGRESS;
  /** Sent lines answered with ok or error so far. */
  answeredLineCount: number;
  /** Lines of the program that are sent. */
  totalLineCount: number;
}
