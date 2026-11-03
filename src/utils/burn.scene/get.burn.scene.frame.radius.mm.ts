/**
 * The radius of the ball around the sheet and the highest lifted part, with a margin; it fits the view from any side.
 *
 * @author michael.morosov
 *
 * @since 2026-11-03
 *
 * @copyright michael.morosov - All rights reserved.
 * You may not use, distribute or modify this code without explicit permission by michael.morosov.
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
