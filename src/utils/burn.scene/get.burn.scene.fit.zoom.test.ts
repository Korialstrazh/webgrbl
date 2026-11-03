import { Vector3 } from 'three';
import type { OrthographicCamera } from 'three';
import type { ToolpathBounds } from '../toolpath/interfaces/ToolpathBounds';
import { getBurnSceneFitZoom } from './get.burn.scene.fit.zoom';
import { newBurnSceneCamera } from './new.burn.scene.camera';

const SHEET_BOUNDS: ToolpathBounds = { minX: 0, minY: 0, maxX: 200, maxY: 200 };
const FRAMING = { sheetBounds: SHEET_BOUNDS, thicknessMm: 3, framedLiftMm: 12 };
const HEIGHT_PX = 500;

const getLargestSheetNdc = (camera: OrthographicCamera): number => {
  let largestNdc = 0;

  for (const [x, y] of [[0, 0], [200, 0], [0, 200], [200, 200]]) {
    const corner: Vector3 = new Vector3(x, y, 0).project(camera);

    largestNdc = Math.max(largestNdc, Math.abs(corner.x), Math.abs(corner.y));
  }

  return largestNdc;
};

describe(getBurnSceneFitZoom.name, () => {
  it('fills most of the canvas with the sheet and leaves it all in view', () => {
    const camera: OrthographicCamera = newBurnSceneCamera({ ...FRAMING, aspectRatio: 1 });

    camera.zoom = getBurnSceneFitZoom(camera, FRAMING, HEIGHT_PX);
    camera.updateProjectionMatrix();

    expect(camera.zoom).toBeGreaterThan(1);
    expect(getLargestSheetNdc(camera)).toBeLessThan(1);
    expect(getLargestSheetNdc(camera)).toBeGreaterThan(0.75);
  });
});
