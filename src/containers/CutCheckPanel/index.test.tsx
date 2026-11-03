import { act, fireEvent, render, screen } from '@testing-library/react';
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
  selectHoveredBurnPartId,
  selectSelectedBurnPartId,
} from '../../utils/states/burn.model.state';
import { MaterialSaved } from '../../utils/states/material.state';
import { newStore } from '../../utils/states/new.store';
import type { AppStore } from '../../utils/states/new.store';
import { selectPaletteEntries } from '../../utils/states/palette.state';
import { LayerToggled, ProjectMaterialSelected, selectProjectLayers } from '../../utils/states/project.document.state';
import { ToolpathReady, ToolpathRequested, selectToolpathDocumentVersion } from '../../utils/states/toolpath.state';
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
const GUESS_NOTE = 'This is a guess: no test has been made with this material on this machine.';
const TEST_SAMPLE_POINTER = 'Add the test sample in Design, burn it, then enter the result to get an estimate.';
const OUT_OF_DATE_TEXT = /^Out of date: the design changed/;
const BUILDING_TEXT = 'Building the 3D view';
const FAILED_TEXT = /^The 3D view could not be built/;
const NO_MATERIAL_TEXT = /^Pick a material in Design/;
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

const renderPanel = (store: AppStore): void => {
  render(
    <Provider store={store}>
      <CutCheckPanel />
    </Provider>,
  );
};

const getPartRow = (partId: number): HTMLElement => screen.getByRole('button', { name: new RegExp(`^Part ${partId}`) });

describe(CutCheckPanel.name, () => {
  it('shows the part counts and the estimate note, without the guess note, when there is a test', () => {
    renderPanel(newReadyStore());

    for (const summaryText of ['3 parts', '1 free', '1 may stay attached', '1 attached']) {
      expect(screen.getByText(summaryText)).toBeInTheDocument();
    }

    expect(screen.getByText(ESTIMATE_NOTE)).toBeInTheDocument();
    expect(screen.queryByText(GUESS_NOTE)).not.toBeInTheDocument();
    expect(screen.queryByText(TEST_SAMPLE_POINTER)).not.toBeInTheDocument();
  });

  it('shows the guess note and points to the test sample when there is no test', () => {
    renderPanel(newReadyStore(newModel(newCutCheck({ isGuess: true }))));

    expect(screen.getByText(GUESS_NOTE)).toBeInTheDocument();
    expect(screen.getByText(TEST_SAMPLE_POINTER)).toBeInTheDocument();
    expect(screen.queryByText(ESTIMATE_NOTE)).not.toBeInTheDocument();
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

    fireEvent.click(getPartRow(BORDERLINE_PART_ID));

    expect(getPartRow(BORDERLINE_PART_ID)).toHaveAttribute('aria-pressed', 'true');
    expect(getPartRow(FREE_PART_ID)).toHaveAttribute('aria-pressed', 'false');
  });

  it('selects a part with no mesh through its row, and the lift control then says why it cannot lift', () => {
    const store: AppStore = newReadyStore();

    render(
      <Provider store={store}>
        <CutCheckPanel />
        <BurnPartLiftControl />
      </Provider>,
    );
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

    expect(screen.getByText(new RegExp(`^Layer ${layerName}: Part 3 stays attached`))).toBeInTheDocument();
    expect(screen.getByText(new RegExp(`^Layer ${UNKNOWN_LAYER_KEY}: Part 3 stays attached`))).toBeInTheDocument();
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

      expect(screen.getAllByRole('alert')).toHaveLength(3);
      expect(screen.getByText(new RegExp(
        `^Layer ${UNKNOWN_LAYER_KEY}: 2 parts may stay attached \\(predicted 0\\.2 mm, needed 3\\.0 mm\\)\\.`,
      ))).toBeInTheDocument();
      expect(screen.getByText(/Part 3 stays attached/)).toBeInTheDocument();
      expect(screen.getByText(/the fill cuts through/)).toBeInTheDocument();
    });

    it('shows the warning of a part in its row only while that part is selected', () => {
      renderPanel(newReadyStore(groupedModel));

      expect(screen.queryByText(/Part 2 may stay attached/)).not.toBeInTheDocument();

      fireEvent.click(getPartRow(BORDERLINE_PART_ID));

      expect(screen.getByText(/Part 2 may stay attached/)).toBeInTheDocument();
      expect(screen.queryByText(/Part 1 may stay attached/)).not.toBeInTheDocument();
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
            <CutCheckPanel />
            <JobCard />
          </BedRegionTestHost>
        </AntdTestProvider>
      </Provider>,
    );

    expect(screen.getByText(/lower the power or raise the speed/)).toBeInTheDocument();
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

    expect(screen.getByText(OUT_OF_DATE_TEXT)).toBeInTheDocument();
    expect(screen.queryByText('3 parts')).not.toBeInTheDocument();
    expect(screen.queryByRole('button', { name: /^Part / })).not.toBeInTheDocument();
    expect(screen.queryByText(ESTIMATE_NOTE)).not.toBeInTheDocument();
  });

  it('says when no material is chosen', () => {
    renderPanel(newStore());

    expect(screen.getByText(NO_MATERIAL_TEXT)).toBeInTheDocument();
  });

  it.each([
    ['building', (): BurnModelRequested => new BurnModelRequested({ materialId: MATERIAL.id }), BUILDING_TEXT],
    ['failed', (): BurnModelFailed => new BurnModelFailed(), FAILED_TEXT],
  ])('explains a %s model and shows no old parts', (_title, newAction, expectedText) => {
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

    expect(screen.getByText(expectedText)).toBeInTheDocument();
    expect(screen.queryByRole('button', { name: /^Part / })).not.toBeInTheDocument();
  });
});
