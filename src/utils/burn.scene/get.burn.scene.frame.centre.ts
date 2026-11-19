/**
 * The point the 3D camera looks at and orbits around: the middle of the ball it frames.
 *
 * @author michael.morosov
 *
 * @since 2026-11-03
 *
 * @copyright 2026 michael.morosov
 * Licensed under the Apache License, Version 2.0. See the LICENSE file.
 */
import { Vector3 } from 'three';
import type { BurnSceneCameraFraming } from './interfaces/BurnSceneCameraFraming';

const HALF = 0.5;

export const getBurnSceneFrameCentre = (
  { sheetBounds, thicknessMm, framedLiftMm }: BurnSceneCameraFraming,
): Vector3 => new Vector3(
  (sheetBounds.minX + sheetBounds.maxX) * HALF,
  (sheetBounds.minY + sheetBounds.maxY) * HALF,
  (thicknessMm + framedLiftMm) * HALF,
);
