/**
 * What the MaterialPresetsLoaded action carries.
 *
 * @author michael.morosov
 *
 * @since 2026-11-04
 *
 * @copyright 2026 michael.morosov
 * Licensed under the Apache License, Version 2.0. See the LICENSE file.
 */
import type { MaterialPreset } from '../../materials/interfaces/MaterialPreset';

export interface MaterialPresetsPayload {
  /** Every known preset. */
  presets: MaterialPreset[];
}
