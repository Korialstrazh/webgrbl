/**
 * The fill dose one layer gives every cell of the sheet, in the cell order of the dose grid.
 *
 * @author michael.morosov
 *
 * @since 2026-11-03
 *
 * @copyright michael.morosov - All rights reserved.
 * You may not use, distribute or modify this code without explicit permission by michael.morosov.
 */
export interface BurnFillLayerDose {
  /** Key of the layer that gave the dose. */
  layerKey: string;
  /** Dose per cell; 0 where the layer does not burn. */
  dose: Float32Array;
}
