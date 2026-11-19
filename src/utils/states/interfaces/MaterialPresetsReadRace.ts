/**
 * The outcome of reading the stored material presets against the read timeout.
 *
 * @author michael.morosov
 *
 * @since 2026-11-04
 *
 * @copyright 2026 michael.morosov
 * Licensed under the Apache License, Version 2.0. See the LICENSE file.
 */
import type { MaterialPreset } from '../../materials/interfaces/MaterialPreset';

export interface MaterialPresetsReadRace {
  /** The presets read from storage when the read finished first. */
  storedPresets?: MaterialPreset[];
  /** Set when the timeout ended first, so the presets in the state stay. */
  timeout?: true;
}
