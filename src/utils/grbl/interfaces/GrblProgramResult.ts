/**
 * How a streamed program ended.
 *
 * @author michael.morosov
 *
 * @since 2026-10-30
 *
 * @copyright 2026 michael.morosov
 * Licensed under the Apache License, Version 2.0. See the LICENSE file.
 */
import type { GrblProgramLineError } from './GrblProgramLineError';

export interface GrblProgramResult {
  /** True when every line was answered; false when a stop, reset, alarm or closed connection ended the program. */
  isCompleted: boolean;
  /** Lines answered with an error, in answer order. */
  lineErrors: GrblProgramLineError[];
}
