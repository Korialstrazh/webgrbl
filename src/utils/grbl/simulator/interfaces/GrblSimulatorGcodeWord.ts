/**
 * One letter-and-number word of a G-code line, such as X10.5.
 *
 * @author michael.morosov
 *
 * @since 2026-10-30
 *
 * @copyright michael.morosov - All rights reserved.
 * You may not use, distribute or modify this code without explicit permission by michael.morosov.
 */
export interface GrblSimulatorGcodeWord {
  /** Upper-case word letter. */
  letter: string;
  /** Numeric value following the letter. */
  value: number;
}
