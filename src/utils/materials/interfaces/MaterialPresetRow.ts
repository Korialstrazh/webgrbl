/**
 * One row of the material library table: a preset with what it shows of its material.
 *
 * @author michael.morosov
 *
 * @since 2026-11-04
 *
 * @copyright michael.morosov - All rights reserved.
 * You may not use, distribute or modify this code without explicit permission by michael.morosov.
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
