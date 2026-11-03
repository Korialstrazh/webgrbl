import { Vector3 } from 'three';
import type { OrthographicCamera } from 'three';
import type { BurnModel } from '../burn.model/interfaces/BurnModel';
import type { BurnPartLiftsMm } from '../burn.model/interfaces/BurnPartLiftsMm';
import { applyBurnPartLifts } from './apply.burn.part.lifts';
import { getBurnPartAtPointer } from './get.burn.part.at.pointer';
import type { BurnSceneObjects } from './interfaces/BurnSceneObjects';
import type { BurnScenePointer } from './interfaces/BurnScenePointer';
import { newBurnSceneCamera } from './new.burn.scene.camera';
import { newBurnSceneObjects } from './new.burn.scene.objects';
import { BURN_SCENE_TEST_THICKNESS_MM, newBurnSceneTestModel } from './test.support/new.burn.scene.test.model';

const OUTER_PART_ID = 1;
const INNER_PART_ID = 2;
const SHEET_TOP_MM = BURN_SCENE_TEST_THICKNESS_MM;
const SQUARE_MIDDLE_MM = 15.05;
const OUTER_PART_RING_MM = 11.55;
const SHEET_MARGIN_POINT_MM = 5.05;
const FAR_OUTSIDE_NDC = 0.999;
const LIFT_CLEAR_OF_THE_RAY_MM = 40;

const BOTH_PARTS_LIFTED: BurnPartLiftsMm = {
  [OUTER_PART_ID]: LIFT_CLEAR_OF_THE_RAY_MM,
  [INNER_PART_ID]: LIFT_CLEAR_OF_THE_RAY_MM,
};

const model: BurnModel = newBurnSceneTestModel();

const newCamera = (): OrthographicCamera => newBurnSceneCamera({
  sheetBounds: model.sheetBounds,
  thicknessMm: model.thicknessMm,
  aspectRatio: 1,
});

const getPointerAtPoint = (camera: OrthographicCamera, x: number, y: number, z: number): BurnScenePointer => {
  const projectedPoint: Vector3 = new Vector3(x, y, z).project(camera);

  return { xNdc: projectedPoint.x, yNdc: projectedPoint.y };
};

describe(getBurnPartAtPointer.name, () => {
  it('returns the id of the part under the pointer', () => {
    const camera: OrthographicCamera = newCamera();
    const objects: BurnSceneObjects = newBurnSceneObjects(model);

    const innerPointer: BurnScenePointer = getPointerAtPoint(camera, SQUARE_MIDDLE_MM, SQUARE_MIDDLE_MM, SHEET_TOP_MM);
    const outerPointer: BurnScenePointer = getPointerAtPoint(
      camera,
      OUTER_PART_RING_MM,
      SQUARE_MIDDLE_MM,
      SHEET_TOP_MM,
    );

    expect(getBurnPartAtPointer(objects, camera, innerPointer)).toBe(INNER_PART_ID);
    expect(getBurnPartAtPointer(objects, camera, outerPointer)).toBe(OUTER_PART_ID);
  });

  it('returns undefined over the sheet and outside it', () => {
    const camera: OrthographicCamera = newCamera();
    const objects: BurnSceneObjects = newBurnSceneObjects(model);
    const sheetPointer: BurnScenePointer = getPointerAtPoint(
      camera,
      SHEET_MARGIN_POINT_MM,
      SHEET_MARGIN_POINT_MM,
      SHEET_TOP_MM,
    );

    expect(getBurnPartAtPointer(objects, camera, sheetPointer)).toBeUndefined();
    expect(getBurnPartAtPointer(objects, camera, { xNdc: FAR_OUTSIDE_NDC, yNdc: FAR_OUTSIDE_NDC })).toBeUndefined();
  });

  it('finds a lifted part where it now is, and nothing where it used to be', () => {
    const camera: OrthographicCamera = newCamera();
    const objects: BurnSceneObjects = newBurnSceneObjects(model);

    applyBurnPartLifts(objects, BOTH_PARTS_LIFTED);

    expect(getBurnPartAtPointer(
      objects,
      camera,
      getPointerAtPoint(camera, SQUARE_MIDDLE_MM, SQUARE_MIDDLE_MM, SHEET_TOP_MM + LIFT_CLEAR_OF_THE_RAY_MM),
    )).toBe(INNER_PART_ID);
  });

  it('returns undefined for an oblique ray that passes under a lifted part and through its hole', () => {
    const camera: OrthographicCamera = newCamera();
    const objects: BurnSceneObjects = newBurnSceneObjects(model);
    const throughHolePointer: BurnScenePointer = getPointerAtPoint(camera, SQUARE_MIDDLE_MM, SQUARE_MIDDLE_MM, 0);

    // Before the lift the ray meets the top of the outer part: it comes in at a slant, so it misses the inner one.
    expect(getBurnPartAtPointer(objects, camera, throughHolePointer)).toBe(OUTER_PART_ID);

    applyBurnPartLifts(objects, BOTH_PARTS_LIFTED);

    expect(getBurnPartAtPointer(objects, camera, throughHolePointer)).toBeUndefined();
  });
});
