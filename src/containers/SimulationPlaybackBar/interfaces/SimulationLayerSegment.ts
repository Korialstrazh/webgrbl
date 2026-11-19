/**
 * One segment of the layer bar above the simulation slider: a layer, sized by its share of the burn time.
 *
 * @author michael.morosov
 *
 * @since 2026-11-02
 *
 * @copyright 2026 michael.morosov
 * Licensed under the Apache License, Version 2.0. See the LICENSE file.
 */
export interface SimulationLayerSegment {
  /** Key of the layer. */
  layerKey: string;
  /** Name of the layer, shown in the tooltip. */
  layerName: string;
  /** Whether this is the shading layer, drawn in mid-grey since its black would vanish on the dark bed. */
  isShading: boolean;
  /** Width of the segment in percent of the bar: the layer's share of the burn time of all layers. */
  widthPercent: number;
}
