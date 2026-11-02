/**
 * Payload of switching one project layer on or off.
 *
 * @author michael.morosov
 *
 * @since 2026-11-01
 *
 * @copyright michael.morosov - All rights reserved.
 * You may not use, distribute or modify this code without explicit permission by michael.morosov.
 */
export interface LayerToggledPayload {
  /** Key of the layer: its colour, or the shading key. */
  layerKey: string;
  /** Whether the layer is sent to the laser from now on. */
  enabled: boolean;
}
