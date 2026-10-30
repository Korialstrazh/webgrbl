/**
 * Controller event: a program line got an error and the program was stopped.
 *
 * @author michael.morosov
 *
 * @since 2026-10-30
 *
 * @copyright michael.morosov - All rights reserved.
 * You may not use, distribute or modify this code without explicit permission by michael.morosov.
 */
import type { GRBL_CONTROLLER_EVENT_KIND } from '../grbl.constants';

export interface GrblProgramStoppedOnErrorEvent {
  kind: typeof GRBL_CONTROLLER_EVENT_KIND.PROGRAM_STOPPED_ON_ERROR;
  /** 1-based number of the failed line in the loaded program. */
  lineNumber: number;
  /** The failed line as sent. */
  lineText: string;
  /** GRBL error code. */
  errorCode: number;
}
