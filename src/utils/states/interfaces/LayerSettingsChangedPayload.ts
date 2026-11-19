/**
 * Payload of a change to the laser settings of one project layer.
 *
 * @author michael.morosov
 *
 * @since 2026-11-01
 *
 * @copyright 2026 michael.morosov
 * Licensed under the Apache License, Version 2.0. See the LICENSE file.
 */
import type { LayerSettingsChange } from '../../layers/interfaces/LayerSettingsChange';

export interface LayerSettingsChangedPayload {
  /** Key of the layer: its colour, or the shading key. */
  layerKey: string;
  /** The settings to change; values outside the palette ranges are clamped. */
  settings: LayerSettingsChange;
  /** The material preset the change comes from; a change without it that alters power, speed or passes clears it. */
  presetId?: string;
}
