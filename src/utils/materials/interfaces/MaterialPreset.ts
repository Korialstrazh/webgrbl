/**
 * Laser settings that work for one material on one machine profile, kept to use again.
 *
 * @author michael.morosov
 *
 * @since 2026-11-04
 *
 * @copyright 2026 michael.morosov
 * Licensed under the Apache License, Version 2.0. See the LICENSE file.
 */
import type { MaterialPresetOperation } from '../material.preset.constants';

export interface MaterialPreset {
  /** Random UUID, never reused. */
  id: string;
  /** The material the settings are for. */
  materialId: string;
  /** The machine profile the settings are for, because lasers differ. */
  machineProfileId: string;
  /** What the settings do to the material. */
  operation: MaterialPresetOperation;
  /** Laser power in watts, so that it can be rescaled for another laser. */
  powerWatts: number;
  /** Feed rate in mm per minute. */
  speedMmPerMin: number;
  /** How many times the job is run. */
  passes: number;
  /** Free text from the user; empty when there are none. */
  notes: string;
  /** True after a job with this preset did not cut through, until the user dismisses the note. */
  isCutThroughNoteShown?: boolean;
}
