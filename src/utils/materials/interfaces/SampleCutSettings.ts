/**
 * The cut settings the user enters for the test sample.
 *
 * @author michael.morosov
 *
 * @since 2026-11-03
 *
 * @copyright 2026 michael.morosov
 * Licensed under the Apache License, Version 2.0. See the LICENSE file.
 */
export interface SampleCutSettings {
  /** Laser power of the cut, in percent of the machine maximum. */
  powerPercent: number;
  /** Feed rate of the cut in mm per minute. */
  speedMmPerMin: number;
  /** How many times the cut is burnt. */
  passes: number;
}
