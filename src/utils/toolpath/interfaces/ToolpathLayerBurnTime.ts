/**
 * How long the laser burns on one layer of a toolpath, travel left out.
 *
 * @author michael.morosov
 *
 * @since 2026-11-02
 *
 * @copyright michael.morosov - All rights reserved.
 * You may not use, distribute or modify this code without explicit permission by michael.morosov.
 */
export interface ToolpathLayerBurnTime {
  /** Key of the layer. */
  layerKey: string;
  /** Planned time of the layer's burn moves in seconds, overscan included. */
  burnTimeS: number;
}
