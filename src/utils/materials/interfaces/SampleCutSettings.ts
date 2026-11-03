/**
 * The cut settings the user enters for the test sample.
 *
 * @author michael.morosov
 *
 * @since 2026-11-03
 *
 * @copyright michael.morosov - All rights reserved.
 * You may not use, distribute or modify this code without explicit permission by michael.morosov.
 */
export interface SampleCutSettings {
  /** Laser power of the cut, in percent of the machine maximum. */
  powerPercent: number;
  /** Feed rate of the cut in mm per minute. */
  speedMmPerMin: number;
  /** How many times the cut is burnt. */
  passes: number;
}
