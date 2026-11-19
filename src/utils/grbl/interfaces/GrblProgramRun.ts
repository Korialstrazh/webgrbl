/**
 * State of the program lines being streamed, kept by the program streamer.
 *
 * @author michael.morosov
 *
 * @since 2026-10-30
 *
 * @copyright 2026 michael.morosov
 * Licensed under the Apache License, Version 2.0. See the LICENSE file.
 */
import type { GrblProgramLineError } from './GrblProgramLineError';
import type { GrblProgramResult } from './GrblProgramResult';

export interface GrblProgramRun {
  /** Lines of the program that are sent, without blank and comment lines. */
  sentLineCount: number;
  /** Sent lines answered with ok or error so far. */
  answeredLineCount: number;
  /** Lines answered with an error so far. */
  lineErrors: GrblProgramLineError[];
  /** Whether the first line error stops the machine. */
  isStopOnErrorEnabled: boolean;
  /** Whether the lines run in check mode, where errors are results and raise no grbl-error event. */
  isCheckRun: boolean;
  /** True once a line error started the stop; later answers are ignored. */
  isStoppingOnError: boolean;
  /** Ends the run with its result. */
  resolveRun: (result: GrblProgramResult) => void;
}
