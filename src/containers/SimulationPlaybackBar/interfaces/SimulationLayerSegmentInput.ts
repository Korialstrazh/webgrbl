/**
 * What the layer bar segments are made from: the burn time of each toolpath layer, and the project layers and
 * palette entries that name them.
 *
 * @author michael.morosov
 *
 * @since 2026-11-02
 *
 * @copyright michael.morosov - All rights reserved.
 * You may not use, distribute or modify this code without explicit permission by michael.morosov.
 */
import type { ProjectLayer } from '../../../utils/layers/interfaces/ProjectLayer';
import type { PaletteEntry } from '../../../utils/palette/interfaces/PaletteEntry';
import type { ToolpathLayerBurnTime } from '../../../utils/toolpath/interfaces/ToolpathLayerBurnTime';

export interface SimulationLayerSegmentInput {
  /** Burn time of each layer of the toolpath, in burn order. */
  layerBurnTimes: ToolpathLayerBurnTime[];
  /** The layers of the document. */
  projectLayers: ProjectLayer[];
  /** The palette entries, for the layer names. */
  paletteEntries: PaletteEntry[];
}
