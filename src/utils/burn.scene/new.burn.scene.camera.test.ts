import { Vector3 } from 'three';
import type { OrthographicCamera } from 'three';
import { BURN_PART_FRAMED_LIFT_THICKNESSES } from '../burn.model/burn.model.constants';
import type { ToolpathBounds } from '../toolpath/interfaces/ToolpathBounds';
import { newBurnSceneCamera } from './new.burn.scene.camera';
import { setBurnSceneCameraFrustum } from './set.burn.scene.camera.frustum';

const THICKNESS_MM = 3;
const SHEET_BOUNDS: ToolpathBounds = { minX: 20, minY: -10, maxX: 220, maxY: 90 };
const WIDE_ASPECT_RATIO = 2;
const TALL_ASPECT_RATIO = 0.5;
// Two nested parts, each at full lift.
const MAX_LIFT_MM = 2 * THICKNESS_MM * BURN_PART_FRAMED_LIFT_THICKNESSES;
const HIGHEST_Z_MM = THICKNESS_MM + MAX_LIFT_MM;

const getLargestSheetCornerNdc = (camera: OrthographicCamera): number => {
  let largestNdc = 0;

  for (const x of [SHEET_BOUNDS.minX, SHEET_BOUNDS.maxX]) {
    for (const y of [SHEET_BOUNDS.minY, SHEET_BOUNDS.maxY]) {
      for (const z of [0, HIGHEST_Z_MM]) {
        const projectedCorner: Vector3 = new Vector3(x, y, z).project(camera);

        largestNdc = Math.max(largestNdc, Math.abs(projectedCorner.x), Math.abs(projectedCorner.y));
      }
    }
  }

  return largestNdc;
};

describe(newBurnSceneCamera.name, () => {
  it.each([1, WIDE_ASPECT_RATIO, TALL_ASPECT_RATIO])('frames the sheet and the deepest lifted chain at aspect %d', (
    aspectRatio: number,
  ) => {
    const camera: OrthographicCamera = newBurnSceneCamera({
      sheetBounds: SHEET_BOUNDS,
      thicknessMm: THICKNESS_MM,
      maxLiftMm: MAX_LIFT_MM,
      aspectRatio,
    });

    expect(getLargestSheetCornerNdc(camera)).toBeLessThanOrEqual(1);
    expect(getLargestSheetCornerNdc(camera)).toBeGreaterThan(0);
  });

  it('frames the deepest chain on a sheet much smaller than its lift', () => {
    const smallSheetBounds: ToolpathBounds = { minX: 0, minY: 0, maxX: 5, maxY: 5 };
    const camera: OrthographicCamera = newBurnSceneCamera({
      sheetBounds: smallSheetBounds,
      thicknessMm: THICKNESS_MM,
      maxLiftMm: MAX_LIFT_MM,
      aspectRatio: 1,
    });
    const topOfLift: Vector3 = new Vector3(0, 0, HIGHEST_Z_MM).project(camera);

    expect(Math.abs(topOfLift.y)).toBeLessThanOrEqual(1);
  });

  it('keeps Z up and sits above the sheet', () => {
    const camera: OrthographicCamera = newBurnSceneCamera({
      sheetBounds: SHEET_BOUNDS,
      thicknessMm: THICKNESS_MM,
      maxLiftMm: MAX_LIFT_MM,
      aspectRatio: 1,
    });

    expect(camera.up.toArray()).toEqual([0, 0, 1]);
    expect(camera.position.z).toBeGreaterThan(HIGHEST_Z_MM);
  });

  it('still frames the sheet after the view changes shape', () => {
    const camera: OrthographicCamera = newBurnSceneCamera({
      sheetBounds: SHEET_BOUNDS,
      thicknessMm: THICKNESS_MM,
      maxLiftMm: MAX_LIFT_MM,
      aspectRatio: WIDE_ASPECT_RATIO,
    });

    setBurnSceneCameraFrustum(camera, {
      sheetBounds: SHEET_BOUNDS,
      thicknessMm: THICKNESS_MM,
      maxLiftMm: MAX_LIFT_MM,
      aspectRatio: TALL_ASPECT_RATIO,
    });

    expect(getLargestSheetCornerNdc(camera)).toBeLessThanOrEqual(1);
  });
});
