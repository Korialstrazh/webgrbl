/**
 * How a program is streamed.
 *
 * @author michael.morosov
 *
 * @since 2026-10-30
 *
 * @copyright 2026 michael.morosov
 * Licensed under the Apache License, Version 2.0. See the LICENSE file.
 */

export interface GrblProgramStreamOptions {
  /** Whether the first line error stops the machine and ends the program; otherwise errors are collected. */
  isStopOnErrorEnabled: boolean;
}
