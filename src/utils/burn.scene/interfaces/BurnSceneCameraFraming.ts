/**
 * What the 3D camera must show, and the shape of the view it shows it in.
 *
 * @author michael.morosov
 *
 * @since 2026-11-03
 *
 * @copyright 2026 michael.morosov
 * Licensed under the Apache License, Version 2.0. See the LICENSE file.
 */
import type { BurnModel } from '../../burn.model/interfaces/BurnModel';

export interface BurnSceneCameraFraming extends Pick<BurnModel, 'sheetBounds' | 'thicknessMm'> {
  /** Height above the sheet the first view leaves room for, in mm; parts can be lifted further. */
  framedLiftMm: number;
  /** Width of the view divided by its height. */
  aspectRatio: number;
}
