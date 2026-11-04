/**
 * What importing a material presets file adds.
 *
 * @author michael.morosov
 *
 * @since 2026-11-04
 *
 * @copyright michael.morosov - All rights reserved.
 * You may not use, distribute or modify this code without explicit permission by michael.morosov.
 */
import type { Material } from './Material';
import type { MaterialPreset } from './MaterialPreset';

export interface ImportedMaterialPresets {
  /** Materials the file names that do not exist yet. */
  newMaterials: Material[];
  /** The presets, for the importing machine. */
  presets: MaterialPreset[];
}
