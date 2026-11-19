/**
 * One letter-and-number word of a G-code line, such as X10.5.
 *
 * @author michael.morosov
 *
 * @since 2026-10-30
 *
 * @copyright 2026 michael.morosov
 * Licensed under the Apache License, Version 2.0. See the LICENSE file.
 */
export interface GrblSimulatorGcodeWord {
  /** Upper-case word letter. */
  letter: string;
  /** Numeric value following the letter. */
  value: number;
}
