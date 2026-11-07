import { act, fireEvent, render, screen, within } from '@testing-library/react';
import { Provider } from 'react-redux';
import { CutCheckPanel } from '.';
import { BURN_PART_STATUS, CUT_CHECK_WARNING_KIND } from '../../utils/burn.model/burn.model.constants';
import type { BurnModel } from '../../utils/burn.model/interfaces/BurnModel';
import type { BurnPart } from '../../utils/burn.model/interfaces/BurnPart';
import type { CutCheck } from '../../utils/burn.model/interfaces/CutCheck';
import type { CutCheckWarning } from '../../utils/burn.model/interfaces/CutCheckWarning';
import { getLayerDisplayName } from '../../utils/layers/get.layer.display.name';
import { getLayerKey } from '../../utils/layers/get.layer.key';
import { getLayerPaletteEntry } from '../../utils/layers/get.layer.palette.entry';
import type { ProjectLayer } from '../../utils/layers/interfaces/ProjectLayer';
import type { Material } from '../../utils/materials/interfaces/Material';
import { newMaterial } from '../../utils/materials/new.material';
import {
  BurnModelFailed,
  BurnModelReady,
  BurnModelRequested,
  BurnPartLifted,
  BurnPartSelected,
  selectHoveredBurnPartId,
  selectSelectedBurnPartId,
} from '../../utils/states/burn.model.state';
import { MaterialSaved } from '../../utils/states/material.state';
import { newStore } from '../../utils/states/new.store';
import type { AppStore } from '../../utils/states/new.store';
import { selectPaletteEntries } from '../../utils/states/palette.state';
import { LayerToggled, ProjectMaterialSelected, selectProjectLayers } from '../../utils/states/project.document.state';
import { ToolpathReady, ToolpathRequested, selectToolpathDocumentVersion } from '../../utils/states/toolpath.state';
import { selectOpenLayerSettingsKey } from '../../utils/states/ui.workbench.state';
import { AntdTestProvider } from '../../utils/test.support/antd.test.provider';
import { BedRegionTestHost } from '../../utils/test.support/bed.region.test.host';
import { newGcodeExportTestStore } from '../../utils/test.support/new.gcode.export.test.store';
import { newToolpath } from '../../utils/toolpath/test.support/new.toolpath';
import { BurnPartLiftControl } from '../BurnPreviewPane/BurnPartLiftControl';
import { JobCard } from '../MachinePanel/JobCard';

const FREE_PART_ID = 1;
const BORDERLINE_PART_ID = 2;
const ATTACHED_PART_ID = 3;
const UNKNOWN_LAYER_KEY = '#123456';
const MATERIAL: Material = newMaterial();
const EXPORT_LABEL = 'Export G-code';
const ESTIMATE_NOTE = 'Estimate from your test.';
const GUESS_NOTE = 'This is a guess: no test has been made with this material on this laser.';
const TEST_SAMPLE_POINTER = 'Add the test sample in Design, burn it, then enter the result to get an estimate.';
const BUILDING_TEXT = 'Building 3D…';
const FAILED_TEXT = /^The 3D view could not be built/;
const NOT_THROUGH_HINT = 'Part 3 stays attached: the cut does not reach through, so it cannot be lifted.';

const newPart = (id: number, status: BurnPart['status']): BurnPart => ({
  id,
  parentId: undefined,
  status,
  boundsMm: { minX: 0, minY: 0, maxX: 1, maxY: 1 },
  weakestLayerKey: undefined,
  weakestDepthMm: undefined,
});

const newCutCheck = (overrides: Partial<CutCheck> = {}): CutCheck => ({
  freePartCount: 1,
  borderlinePartCount: 1,
  attachedPartCount: 1,
  warnings: [],
  isGuess: false,
  ...overrides,
});

const newModel = (cutCheck: CutCheck = newCutCheck()): BurnModel => ({
  parts: [
    newPart(FREE_PART_ID, BURN_PART_STATUS.FREE),
    newPart(BORDERLINE_PART_ID, BURN_PART_STATUS.BORDERLINE),
    newPart(ATTACHED_PART_ID, BURN_PART_STATUS.NOT_THROUGH),
  ],
  cutCheck,
  meshes: [],
  sheetBounds: { minX: 0, minY: 0, maxX: 1, maxY: 1 },
  thicknessMm: 3,
});

const newReadyStore = (model: BurnModel = newModel()): AppStore => {
  const store: AppStore = newStore();

  store.dispatch(new BurnModelReady({ model }));

  return store;
};

const SHOW_DETAILS_LABEL = 'Show the cut check';
const HIDE_DETAILS_LABEL = 'Hide the cut check';

/** Opens the folded check; one already open (a part is selected) or with no model has no Show button. */
const expandPanel = (): void => {
  const showButton: HTMLElement | null = screen.queryByRole('button', { name: SHOW_DETAILS_LABEL });

  if (showButton) {
    fireEvent.click(showButton);
  }
};

/** Renders the panel and opens it, since it starts folded to its heading. */
const renderPanel = (store: AppStore): void => {
  render(
    <Provider store={store}>
      <CutCheckPanel isActive />
    </Provider>,
  );
  expandPanel();
};

const getPartRow = (partId: number): HTMLElement => screen.getByRole('button', { name: new RegExp(`^Part ${partId}`) });

describe(CutCheckPanel.name, () => {
  it('outside the 3D view is a muted heading whose note says it runs in 3D', () => {
    render(
      <Provider store={newReadyStore()}>
        <CutCheckPanel isActive={false} />
      </Provider>,
    );

    expect(screen.getByRole('heading', { name: 'Cut check' })).toBeInTheDocument();
    expect(screen.getByRole('note', { name: 'The cut check runs in the 3D view.' })).toHaveAttribute('tabindex', '0');
    expect(screen.queryByText('3 parts')).not.toBeInTheDocument();
  });

  it('starts folded to its heading with a count of its warnings, and opens and folds again', () => {
    const warning: CutCheckWarning = {
      kind: CUT_CHECK_WARNING_KIND.FILL_CUTS_THROUGH,
      layerKey: UNKNOWN_LAYER_KEY,
      partId: undefined,
      predictedDepthMm: 4,
      neededDepthMm: 3,
      isLessSure: false,
      isDepthUpperBound: false,
    };

    render(
      <Provider store={newReadyStore(newModel(newCutCheck({ warnings: [warning] })))}>
        <CutCheckPanel isActive />
      </Provider>,
    );

    expect(screen.queryByText('3 parts')).not.toBeInTheDocument();
    expect(screen.getByRole('img', { name: '1 warning' })).toHaveTextContent('1');

    fireEvent.click(screen.getByRole('button', { name: SHOW_DETAILS_LABEL }));

    expect(screen.getByText('3 parts')).toBeInTheDocument();

    fireEvent.click(screen.getByRole('button', { name: HIDE_DETAILS_LABEL }));

    expect(screen.queryByText('3 parts')).not.toBeInTheDocument();
  });

  it('shows no warning count when there is nothing to warn about', () => {
    render(
      <Provider store={newReadyStore()}>
        <CutCheckPanel isActive />
      </Provider>,
    );

    expect(screen.queryByRole('img', { name: /warning/ })).not.toBeInTheDocument();
  });

  it('opens when a part is selected in the scene, so its row is in view', () => {
    const store: AppStore = newReadyStore();

    render(
      <Provider store={store}>
        <CutCheckPanel isActive />
      </Provider>,
    );
    act(() => {
      store.dispatch(new BurnPartSelected({ partId: FREE_PART_ID }));
    });

    expect(getPartRow(FREE_PART_ID)).toHaveAttribute('aria-pressed', 'true');
  });

  it('shows the part counts and the estimate note, without the guess note, when there is a test', () => {
    renderPanel(newReadyStore());

    for (const summaryText of ['3 parts', '1 free', '1 may stay attached', '1 attached']) {
      expect(screen.getByText(summaryText)).toBeInTheDocument();
    }

    expect(screen.getByLabelText(ESTIMATE_NOTE)).toHaveTextContent('Estimate');
    expect(screen.queryByText('Guess')).not.toBeInTheDocument();
  });

  it('shows the guess note and points to the test sample when there is no test', () => {
    renderPanel(newReadyStore(newModel(newCutCheck({ isGuess: true }))));

    expect(screen.getByLabelText(`${GUESS_NOTE} ${TEST_SAMPLE_POINTER}`)).toHaveTextContent('Guess');
    expect(screen.queryByText('Estimate')).not.toBeInTheDocument();
  });

  it('writes one part in the singular', () => {
    renderPanel(newReadyStore({
      ...newModel(newCutCheck({ borderlinePartCount: 0, attachedPartCount: 0 })),
      parts: [newPart(FREE_PART_ID, BURN_PART_STATUS.FREE)],
    }));

    expect(screen.getByText('1 part')).toBeInTheDocument();
  });

  it('lists every part with its status and marks the selected row', () => {
    renderPanel(newReadyStore());

    expect(getPartRow(FREE_PART_ID)).toHaveTextContent('Free');
    expect(getPartRow(BORDERLINE_PART_ID)).toHaveTextContent('May stay attached');
    expect(getPartRow(ATTACHED_PART_ID)).toHaveTextContent('Attached');
    // One icon per row stands for the status; no row repeats a visible badge.
    expect(getPartRow(BORDERLINE_PART_ID).querySelector('.ant-tag')).toBeNull();

    fireEvent.click(getPartRow(BORDERLINE_PART_ID));

    expect(getPartRow(BORDERLINE_PART_ID)).toHaveAttribute('aria-pressed', 'true');
    expect(getPartRow(FREE_PART_ID)).toHaveAttribute('aria-pressed', 'false');
  });

  it('selects a part with no mesh through its row, and the lift control then says why it cannot lift', () => {
    const store: AppStore = newReadyStore();

    render(
      <Provider store={store}>
        <CutCheckPanel isActive />
        <BurnPartLiftControl />
      </Provider>,
    );
    expandPanel();
    fireEvent.click(getPartRow(ATTACHED_PART_ID));

    expect(selectSelectedBurnPartId(store.getState())).toBe(ATTACHED_PART_ID);
    expect(screen.getByRole('spinbutton')).toHaveAttribute('aria-disabled', 'true');
    expect(screen.getByText(NOT_THROUGH_HINT)).toBeInTheDocument();
  });

  it('names a warning layer as the layer list does, and falls back to the key of a layer that is gone', async () => {
    const store: AppStore = await newGcodeExportTestStore();
    const [layer] = selectProjectLayers(store.getState());

    if (!layer) {
      throw new Error('The test project has no layer');
    }

    const layerName: string = getLayerDisplayName(
      layer,
      getLayerPaletteEntry(layer, selectPaletteEntries(store.getState())),
    );
    const warning = {
      kind: CUT_CHECK_WARNING_KIND.PART_ATTACHED,
      partId: ATTACHED_PART_ID,
      predictedDepthMm: 1,
      neededDepthMm: 3,
      isLessSure: false,
      isDepthUpperBound: false,
    };

    act(() => {
      store.dispatch(new BurnModelReady({
        model: newModel(newCutCheck({
          warnings: [
            { ...warning, layerKey: getLayerKey(layer) },
            { ...warning, layerKey: UNKNOWN_LAYER_KEY },
          ],
        })),
      }));
    });
    renderPanel(store);

    expect(screen.getByLabelText(new RegExp(`^Layer ${layerName}: Part 3 stays attached`))).toBeInTheDocument();
    expect(screen.getByLabelText(new RegExp(`^Layer ${UNKNOWN_LAYER_KEY}: Part 3 stays attached`))).toBeInTheDocument();

    fireEvent.click(screen.getByRole('button', { name: `Fix in ${layerName} settings` }));

    expect(selectOpenLayerSettingsKey(store.getState())).toBe(getLayerKey(layer));
  });

  describe('warnings of many parts', () => {
    const newMayStayWarning = (partId: number): CutCheckWarning => ({
      kind: CUT_CHECK_WARNING_KIND.PART_MAY_STAY_ATTACHED,
      layerKey: UNKNOWN_LAYER_KEY,
      partId,
      predictedDepthMm: 0.2,
      neededDepthMm: 3,
      isLessSure: false,
      isDepthUpperBound: false,
    });
    const groupedModel: BurnModel = newModel(newCutCheck({
      warnings: [
        newMayStayWarning(FREE_PART_ID),
        newMayStayWarning(BORDERLINE_PART_ID),
        { ...newMayStayWarning(ATTACHED_PART_ID), kind: CUT_CHECK_WARNING_KIND.PART_ATTACHED },
        { ...newMayStayWarning(0), partId: undefined, kind: CUT_CHECK_WARNING_KIND.FILL_CUTS_THROUGH },
      ],
    }));

    it('says one thing once with the count, layer, depths and suggestion, and keeps each kind in view', () => {
      renderPanel(newReadyStore(groupedModel));

      expect(within(screen.getByRole('list', { name: 'Cut check warnings' })).getAllByRole('listitem')).toHaveLength(3);
      expect(screen.getByLabelText(new RegExp(
        `^Layer ${UNKNOWN_LAYER_KEY}: 2 parts may stay attached \\(predicted 0\\.2 mm, needed 3\\.0 mm\\)\\.`,
      ))).toBeInTheDocument();
      expect(screen.getByLabelText(/Part 3 stays attached/)).toBeInTheDocument();
      expect(screen.getByLabelText(/the fill cuts through/)).toBeInTheDocument();
    });

    it('keeps the numbers and the suggestion in the callout, never in a selected row', () => {
      renderPanel(newReadyStore(groupedModel));
      fireEvent.click(getPartRow(BORDERLINE_PART_ID));

      expect(screen.queryByText(/Part 2 may stay attached/)).not.toBeInTheDocument();
      expect(screen.getAllByLabelText(/predicted 0\.2 mm/)).toHaveLength(3);
    });
  });

  describe('a long part list', () => {
    const LONG_PART_IDS: number[] = [1, 2, 3, 4, 5];
    const longModel: BurnModel = {
      ...newModel(),
      parts: LONG_PART_IDS.map((id: number): BurnPart => newPart(id, BURN_PART_STATUS.BORDERLINE)),
    };
    const SHOW_ALL_LABEL = 'Show all 5 parts';

    it('starts with no rows and a control that shows them all and hides them again', () => {
      renderPanel(newReadyStore(longModel));

      expect(screen.queryByRole('button', { name: /^Part / })).not.toBeInTheDocument();

      fireEvent.click(screen.getByRole('button', { name: SHOW_ALL_LABEL }));

      expect(screen.getAllByRole('button', { name: /^Part / })).toHaveLength(LONG_PART_IDS.length);

      fireEvent.click(screen.getByRole('button', { name: 'Show fewer parts' }));

      expect(screen.queryByRole('button', { name: /^Part / })).not.toBeInTheDocument();
    });

    it('keeps the selected row while cut down', () => {
      const store: AppStore = newReadyStore(longModel);

      store.dispatch(new BurnPartSelected({ partId: BORDERLINE_PART_ID }));
      renderPanel(store);

      expect(screen.getAllByRole('button', { name: /^Part / })).toHaveLength(1);
      expect(getPartRow(BORDERLINE_PART_ID)).toHaveAttribute('aria-pressed', 'true');
    });
  });

  it('marks a lifted part in its row with its height, and no other', () => {
    const store: AppStore = newReadyStore();

    store.dispatch(new BurnPartLifted({ partId: FREE_PART_ID, liftMm: 40 }));
    renderPanel(store);

    expect(screen.getAllByLabelText(/^Lifted /)).toHaveLength(1);
    expect(getPartRow(FREE_PART_ID)).toContainElement(screen.getByLabelText('Lifted 40.0 mm'));
  });

  it('tells the store which part a row is under the pointer, and clears it on leaving', () => {
    const store: AppStore = newReadyStore();

    renderPanel(store);
    fireEvent.mouseEnter(getPartRow(BORDERLINE_PART_ID));
    expect(selectHoveredBurnPartId(store.getState())).toBe(BORDERLINE_PART_ID);

    fireEvent.mouseLeave(getPartRow(BORDERLINE_PART_ID));
    expect(selectHoveredBurnPartId(store.getState())).toBeUndefined();
  });

  it('keeps export enabled with warnings', async () => {
    const store: AppStore = await newGcodeExportTestStore();
    const [layer]: ProjectLayer[] = selectProjectLayers(store.getState());

    act(() => {
      store.dispatch(new BurnModelReady({
        model: newModel(newCutCheck({
          warnings: [{
            kind: CUT_CHECK_WARNING_KIND.FILL_CUTS_THROUGH,
            layerKey: layer ? getLayerKey(layer) : UNKNOWN_LAYER_KEY,
            partId: undefined,
            predictedDepthMm: 4,
            neededDepthMm: 3,
            isLessSure: false,
            isDepthUpperBound: false,
          }],
        })),
      }));
    });
    render(
      <Provider store={store}>
        <AntdTestProvider>
          <BedRegionTestHost>
            <CutCheckPanel isActive />
            <JobCard />
          </BedRegionTestHost>
        </AntdTestProvider>
      </Provider>,
    );
    expandPanel();

    expect(screen.getByLabelText(/lower the power or raise the speed/)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: EXPORT_LABEL })).toBeEnabled();
  });

  it('shows no old parts as current after a layer edit, only that the check is out of date', () => {
    const store: AppStore = newReadyStore();

    store.dispatch(new MaterialSaved({ material: MATERIAL }));
    store.dispatch(new ProjectMaterialSelected({ materialId: MATERIAL.id }));
    store.dispatch(new BurnModelReady({ model: newModel() }));
    renderPanel(store);

    for (const summaryText of ['3 parts', '1 free', '1 may stay attached', '1 attached']) {
      expect(screen.getByText(summaryText)).toBeInTheDocument();
    }

    act(() => {
      store.dispatch(new LayerToggled({ layerKey: UNKNOWN_LAYER_KEY, enabled: false }));
    });

    expect(screen.queryByText('3 parts')).not.toBeInTheDocument();
    expect(screen.queryByRole('button', { name: /^Part / })).not.toBeInTheDocument();
    expect(screen.queryByLabelText(ESTIMATE_NOTE)).not.toBeInTheDocument();
  });

  it.each([
    ['building', (): BurnModelRequested => new BurnModelRequested({ materialId: MATERIAL.id }), BUILDING_TEXT],
    ['failed', (): BurnModelFailed => new BurnModelFailed(), FAILED_TEXT],
  ])('leaves a %s model to the 3D view and shows no old parts', (_title, newAction, expectedText) => {
    const store: AppStore = newReadyStore();

    store.dispatch(new MaterialSaved({ material: MATERIAL }));
    store.dispatch(new ProjectMaterialSelected({ materialId: MATERIAL.id }));
    store.dispatch(new ToolpathRequested());
    store.dispatch(new ToolpathReady({
      toolpath: newToolpath(),
      documentVersion: selectToolpathDocumentVersion(store.getState()),
    }));
    renderPanel(store);
    act(() => {
      store.dispatch(newAction());
    });

    expect(screen.queryByText(expectedText)).not.toBeInTheDocument();
    expect(screen.queryByRole('button', { name: /^Part / })).not.toBeInTheDocument();
  });
});
