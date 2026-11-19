/**
 * The zoom at which the sheet, seen from where the camera now stands, fills most of the canvas. A lifted part may leave
 * the frame: lifts have no upper limit, so nothing could keep every lift in view.
 *
 * @author michael.morosov
 *
 * @since 2026-11-03
 *
 * @copyright 2026 michael.morosov
 * Licensed under the Apache License, Version 2.0. See the LICENSE file.
 */
import { Vector3 } from 'three';
import type { OrthographicCamera } from 'three';
import {
  BURN_SCENE_FIT_MARGIN_RATIO,
  BURN_SCENE_FIT_ROOM_MAX_SHARE,
  BURN_SCENE_FIT_ROOM_PX,
} from './burn.scene.constants';
import type { BurnSceneModelFraming } from './interfaces/BurnSceneModelFraming';

const BOTH_SIDES = 2;

export const getBurnSceneFitZoom = (
  camera: OrthographicCamera,
  { sheetBounds, thicknessMm }: BurnSceneModelFraming,
  heightPx: number,
): number => {
  let largestXMm = 0;
  let largestYMm = 0;

  camera.updateMatrixWorld();

  for (const x of [sheetBounds.minX, sheetBounds.maxX]) {
    for (const y of [sheetBounds.minY, sheetBounds.maxY]) {
      for (const z of [0, thicknessMm]) {
        const corner: Vector3 = new Vector3(x, y, z).applyMatrix4(camera.matrixWorldInverse);

        largestXMm = Math.max(largestXMm, Math.abs(corner.x));
        largestYMm = Math.max(largestYMm, Math.abs(corner.y));
      }
    }
  }

  const roomShare: number = heightPx
    ? Math.min((BOTH_SIDES * BURN_SCENE_FIT_ROOM_PX) / heightPx, BURN_SCENE_FIT_ROOM_MAX_SHARE)
    : 0;

  return Math.min(camera.right / largestXMm, (camera.top * (1 - roomShare)) / largestYMm) / BURN_SCENE_FIT_MARGIN_RATIO;
};
