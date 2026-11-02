import { act, fireEvent, render, screen } from '@testing-library/react';
import { Provider } from 'react-redux';
import { JobCard } from '.';
import * as downloadModule from '../../../utils/browser/download.text.file';
import { EM_DASH, MIDDLE_DOT } from '../../../utils/characters.constants';
import { getLayerKey } from '../../../utils/layers/get.layer.key';
import { newMachineProfile } from '../../../utils/profiles/new.machine.profile';
import { newProjectObject } from '../../../utils/project/new.project.object';
import type { AppStore } from '../../../utils/states/new.store';
import { newStore } from '../../../utils/states/new.store';
import {
  LayerToggled,
  selectProjectDocument,
  selectProjectLayers,
} from '../../../utils/states/project.document.state';
import { ToolpathReady, ToolpathRequested, selectToolpathDocumentVersion } from '../../../utils/states/toolpath.state';
import { AntdTestProvider } from '../../../utils/test.support/antd.test.provider';
import { BedRegionTestHost } from '../../../utils/test.support/bed.region.test.host';
import { newGcodeExportTestStore } from '../../../utils/test.support/new.gcode.export.test.store';
import { GCODE_BURN_WORD } from '../../../utils/toolpath/gcode.constants';
import { getBedDrawables } from '../../../utils/toolpath/get.bed.drawables';
import { getGcodeExportContext } from '../../../utils/toolpath/get.gcode.export.context';
import { getGcodeText } from '../../../utils/toolpath/get.gcode.text';
import { getToolpath } from '../../../utils/toolpath/get.toolpath';
import type { BedDrawableSet } from '../../../utils/toolpath/interfaces/BedDrawableSet';
import { FakeToolpathWorkerClient } from '../../../utils/toolpath/test.support/fake.toolpath.worker.client';
import { newToolpath } from '../../../utils/toolpath/test.support/new.toolpath';
import { newToolpathMove } from '../../../utils/toolpath/test.support/new.toolpath.move';

const EXPORT_LABEL = 'Export G-code';
const START_JOB_LABEL = 'Start job';
const SOON_LABEL = 'Soon';
const PRIMARY_BUTTON_CLASS = 'ant-btn-primary';
const ESTIMATE_PLACEHOLDER = EM_DASH;
const SIXTY_SIX_SECONDS_TEXT = '1 min 6 s';
// One burn at 6000 mm/min from rest to rest with the default 1000 mm/s2: 65.9 s cruising plus 0.1 s of ramps.
const SIXTY_SIX_SECOND_MOVE_END_X_MM = 6590;
const TWO_LAYERS_ONE_OFF = `2 layers ${MIDDLE_DOT} 1 off`;
const ONE_LAYER = '1 layer';
const NEEDS_PROFILE_TOOLTIP = 'Add a machine profile to export G-code.';
const NEEDS_LAYER_TOOLTIP = 'Switch on a layer to export G-code.';
const THREE_COLOUR_SVG_TEXT = '<svg xmlns="http://www.w3.org/2000/svg" width="30mm" height="10mm" viewBox="0 0 30 10">'
  + '<rect fill="none" stroke="#ff0000" width="10" height="10"/>'
  + '<rect fill="none" stroke="#0000ff" x="10" width="10" height="10"/>'
  + '<rect fill="none" stroke="#00a000" x="20" width="10" height="10"/></svg>';
const CREATED_AT_ISO = '2026-11-01T10:00:00.000Z';
const BURN_LINE_PATTERN = new RegExp(`^${GCODE_BURN_WORD} `, 'm');

const renderJobCard = (store: AppStore): void => {
  render(
    <Provider store={store}>
      <AntdTestProvider>
        <BedRegionTestHost>
          <JobCard />
        </BedRegionTestHost>
      </AntdTestProvider>
    </Provider>,
  );
};

const getExportButton = (): HTMLElement => screen.getByRole('button', { name: EXPORT_LABEL });

const getFirstLayerKey = (store: AppStore): string => {
  const [firstLayer] = selectProjectLayers(store.getState());

  if (!firstLayer) {
    throw new Error('The test project has no layer');
  }

  return getLayerKey(firstLayer);
};

describe(JobCard.name, () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('shows the enabled layer count, the layers that are off and the estimate placeholder', async () => {
    const store: AppStore = await newGcodeExportTestStore({
      objects: [newProjectObject({ svgText: THREE_COLOUR_SVG_TEXT })],
    });
    renderJobCard(store);
    act(() => {
      store.dispatch(new LayerToggled({ layerKey: getFirstLayerKey(store), enabled: false }));
    });

    expect(screen.getByText(TWO_LAYERS_ONE_OFF)).toBeInTheDocument();
    expect(screen.getByText(ESTIMATE_PLACEHOLDER)).toBeInTheDocument();
  });

  it('shows the estimate of a ready toolpath', () => {
    const store: AppStore = newStore(undefined, new FakeToolpathWorkerClient(true));

    store.dispatch(new ToolpathRequested());
    store.dispatch(new ToolpathReady({
      toolpath: newToolpath({ moves: [newToolpathMove({ to: { x: SIXTY_SIX_SECOND_MOVE_END_X_MM, y: 0 } })] }),
      documentVersion: selectToolpathDocumentVersion(store.getState()),
    }));
    renderJobCard(store);

    expect(screen.getByText(SIXTY_SIX_SECONDS_TEXT)).toBeInTheDocument();
  });

  it('leaves out the off count when every layer is on', async () => {
    renderJobCard(await newGcodeExportTestStore());

    expect(screen.getByText(ONE_LAYER)).toBeInTheDocument();
  });

  it('keeps Start job coming soon: disabled, not the filled main action, with the Soon tag', async () => {
    renderJobCard(await newGcodeExportTestStore());
    const startJobButton: HTMLElement = screen.getByRole('button', { name: START_JOB_LABEL });

    expect(startJobButton).toBeDisabled();
    expect(startJobButton).not.toHaveClass(PRIMARY_BUTTON_CLASS);
    expect(startJobButton.closest('[aria-disabled="true"]')?.parentElement).toHaveTextContent(SOON_LABEL);
  });

  it('downloads the G-code from Export G-code', async () => {
    const downloadSpy = vi.spyOn(downloadModule, 'downloadTextFile').mockImplementation(() => undefined);

    renderJobCard(await newGcodeExportTestStore());
    fireEvent.click(getExportButton());

    await vi.waitFor((): void => {
      expect(downloadSpy).toHaveBeenCalledTimes(1);
    });
  });

  it('disables export without an active machine profile and says a profile is needed', async () => {
    renderJobCard(await newGcodeExportTestStore({ activeProfile: undefined }));

    expect(getExportButton()).toBeDisabled();

    fireEvent.mouseEnter(getExportButton().parentElement ?? getExportButton());

    expect(await screen.findByText(NEEDS_PROFILE_TOOLTIP)).toBeInTheDocument();
  });

  // A job with every layer off cannot be exported and writes no burn move.
  it('disables export with every layer off, and the G-code of that document burns nothing', async () => {
    const store: AppStore = await newGcodeExportTestStore({ areLayersEnabled: false });
    const drawableSet: BedDrawableSet = getBedDrawables(selectProjectDocument(store.getState()));
    const gcodeText: string = getGcodeText(
      getToolpath(drawableSet.drawables, drawableSet.warnings, selectProjectLayers(store.getState())),
      getGcodeExportContext({
        profile: newMachineProfile(),
        laserSettings: {},
        projectName: 'Off layers',
        createdAtIso: CREATED_AT_ISO,
      }),
    );

    renderJobCard(store);

    expect(getExportButton()).toBeDisabled();
    fireEvent.mouseEnter(getExportButton().parentElement ?? getExportButton());
    expect(await screen.findByText(NEEDS_LAYER_TOOLTIP)).toBeInTheDocument();
    expect(drawableSet.drawables.length).toBeGreaterThan(0);
    expect(gcodeText).not.toMatch(BURN_LINE_PATTERN);
  });
});
