/**
 * What the 3D camera must show, and the shape of the view it shows it in.
 *
 * @author michael.morosov
 *
 * @since 2026-11-03
 *
 * @copyright michael.morosov - All rights reserved.
 * You may not use, distribute or modify this code without explicit permission by michael.morosov.
 */
import type { BurnModel } from '../../burn.model/interfaces/BurnModel';

export interface BurnSceneCameraFraming extends Pick<BurnModel, 'sheetBounds' | 'thicknessMm'> {
  /** Height above the sheet the first view leaves room for, in mm; parts can be lifted further. */
  framedLiftMm: number;
  /** Width of the view divided by its height. */
  aspectRatio: number;
}
