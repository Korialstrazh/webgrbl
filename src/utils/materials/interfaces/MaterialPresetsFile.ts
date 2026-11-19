/**
 * A material presets file, which users exchange. It names materials instead of using ids, because ids differ between
 * browsers, and each preset carries the power of its source laser.
 *
 * @author michael.morosov
 *
 * @since 2026-11-04
 *
 * @copyright 2026 michael.morosov
 * Licensed under the Apache License, Version 2.0. See the LICENSE file.
 */
import type { MaterialPresetsFilePreset } from './MaterialPresetsFilePreset';

export interface MaterialPresetsFile {
  /** Tells this file from any other JSON file. */
  format: string;
  /** Version of the file format. */
  version: number;
  /** The exported presets. */
  presets: MaterialPresetsFilePreset[];
}
