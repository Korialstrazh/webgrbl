/**
 * One laser test of a material on one machine profile: the settings used and what came out.
 *
 * @author michael.morosov
 *
 * @since 2026-11-03
 *
 * @copyright 2026 michael.morosov
 * Licensed under the Apache License, Version 2.0. See the LICENSE file.
 */
import type { MaterialTestOutcome } from '../material.constants';

export interface MaterialTestResult {
  /** The machine profile the test ran on. */
  machineProfileId: string;
  /** Laser power of the test, in percent. */
  powerPercent: number;
  /** Feed rate of the test, in mm per minute. */
  speedMmPerMin: number;
  /** How many times the test pattern was run. */
  passes: number;
  /** Thickness of the tested sheet, in mm. */
  thicknessMm: number;
  /** Whether the test cut through the sheet. */
  outcome: MaterialTestOutcome;
  /** Depth of the burn in mm, when it was measured. */
  depthMm: number | undefined;
  /** When the test was saved, as a UTC ISO 8601 string. */
  testedAtIso: string;
}
