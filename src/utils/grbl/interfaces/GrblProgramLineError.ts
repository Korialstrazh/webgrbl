/**
 * A program line the controller answered with an error.
 *
 * @author michael.morosov
 *
 * @since 2026-10-30
 *
 * @copyright michael.morosov - All rights reserved.
 * You may not use, distribute or modify this code without explicit permission by michael.morosov.
 */

export interface GrblProgramLineError {
  /** 1-based index of the line in the original program lines; blank and comment lines count too. */
  lineNumber: number;
  /** The line as sent, after preparation. */
  lineText: string;
  /** GRBL error code. */
  errorCode: number;
}
