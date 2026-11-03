import type { Action } from '../states/action';
import {
  BurnModelReady,
  BurnPartLifted,
  BurnPartSelected,
  burnModelReducer,
  selectBurnPartEffectiveLiftsMm,
} from '../states/burn.model.state';
import type { BurnModelState } from '../states/burn.model.state';
import { applyBurnPartLifts } from './apply.burn.part.lifts';
import type { BurnSceneMesh } from './interfaces/BurnSceneMesh';
import type { BurnSceneObjects } from './interfaces/BurnSceneObjects';
import { newBurnSceneObjects } from './new.burn.scene.objects';
import { newBurnSceneTestModel } from './test.support/new.burn.scene.test.model';

const PARENT_ID = 1;
const CHILD_ID = 2;
const PARENT_LIFT_MM = 4;
const CHILD_LIFT_MM = 2.5;

const PARENT_LIFTED: BurnPartLifted = new BurnPartLifted({ partId: PARENT_ID, liftMm: PARENT_LIFT_MM });

const getLiftedObjects = (actions: Action<unknown>[]): BurnSceneObjects => {
  const model = newBurnSceneTestModel();
  const burnModel: BurnModelState = [new BurnModelReady({ model }), ...actions].reduce(
    (state: BurnModelState, action: Action<unknown>): BurnModelState => burnModelReducer(state, action),
    burnModelReducer(undefined, new BurnPartSelected({ partId: undefined })),
  );
  const objects: BurnSceneObjects = newBurnSceneObjects(model);

  applyBurnPartLifts(objects, selectBurnPartEffectiveLiftsMm({ burnModel }));

  return objects;
};

const getMeshHeights = ({ meshes }: BurnSceneObjects): number[] =>
  meshes.map(({ mesh }: BurnSceneMesh): number => mesh.position.z);

describe(applyBurnPartLifts.name, () => {
  it('moves the parent and the part inside it, and leaves the sheet in place', () => {
    const objects: BurnSceneObjects = getLiftedObjects([PARENT_LIFTED]);

    expect(getMeshHeights(objects)).toEqual([0, PARENT_LIFT_MM, PARENT_LIFT_MM]);
  });

  it('adds the lift of a child selected afterwards to the lift of its parent', () => {
    const objects: BurnSceneObjects = getLiftedObjects([
      new BurnPartLifted({ partId: PARENT_ID, liftMm: PARENT_LIFT_MM }),
      new BurnPartSelected({ partId: CHILD_ID }),
      new BurnPartLifted({ partId: CHILD_ID, liftMm: CHILD_LIFT_MM }),
    ]);

    expect(getMeshHeights(objects)).toEqual([0, PARENT_LIFT_MM, PARENT_LIFT_MM + CHILD_LIFT_MM]);
  });

  it('puts a part back when its lift is gone', () => {
    const objects: BurnSceneObjects = getLiftedObjects([PARENT_LIFTED]);

    applyBurnPartLifts(objects, {});

    expect(getMeshHeights(objects)).toEqual([0, 0, 0]);
  });
});
