/**
 * What importing a material presets file adds.
 *
 * @author michael.morosov
 *
 * @since 2026-11-04
 *
 * @copyright 2026 michael.morosov
 * Licensed under the Apache License, Version 2.0. See the LICENSE file.
 */
import type { Material } from './Material';
import type { MaterialPreset } from './MaterialPreset';

export interface ImportedMaterialPresets {
  /** Materials the file names that do not exist yet. */
  newMaterials: Material[];
  /** The presets, for the importing machine. */
  presets: MaterialPreset[];
}
