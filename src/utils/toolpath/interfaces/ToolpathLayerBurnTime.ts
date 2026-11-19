/**
 * How long the laser burns on one layer of a toolpath, travel left out.
 *
 * @author michael.morosov
 *
 * @since 2026-11-02
 *
 * @copyright 2026 michael.morosov
 * Licensed under the Apache License, Version 2.0. See the LICENSE file.
 */
export interface ToolpathLayerBurnTime {
  /** Key of the layer. */
  layerKey: string;
  /** Planned time of the layer's burn moves in seconds, overscan included. */
  burnTimeS: number;
}
