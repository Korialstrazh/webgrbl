/**
 * The fill dose one layer gives every cell of the sheet, in the cell order of the dose grid.
 *
 * @author michael.morosov
 *
 * @since 2026-11-03
 *
 * @copyright 2026 michael.morosov
 * Licensed under the Apache License, Version 2.0. See the LICENSE file.
 */
export interface BurnFillLayerDose {
  /** Key of the layer that gave the dose. */
  layerKey: string;
  /** Dose per cell; 0 where the layer does not burn. */
  dose: Float32Array;
}
