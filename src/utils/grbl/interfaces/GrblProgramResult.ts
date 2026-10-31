/**
 * How a streamed program ended.
 *
 * @author michael.morosov
 *
 * @since 2026-10-30
 *
 * @copyright michael.morosov - All rights reserved.
 * You may not use, distribute or modify this code without explicit permission by michael.morosov.
 */
import type { GrblProgramLineError } from './GrblProgramLineError';

export interface GrblProgramResult {
  /** True when every line was answered; false when a stop, reset, alarm or closed connection ended the program. */
  isCompleted: boolean;
  /** Lines answered with an error, in answer order. */
  lineErrors: GrblProgramLineError[];
}
