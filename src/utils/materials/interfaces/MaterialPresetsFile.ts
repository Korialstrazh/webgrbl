/**
 * A material presets file, which users exchange. It names materials instead of using ids, because ids differ between
 * browsers, and each preset carries the power of its source laser.
 *
 * @author michael.morosov
 *
 * @since 2026-11-04
 *
 * @copyright michael.morosov - All rights reserved.
 * You may not use, distribute or modify this code without explicit permission by michael.morosov.
 */
import type { MaterialPreset } from './MaterialPreset';

export interface MaterialPresetsFilePreset extends Pick<
  MaterialPreset,
  'operation' | 'powerWatts' | 'speedMmPerMin' | 'passes' | 'notes'
> {
  /** Name of the material. */
  materialName: string;
  /** Thickness of the material, in mm. */
  thicknessMm: number;
  /** Rated power of the laser the preset was made for, in watts. */
  sourceMaxPowerWatts: number;
}

export interface MaterialPresetsFile {
  /** Tells this file from any other JSON file. */
  format: string;
  /** Version of the file format. */
  version: number;
  /** The exported presets. */
  presets: MaterialPresetsFilePreset[];
}
