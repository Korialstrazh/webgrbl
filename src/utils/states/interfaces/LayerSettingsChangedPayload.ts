/**
 * Payload of a change to the laser settings of one project layer.
 *
 * @author michael.morosov
 *
 * @since 2026-11-01
 *
 * @copyright michael.morosov - All rights reserved.
 * You may not use, distribute or modify this code without explicit permission by michael.morosov.
 */
import type { LayerSettingsChange } from '../../layers/interfaces/LayerSettingsChange';

export interface LayerSettingsChangedPayload {
  /** Key of the layer: its colour, or the shading key. */
  layerKey: string;
  /** The settings to change; values outside the palette ranges are clamped. */
  settings: LayerSettingsChange;
}
