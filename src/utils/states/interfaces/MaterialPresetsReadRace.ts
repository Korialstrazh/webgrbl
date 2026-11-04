/**
 * The outcome of reading the stored material presets against the read timeout.
 *
 * @author michael.morosov
 *
 * @since 2026-11-04
 *
 * @copyright michael.morosov - All rights reserved.
 * You may not use, distribute or modify this code without explicit permission by michael.morosov.
 */
import type { MaterialPreset } from '../../materials/interfaces/MaterialPreset';

export interface MaterialPresetsReadRace {
  /** The presets read from storage when the read finished first. */
  storedPresets?: MaterialPreset[];
  /** Set when the timeout ended first, so the presets in the state stay. */
  timeout?: true;
}
