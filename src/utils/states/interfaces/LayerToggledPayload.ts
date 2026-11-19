/**
 * Payload of switching one project layer on or off.
 *
 * @author michael.morosov
 *
 * @since 2026-11-01
 *
 * @copyright 2026 michael.morosov
 * Licensed under the Apache License, Version 2.0. See the LICENSE file.
 */
export interface LayerToggledPayload {
  /** Key of the layer: its colour, or the shading key. */
  layerKey: string;
  /** Whether the layer is sent to the laser from now on. */
  enabled: boolean;
}
