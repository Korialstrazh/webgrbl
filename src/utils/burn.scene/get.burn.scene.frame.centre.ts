/**
 * The point the 3D camera looks at and orbits around: the middle of the ball it frames.
 *
 * @author michael.morosov
 *
 * @since 2026-11-03
 *
 * @copyright michael.morosov - All rights reserved.
 * You may not use, distribute or modify this code without explicit permission by michael.morosov.
 */
import { Vector3 } from 'three';
import { BURN_PART_LIFT_MAX_THICKNESSES } from '../burn.model/burn.model.constants';
import type { BurnSceneCameraFraming } from './interfaces/BurnSceneCameraFraming';

const HALF = 0.5;

export const getBurnSceneFrameCentre = ({ sheetBounds, thicknessMm }: BurnSceneCameraFraming): Vector3 => new Vector3(
  (sheetBounds.minX + sheetBounds.maxX) * HALF,
  (sheetBounds.minY + sheetBounds.maxY) * HALF,
  thicknessMm * (1 + BURN_PART_LIFT_MAX_THICKNESSES) * HALF,
);
