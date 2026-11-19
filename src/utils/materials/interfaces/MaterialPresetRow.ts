/**
 * One row of the material library table: a preset with what it shows of its material.
 *
 * @author michael.morosov
 *
 * @since 2026-11-04
 *
 * @copyright 2026 michael.morosov
 * Licensed under the Apache License, Version 2.0. See the LICENSE file.
 */
import type { MaterialPreset } from './MaterialPreset';

export interface MaterialPresetRow {
  /** The preset of the row. */
  preset: MaterialPreset;
  /** Name of the material of the preset. */
  materialName: string;
  /** Thickness of the material of the preset, in mm. */
  thicknessMm: number;
}
