import { describe, expect, it } from 'vitest';
import { BED_VIEW_MODE } from '../bed/bed.view.constants';
import { BURN_PART_STATUS } from '../burn.model/burn.model.constants';
import type { BurnModel } from '../burn.model/interfaces/BurnModel';
import type { BurnPart } from '../burn.model/interfaces/BurnPart';
import { BedViewModeChanged } from './bed.view.state';
import { BURN_MODEL_STATUS } from './burn.model.status.constants';
import {
  BurnModelFailed,
  BurnModelReady,
  BurnModelRequested,
  BurnPartLifted,
  BurnPartSelected,
  burnModelReducer,
  selectBurnModel,
  selectBurnModelStatus,
  selectBurnPartEffectiveLiftMm,
  selectBurnPartEffectiveLiftsMm,
  selectBurnPartLiftMm,
  selectCurrentBurnModel,
  selectSelectedBurnPartId,
} from './burn.model.state';
import type { BurnModelState } from './burn.model.state';
import { MaterialSaved, MaterialTestResultSaved } from './material.state';
import { newMaterial } from '../materials/new.material';
import { newTestResultFixture } from '../materials/new.test.result.fixture';
import { LayerToggled, ProjectMaterialSelected, ProjectUndoRequested } from './project.document.state';
import { ToolpathMachineAreaChanged, ToolpathRequested } from './toolpath.state';
import type { Action } from './action';

const THICKNESS_MM = 3;
const PARENT_ID = 1;
const CHILD_ID = 2;
const GRANDCHILD_ID = 3;
const UNKNOWN_PART_ID = 9;
const PARENT_LIFT_MM = 2;
const CHILD_LIFT_MM = 1.5;
const LAYER_KEY = '#ff0000';
const BUILT_MATERIAL_ID = 'material-1';
const OTHER_MATERIAL_ID = 'material-2';

const newBuildRequest = (): BurnModelRequested => new BurnModelRequested({ materialId: BUILT_MATERIAL_ID });

const newPart = (id: number, parentId: number | undefined): BurnPart => ({
  id,
  parentId,
  status: BURN_PART_STATUS.FREE,
  boundsMm: { minX: 0, minY: 0, maxX: 1, maxY: 1 },
  weakestLayerKey: undefined,
  weakestDepthMm: undefined,
});

const newModel = (parts: BurnPart[] = [newPart(PARENT_ID, undefined), newPart(CHILD_ID, PARENT_ID)]): BurnModel => ({
  parts,
  cutCheck: { freePartCount: 0, borderlinePartCount: 0, attachedPartCount: 0, warnings: [], isGuess: true },
  meshes: [],
  sheetBounds: { minX: 0, minY: 0, maxX: 1, maxY: 1 },
  thicknessMm: THICKNESS_MM,
});

const reduceActions = (actions: Action<unknown>[]): BurnModelState => actions.reduce(
  (state: BurnModelState, action: Action<unknown>): BurnModelState => burnModelReducer(state, action),
  burnModelReducer(undefined, new BurnPartSelected({ partId: undefined })),
);

const newRootState = (burnModel: BurnModelState): { burnModel: BurnModelState } => ({ burnModel });

const READY_ACTIONS: Action<unknown>[] = [newBuildRequest(), new BurnModelReady({ model: newModel() })];

describe(burnModelReducer.name, () => {
  it('goes from idle to building to ready, keeping the model', () => {
    const model: BurnModel = newModel();
    const root = newRootState(reduceActions([newBuildRequest(), new BurnModelReady({ model })]));

    expect(selectBurnModelStatus(newRootState(reduceActions([])))).toBe(BURN_MODEL_STATUS.IDLE);
    expect(selectBurnModelStatus(newRootState(reduceActions([newBuildRequest()]))))
      .toBe(BURN_MODEL_STATUS.BUILDING);
    expect(selectBurnModelStatus(root)).toBe(BURN_MODEL_STATUS.READY);
    expect(selectBurnModel(root)).toBe(model);
  });

  it('marks a failure', () => {
    expect(selectBurnModelStatus(newRootState(reduceActions([newBuildRequest(), new BurnModelFailed()]))))
      .toBe(BURN_MODEL_STATUS.FAILED);
  });

  it('clears the selection and the lifts when a model is ready', () => {
    const root = newRootState(reduceActions([
      ...READY_ACTIONS,
      new BurnPartSelected({ partId: PARENT_ID }),
      new BurnPartLifted({ partId: PARENT_ID, liftMm: PARENT_LIFT_MM }),
      new BurnModelReady({ model: newModel() }),
    ]));

    expect(selectSelectedBurnPartId(root)).toBeUndefined();
    expect(selectBurnPartLiftMm(PARENT_ID)(root)).toBe(0);
  });

  it.each([
    ['a toolpath request', new ToolpathRequested()],
    ['a machine area change', new ToolpathMachineAreaChanged()],
    ['a layer change', new LayerToggled({ layerKey: LAYER_KEY, enabled: false })],
    ['an undo', new ProjectUndoRequested()],
    ['another material being selected', new ProjectMaterialSelected({ materialId: OTHER_MATERIAL_ID })],
    ['an edit of its material', new MaterialSaved({ material: newMaterial({ id: BUILT_MATERIAL_ID }) })],
  ])('makes a ready model stale on %s', (_title: string, action: Action<unknown>) => {
    const root = newRootState(reduceActions([...READY_ACTIONS, action]));

    expect(selectBurnModelStatus(root)).toBe(BURN_MODEL_STATUS.STALE);
    expect(selectBurnModel(root)).toBeDefined();
  });

  it.each([
    ['the same material being selected', new ProjectMaterialSelected({ materialId: BUILT_MATERIAL_ID })],
    ['an edit of another material', new MaterialSaved({ material: newMaterial({ id: OTHER_MATERIAL_ID }) })],
    ['a test of another material', new MaterialTestResultSaved({
      materialId: OTHER_MATERIAL_ID,
      testResult: newTestResultFixture(),
    })],
  ])('keeps a ready model ready on %s', (_title: string, action: Action<unknown>) => {
    const root = newRootState(reduceActions([...READY_ACTIONS, action]));

    expect(selectBurnModelStatus(root)).toBe(BURN_MODEL_STATUS.READY);
  });

  it('leaves a failed model failed on a document change', () => {
    const root = newRootState(reduceActions([new BurnModelFailed(), new ToolpathRequested()]));

    expect(selectBurnModelStatus(root)).toBe(BURN_MODEL_STATUS.FAILED);
  });

  it('stops building without a model when the input changes, so the saga can cancel', () => {
    const root = newRootState(reduceActions([newBuildRequest(), new ToolpathRequested()]));

    expect(selectBurnModelStatus(root)).toBe(BURN_MODEL_STATUS.IDLE);
  });

  it('stops building when the view leaves 3D and keeps an older model as stale', () => {
    const root = newRootState(reduceActions([
      ...READY_ACTIONS,
      newBuildRequest(),
      new BedViewModeChanged({ viewMode: BED_VIEW_MODE.DESIGN }),
    ]));

    expect(selectBurnModelStatus(root)).toBe(BURN_MODEL_STATUS.STALE);
  });

  it('keeps a ready model ready when the view changes', () => {
    const root = newRootState(reduceActions([
      ...READY_ACTIONS,
      new BedViewModeChanged({ viewMode: BED_VIEW_MODE.DESIGN }),
    ]));

    expect(selectBurnModelStatus(root)).toBe(BURN_MODEL_STATUS.READY);
  });

  it('lets a part lift as high as the user wants, and no lower than its place', () => {
    const veryHigh = THICKNESS_MM * 1000;
    const root = newRootState(reduceActions([
      ...READY_ACTIONS,
      new BurnPartLifted({ partId: PARENT_ID, liftMm: veryHigh }),
      new BurnPartLifted({ partId: CHILD_ID, liftMm: -1 }),
    ]));

    expect(selectBurnPartLiftMm(PARENT_ID)(root)).toBe(veryHigh);
    expect(selectBurnPartLiftMm(CHILD_ID)(root)).toBe(0);
  });

  it('refuses to lift a part that does not cut through', () => {
    const notThroughPart: BurnPart = { ...newPart(PARENT_ID, undefined), status: BURN_PART_STATUS.NOT_THROUGH };
    const root = newRootState(reduceActions([
      new BurnModelReady({ model: newModel([notThroughPart]) }),
      new BurnPartLifted({ partId: PARENT_ID, liftMm: PARENT_LIFT_MM }),
    ]));

    expect(selectBurnPartLiftMm(PARENT_ID)(root)).toBe(0);
  });

  it('lifts a borderline part', () => {
    const borderlinePart: BurnPart = { ...newPart(PARENT_ID, undefined), status: BURN_PART_STATUS.BORDERLINE };
    const root = newRootState(reduceActions([
      new BurnModelReady({ model: newModel([borderlinePart]) }),
      new BurnPartLifted({ partId: PARENT_ID, liftMm: PARENT_LIFT_MM }),
    ]));

    expect(selectBurnPartLiftMm(PARENT_ID)(root)).toBe(PARENT_LIFT_MM);
  });

  it('selects and clears the selected part', () => {
    const selectedRoot = newRootState(reduceActions([...READY_ACTIONS, new BurnPartSelected({ partId: CHILD_ID })]));
    const clearedRoot = newRootState(reduceActions([
      ...READY_ACTIONS,
      new BurnPartSelected({ partId: CHILD_ID }),
      new BurnPartSelected({ partId: undefined }),
    ]));

    expect(selectSelectedBurnPartId(selectedRoot)).toBe(CHILD_ID);
    expect(selectSelectedBurnPartId(clearedRoot)).toBeUndefined();
  });
});

describe(selectCurrentBurnModel.name, () => {
  it('gives the model only while it is ready', () => {
    const model: BurnModel = newModel();
    const readyActions: Action<unknown>[] = [new BurnModelReady({ model })];

    expect(selectCurrentBurnModel(newRootState(reduceActions(readyActions)))).toBe(model);
    expect(selectCurrentBurnModel(newRootState(reduceActions([...readyActions, new ProjectUndoRequested()]))))
      .toBeUndefined();
    expect(selectCurrentBurnModel(newRootState(reduceActions([...readyActions, newBuildRequest()]))))
      .toBeUndefined();
    expect(selectCurrentBurnModel(newRootState(reduceActions([...readyActions, new BurnModelFailed()]))))
      .toBeUndefined();
  });
});

describe(selectBurnPartEffectiveLiftsMm.name, () => {
  it('gives the lift of every part with what its parents add, and the same object until something changes', () => {
    const root = newRootState(reduceActions([
      ...READY_ACTIONS,
      new BurnPartLifted({ partId: PARENT_ID, liftMm: PARENT_LIFT_MM }),
    ]));

    expect(selectBurnPartEffectiveLiftsMm(root)).toEqual({ [PARENT_ID]: PARENT_LIFT_MM, [CHILD_ID]: PARENT_LIFT_MM });
    expect(selectBurnPartEffectiveLiftsMm(root)).toBe(selectBurnPartEffectiveLiftsMm(root));
  });
});

describe(selectBurnPartEffectiveLiftMm.name, () => {
  it('carries the lift of a parent to its child', () => {
    const root = newRootState(reduceActions([
      ...READY_ACTIONS,
      new BurnPartLifted({ partId: PARENT_ID, liftMm: PARENT_LIFT_MM }),
    ]));

    expect(selectBurnPartEffectiveLiftMm(CHILD_ID)(root)).toBe(PARENT_LIFT_MM);
    expect(selectBurnPartEffectiveLiftMm(PARENT_ID)(root)).toBe(PARENT_LIFT_MM);
  });

  it('adds the own lift of the child and every ancestor', () => {
    const parts: BurnPart[] = [
      newPart(PARENT_ID, undefined),
      newPart(CHILD_ID, PARENT_ID),
      newPart(GRANDCHILD_ID, CHILD_ID),
    ];
    const root = newRootState(reduceActions([
      new BurnModelReady({ model: newModel(parts) }),
      new BurnPartLifted({ partId: PARENT_ID, liftMm: PARENT_LIFT_MM }),
      new BurnPartLifted({ partId: CHILD_ID, liftMm: CHILD_LIFT_MM }),
    ]));

    expect(selectBurnPartEffectiveLiftMm(CHILD_ID)(root)).toBe(PARENT_LIFT_MM + CHILD_LIFT_MM);
    expect(selectBurnPartEffectiveLiftMm(GRANDCHILD_ID)(root)).toBe(PARENT_LIFT_MM + CHILD_LIFT_MM);
  });

  it('stops at a parent loop instead of walking forever', () => {
    const parts: BurnPart[] = [newPart(PARENT_ID, CHILD_ID), newPart(CHILD_ID, PARENT_ID)];
    const root = newRootState(reduceActions([
      new BurnModelReady({ model: newModel(parts) }),
      new BurnPartLifted({ partId: PARENT_ID, liftMm: PARENT_LIFT_MM }),
    ]));

    expect(selectBurnPartEffectiveLiftMm(CHILD_ID)(root)).toBe(PARENT_LIFT_MM);
  });

  it('gives 0 for a part the model does not have', () => {
    const root = newRootState(reduceActions(READY_ACTIONS));

    expect(selectBurnPartEffectiveLiftMm(UNKNOWN_PART_ID)(root)).toBe(0);
  });
});
