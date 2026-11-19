/**
 * A program line the controller answered with an error.
 *
 * @author michael.morosov
 *
 * @since 2026-10-30
 *
 * @copyright 2026 michael.morosov
 * Licensed under the Apache License, Version 2.0. See the LICENSE file.
 */

export interface GrblProgramLineError {
  /** 1-based index of the line in the original program lines; blank and comment lines count too. */
  lineNumber: number;
  /** The line as sent, after preparation. */
  lineText: string;
  /** GRBL error code. */
  errorCode: number;
}
