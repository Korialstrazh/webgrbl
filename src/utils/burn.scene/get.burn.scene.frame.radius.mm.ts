/**
 * The radius of the ball around the sheet and the highest lifted part, with a margin; it fits the view from any side.
 *
 * @author michael.morosov
 *
 * @since 2026-11-03
 *
 * @copyright 2026 michael.morosov
 * Licensed under the Apache License, Version 2.0. See the LICENSE file.
 */
import { BURN_SCENE_FRAME_MARGIN_RATIO } from './burn.scene.constants';
import type { BurnSceneCameraFraming } from './interfaces/BurnSceneCameraFraming';

const HALF = 0.5;

export const getBurnSceneFrameRadiusMm = (
  { sheetBounds, thicknessMm, framedLiftMm }: BurnSceneCameraFraming,
): number => {
  const { minX, minY, maxX, maxY } = sheetBounds;
  const fullHeightMm: number = thicknessMm + framedLiftMm;

  return Math.hypot(maxX - minX, maxY - minY, fullHeightMm) * HALF * BURN_SCENE_FRAME_MARGIN_RATIO;
};
