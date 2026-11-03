import { act, fireEvent, render, screen } from '@testing-library/react';
import { Provider } from 'react-redux';
import { BurnPartLiftControl } from '.';
import { BURN_PART_STATUS } from '../../../utils/burn.model/burn.model.constants';
import { getBurnModel } from '../../../utils/burn.model/get.burn.model';
import type { BurnModel } from '../../../utils/burn.model/interfaces/BurnModel';
import type { BurnPart } from '../../../utils/burn.model/interfaces/BurnPart';
import type { BurnPartStatus } from '../../../utils/burn.model/burn.model.constants';
import { getTestJobToolpath } from '../../../utils/burn.model/test.support/get.test.job.toolpath';
import { newStrokedDrawable } from '../../../utils/burn.model/test.support/new.stroked.drawable';
import { newTestLayer } from '../../../utils/burn.model/test.support/new.test.layer';
import type { ProjectLayer } from '../../../utils/layers/interfaces/ProjectLayer';
import {
  BurnModelReady,
  BurnPartSelected,
  selectBurnPartLiftMm,
} from '../../../utils/states/burn.model.state';
import { newStore } from '../../../utils/states/new.store';
import { ProjectUndoRequested } from '../../../utils/states/project.document.state';
import { getBoxSubpath } from '../../../utils/toolpath/test.support/get.box.subpath';

const THICKNESS_MM = 3;
const PART_ID = 1;
const CHILD_ID = 2;
const OTHER_PART_ID = 3;
const LIFT_LABEL = 'Lift selected part';
const MAY_STAY_ATTACHED_TEXT = 'may stay attached';
const NOT_THROUGH_REASON = 'Part 1 stays attached: the cut does not reach through, so it cannot be lifted.';
const RISES_WITH_PARENT_REASON =
  'Part 2 stays attached to part 1, so it rises with it and cannot be lifted on its own.';
const STEP_MM = 0.1;
const LAYER_COLOUR = '#ff0000';

const newPart = (id: number, status: BurnPartStatus, parentId?: number): BurnPart => ({
  id,
  parentId,
  status,
  boundsMm: { minX: 0, minY: 0, maxX: 1, maxY: 1 },
  weakestLayerKey: undefined,
  weakestDepthMm: undefined,
});

const newModel = (parts: BurnPart[]): BurnModel => ({
  parts,
  cutCheck: { freePartCount: 0, borderlinePartCount: 0, attachedPartCount: 0, warnings: [], isGuess: false },
  meshes: [],
  sheetBounds: { minX: 0, minY: 0, maxX: 1, maxY: 1 },
  thicknessMm: THICKNESS_MM,
});

type AppStore = ReturnType<typeof newStore>;

const renderControl = (model: BurnModel, partId: number): AppStore => {
  const store: AppStore = newStore();

  store.dispatch(new BurnModelReady({ model }));
  store.dispatch(new BurnPartSelected({ partId }));
  render(
    <Provider store={store}>
      <BurnPartLiftControl />
    </Provider>,
  );

  return store;
};

const getLiftControl = (): HTMLElement => screen.getByRole('spinbutton', { name: LIFT_LABEL });

describe(BurnPartLiftControl.name, () => {
  it('lifts a free part from the keyboard, with no upper limit', () => {
    const store: AppStore = renderControl(newModel([newPart(PART_ID, BURN_PART_STATUS.FREE)]), PART_ID);

    expect(getLiftControl()).not.toHaveAttribute('aria-valuemax');
    expect(screen.queryByText(MAY_STAY_ATTACHED_TEXT)).not.toBeInTheDocument();

    fireEvent.keyDown(getLiftControl(), { key: 'ArrowRight', keyCode: 39, which: 39 });

    expect(selectBurnPartLiftMm(PART_ID)(store.getState())).toBeCloseTo(STEP_MM);
  });

  it('lifts a borderline part too, and marks it as one that may stay attached', () => {
    const store: AppStore = renderControl(newModel([newPart(PART_ID, BURN_PART_STATUS.BORDERLINE)]), PART_ID);

    expect(screen.getByText(MAY_STAY_ATTACHED_TEXT)).toBeInTheDocument();

    fireEvent.keyDown(getLiftControl(), { key: 'ArrowRight', keyCode: 39, which: 39 });

    expect(selectBurnPartLiftMm(PART_ID)(store.getState())).toBeCloseTo(STEP_MM);
  });

  it('disables lifting and gives the reason for a part that does not cut through', () => {
    const store: AppStore = renderControl(
      newModel([newPart(PART_ID, BURN_PART_STATUS.NOT_THROUGH)]),
      PART_ID,
    );

    expect(getLiftControl()).toHaveAttribute('aria-disabled', 'true');
    expect(screen.getByText(NOT_THROUGH_REASON)).toBeInTheDocument();

    fireEvent.keyDown(getLiftControl(), { key: 'ArrowRight', keyCode: 39, which: 39 });

    expect(selectBurnPartLiftMm(PART_ID)(store.getState())).toBe(0);
  });

  it('disables lifting and says why for a not-through part that rises inside a liftable parent', () => {
    renderControl(
      newModel([newPart(PART_ID, BURN_PART_STATUS.FREE), newPart(CHILD_ID, BURN_PART_STATUS.NOT_THROUGH, PART_ID)]),
      CHILD_ID,
    );

    expect(getLiftControl()).toHaveAttribute('aria-disabled', 'true');
    expect(screen.getByText(RISES_WITH_PARENT_REASON)).toBeInTheDocument();
  });

  it('lets every part lift when no test result exists, from the real guess of a real cut', () => {
    const layers: ProjectLayer[] = [
      newTestLayer(LAYER_COLOUR, { maxPowerPercent: 100, speedMmPerMin: 300, passes: 1 }),
    ];
    const square = getBoxSubpath({ minX: 10, minY: 10, maxX: 20, maxY: 20 });
    const model: BurnModel = getBurnModel({
      toolpath: getTestJobToolpath([newStrokedDrawable([square], LAYER_COLOUR)], layers),
      layers,
      thicknessMm: THICKNESS_MM,
      testResult: undefined,
    });

    renderControl(model, PART_ID);

    expect(model.parts.map(({ status }: BurnPart) => status)).toEqual([BURN_PART_STATUS.BORDERLINE]);
    expect(getLiftControl()).not.toHaveAttribute('aria-disabled', 'true');
  });

  it('shows nothing with no part selected, or for a part the model does not have', () => {
    const model: BurnModel = newModel([newPart(PART_ID, BURN_PART_STATUS.FREE)]);

    renderControl(model, OTHER_PART_ID);

    expect(screen.queryByText(LIFT_LABEL)).not.toBeInTheDocument();
  });

  it('hides once the model is out of date', () => {
    const store: AppStore = renderControl(newModel([newPart(PART_ID, BURN_PART_STATUS.FREE)]), PART_ID);

    expect(getLiftControl()).toBeInTheDocument();

    act(() => {
      store.dispatch(new ProjectUndoRequested());
    });

    expect(screen.queryByText(LIFT_LABEL)).toBeNull();
  });
});
