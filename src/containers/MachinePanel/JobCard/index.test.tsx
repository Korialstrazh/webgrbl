import { act, fireEvent, render, screen } from '@testing-library/react';
import { Provider } from 'react-redux';
import type { MockInstance } from 'vitest';
import { JobCard } from '.';
import { JOB_LOCK_NOTE_TEST_IDS } from './job.card.constants';
import * as downloadModule from '../../../utils/browser/download.text.file';
import { EM_DASH, MIDDLE_DOT } from '../../../utils/characters.constants';
import { GRBL_CONNECTION_STATUS, GRBL_MACHINE_STATE } from '../../../utils/grbl/grbl.constants';
import type { GrblMachineState } from '../../../utils/grbl/grbl.constants';
import type { GrblResolvedStatus } from '../../../utils/grbl/interfaces/GrblResolvedStatus';
import { getLayerKey } from '../../../utils/layers/get.layer.key';
import type { MachineProfile } from '../../../utils/profiles/interfaces/MachineProfile';
import { newMachineProfile } from '../../../utils/profiles/new.machine.profile';
import type { Material } from '../../../utils/materials/interfaces/Material';
import { newMaterial } from '../../../utils/materials/new.material';
import { newProjectObject } from '../../../utils/project/new.project.object';
import { MaterialSaved } from '../../../utils/states/material.state';
import { ConnectionStatusChanged } from '../../../utils/states/grbl.connection.state';
import { JOB_RUN_KIND } from '../../../utils/states/job.run.kind.constants';
import { JobRunStarted, JobStartRequested } from '../../../utils/states/job.run.state';
import { ActiveMachineProfileSelected, MachineProfileSaved } from '../../../utils/states/machine.profile.state';
import { MachineStatusReceived } from '../../../utils/states/machine.status.state';
import type { AppDispatch, AppStore } from '../../../utils/states/new.store';
import { newStore } from '../../../utils/states/new.store';
import {
  LayerToggled,
  ProjectMaterialSelected,
  ProjectObjectsAdded,
  selectProjectDocument,
  selectProjectLayers,
} from '../../../utils/states/project.document.state';
import { selectIsJobCardCollapsed } from '../../../utils/states/app.preferences.state';
import { selectToolpathMachineArea } from '../../../utils/states/toolpath.machine.area.selector';
import { ToolpathReady, ToolpathRequested, selectToolpathDocumentVersion } from '../../../utils/states/toolpath.state';
import { selectIsAnyOverlayOpen } from '../../../utils/states/ui.overlay.state';
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

const LOCK_REASON_CONNECT = 'Not connected';
const CONNECT_ACTION_TEXT = 'Connect laser';
const LOCK_REASON_LAYER = 'No layer on';
const LOCK_REASON_ARTWORK = 'No artwork';
const FRAME_LABEL = 'Frame job';
const EXPORT_LABEL = 'Export G-code';
const START_JOB_LABEL = 'Start job';
const START_CONFIRM_OK_LABEL = 'Start and fire';
const SOON_LABEL = 'Soon';
const PRIMARY_BUTTON_CLASS = 'ant-btn-primary';
const ESTIMATE_LABEL = 'Estimate';
const ESTIMATE_PLACEHOLDER = EM_DASH;
const SIXTY_SIX_SECONDS_TEXT = '1 min 6 s';
// One burn at 6000 mm/min from rest to rest with the default 1000 mm/s2: 65.9 s cruising plus 0.1 s of ramps.
const SIXTY_SIX_SECOND_MOVE_END_X_MM = 6590;
const TWO_LAYERS_ONE_OFF = `2 layers ${MIDDLE_DOT} 1 off`;
const ONE_LAYER = '1 layer';
const NEEDS_PROFILE_TOOLTIP = 'Add a laser profile to export G-code.';
const NEEDS_LAYER_TOOLTIP = 'Switch on a layer to export G-code.';
const THREE_COLOUR_SVG_TEXT = '<svg xmlns="http://www.w3.org/2000/svg" width="30mm" height="10mm" viewBox="0 0 30 10">'
  + '<rect fill="none" stroke="#ff0000" width="10" height="10"/>'
  + '<rect fill="none" stroke="#0000ff" x="10" width="10" height="10"/>'
  + '<rect fill="none" stroke="#00a000" x="20" width="10" height="10"/></svg>';
const CREATED_AT_ISO = '2026-11-01T10:00:00.000Z';
const BURN_LINE_PATTERN = new RegExp(`^${GCODE_BURN_WORD} `, 'm');

const newMachineStatusReceived = (machineState: GrblMachineState): MachineStatusReceived => {
  const status: GrblResolvedStatus = {
    machineState,
    machineSubstate: undefined,
    machinePosition: { x: 0, y: 0, z: 0 },
    workPosition: { x: 0, y: 0, z: 0 },
    workCoordinateOffset: undefined,
    plannerBlocksAvailable: undefined,
    rxBytesAvailable: undefined,
    feedRate: 0,
    spindleSpeed: 0,
    overrides: undefined,
  };

  return new MachineStatusReceived({ status });
};

const newStartableJobStore = (): AppStore => {
  const store: AppStore = newStore(undefined, new FakeToolpathWorkerClient(true));
  const profile: MachineProfile = newMachineProfile();

  store.dispatch(new MachineProfileSaved({ profile }));
  store.dispatch(new ActiveMachineProfileSelected({ profileId: profile.id }));
  store.dispatch(new ConnectionStatusChanged({ connectionStatus: GRBL_CONNECTION_STATUS.CONNECTED }));
  store.dispatch(newMachineStatusReceived(GRBL_MACHINE_STATE.IDLE));
  store.dispatch(new ToolpathRequested());
  store.dispatch(new ToolpathReady({
    toolpath: newToolpath({ moves: [newToolpathMove()] }),
    documentVersion: selectToolpathDocumentVersion(store.getState()),
  }));

  return store;
};

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

const START_JOB_NAME = 'Start job';
const NOT_CONNECTED_REASON = 'Connect the laser to start a job.';
const CONNECT_STEP_OPEN_LABEL = 'Connect: to do';
const ACTIONS_NOT_CONNECTED_REASON = 'Connect the laser to start or frame.';
const QUIET_BUTTON_CLASS = 'quiet';
const JOB_FOLD_LABEL = 'Fold the Job card to Start';
const JOB_UNFOLD_LABEL = 'Show the whole Job card';
const READINESS_LABEL = 'Ready to cut?';

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
    expect(screen.getByText(ESTIMATE_LABEL).closest('div')).toHaveTextContent(ESTIMATE_PLACEHOLDER);
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

  it('keeps Start job off with the reason while no laser is connected, and not as the main action', async () => {
    renderJobCard(await newGcodeExportTestStore());
    const startJobButton: HTMLElement = screen.getByRole('button', { name: START_JOB_LABEL });

    expect(startJobButton).toHaveAttribute('aria-disabled', 'true');
    expect(startJobButton).not.toHaveClass(PRIMARY_BUTTON_CLASS);
    expect(startJobButton).toHaveAccessibleDescription(NOT_CONNECTED_REASON);
  });

  it('opens no start confirmation from a blocked Start job, which stays focusable', async () => {
    const store: AppStore = await newGcodeExportTestStore();
    const dispatchSpy: MockInstance<AppDispatch> = vi.spyOn(store, 'dispatch');

    renderJobCard(store);
    const startJobButton: HTMLElement = screen.getByRole('button', { name: START_JOB_LABEL });

    startJobButton.focus();
    fireEvent.click(startJobButton);

    expect(startJobButton).toHaveFocus();
    expect(screen.queryByRole('button', { name: START_CONFIRM_OK_LABEL })).not.toBeInTheDocument();
    expect(selectIsAnyOverlayOpen(store.getState())).toBe(false);
    expect(dispatchSpy).not.toHaveBeenCalledWith(expect.any(JobStartRequested));
  });

  it('starts the job only after the confirmation, which the Escape-to-STOP hotkey treats as an overlay', async () => {
    const store: AppStore = newStartableJobStore();
    const dispatchSpy: MockInstance<AppDispatch> = vi.spyOn(store, 'dispatch');

    renderJobCard(store);
    fireEvent.click(screen.getByRole('button', { name: START_JOB_LABEL }));

    expect(dispatchSpy).not.toHaveBeenCalledWith(expect.any(JobStartRequested));
    expect(selectIsAnyOverlayOpen(store.getState())).toBe(true);

    fireEvent.click(await screen.findByRole('button', { name: START_CONFIRM_OK_LABEL }));

    expect(dispatchSpy).toHaveBeenCalledWith(expect.any(JobStartRequested));
    expect(selectIsAnyOverlayOpen(store.getState())).toBe(false);
  });

  it('closes the confirmation when the start gets blocked while it is open', async () => {
    const store: AppStore = newStartableJobStore();

    renderJobCard(store);
    fireEvent.click(screen.getByRole('button', { name: START_JOB_LABEL }));
    await screen.findByRole('button', { name: START_CONFIRM_OK_LABEL });

    act(() => {
      store.dispatch(newMachineStatusReceived(GRBL_MACHINE_STATE.RUN));
    });

    expect(selectIsAnyOverlayOpen(store.getState())).toBe(false);
  });

  it('shows the run as Paused during a hold, not as Running', () => {
    const store: AppStore = newStartableJobStore();

    store.dispatch(new JobRunStarted({ startedAtMs: 0, kind: JOB_RUN_KIND.JOB }));
    renderJobCard(store);

    expect(screen.getByRole('status')).toHaveTextContent('Running');

    act(() => {
      store.dispatch(newMachineStatusReceived(GRBL_MACHINE_STATE.HOLD));
    });

    expect(screen.getByRole('status')).toHaveTextContent('Paused');
  });

  it('reads Framing during a frame, and Running during a job', () => {
    const store: AppStore = newStartableJobStore();

    store.dispatch(new JobRunStarted({ startedAtMs: 0, kind: JOB_RUN_KIND.FRAME }));
    renderJobCard(store);

    expect(screen.getByRole('status')).toHaveTextContent('Framing');

    act(() => {
      store.dispatch(newMachineStatusReceived(GRBL_MACHINE_STATE.HOLD));
    });

    expect(screen.getByRole('status')).toHaveTextContent('Framing: paused');
  });

  it('never fills Export G-code, and fills Start job only when it can run', async () => {
    renderJobCard(await newGcodeExportTestStore());

    expect(getExportButton()).not.toHaveClass(PRIMARY_BUTTON_CLASS);
    expect(screen.getByRole('button', { name: START_JOB_NAME })).toHaveAttribute('aria-disabled', 'true');
    expect(screen.getByRole('button', { name: START_JOB_NAME })).not.toHaveClass(PRIMARY_BUTTON_CLASS);
  });

  it('sums up the reason behind one icon without a tab stop while Start and Frame wait for a connection', async () => {
    renderJobCard(await newGcodeExportTestStore());

    expect(screen.queryByRole('note')).not.toBeInTheDocument();
    expect(document.querySelector('[tabindex="0"][aria-label="' + ACTIONS_NOT_CONNECTED_REASON + '"]')).toBeNull();
    expect(screen.queryByText(ACTIONS_NOT_CONNECTED_REASON)).not.toBeInTheDocument();
    expect(screen.getByText(NOT_CONNECTED_REASON).closest('button')).toHaveAccessibleDescription(NOT_CONNECTED_REASON);
    expect(screen.getByRole('button', { name: CONNECT_STEP_OPEN_LABEL })).toBeInTheDocument();
  });

  it('shows no reason icon once Start and Frame can run', () => {
    renderJobCard(newStartableJobStore());

    expect(screen.queryByRole('note', { name: ACTIONS_NOT_CONNECTED_REASON })).not.toBeInTheDocument();
  });

  it('keeps only the padlock on Start, Frame and Export in an empty project, as the to-do steps say why', async () => {
    renderJobCard(await newGcodeExportTestStore({ objects: [] }));

    expect(screen.queryByTestId(JOB_LOCK_NOTE_TEST_IDS.START)).not.toBeInTheDocument();
    expect(screen.queryByTestId(JOB_LOCK_NOTE_TEST_IDS.FRAME)).not.toBeInTheDocument();
    expect(screen.queryByTestId(JOB_LOCK_NOTE_TEST_IDS.EXPORT)).not.toBeInTheDocument();
    expect(screen.queryByText(LOCK_REASON_CONNECT)).not.toBeInTheDocument();
    expect(screen.queryByText(LOCK_REASON_ARTWORK)).not.toBeInTheDocument();
  });

  it('makes Connect the next step without a material, as Start does not need one', async () => {
    renderJobCard(await newGcodeExportTestStore());

    expect(screen.getAllByText(CONNECT_ACTION_TEXT)).toHaveLength(1);
    expect(screen.queryByTestId(JOB_LOCK_NOTE_TEST_IDS.START)).not.toBeInTheDocument();
    expect(screen.queryByTestId(JOB_LOCK_NOTE_TEST_IDS.EXPORT)).not.toBeInTheDocument();
  });

  it('says Connect laser once, on the next-step button, while Connect is the next step', () => {
    const store: AppStore = newStore(undefined, new FakeToolpathWorkerClient(true));
    const profile: MachineProfile = newMachineProfile();
    const material: Material = newMaterial();

    store.dispatch(new MachineProfileSaved({ profile }));
    store.dispatch(new ActiveMachineProfileSelected({ profileId: profile.id }));
    store.dispatch(new ProjectObjectsAdded({ objects: [newProjectObject()], layers: [] }));
    store.dispatch(new MaterialSaved({ material }));
    store.dispatch(new ProjectMaterialSelected({ materialId: material.id }));
    renderJobCard(store);

    expect(screen.getAllByText(CONNECT_ACTION_TEXT)).toHaveLength(1);
    expect(screen.queryByText(LOCK_REASON_CONNECT)).not.toBeInTheDocument();
    expect(screen.queryByTestId(JOB_LOCK_NOTE_TEST_IDS.START)).not.toBeInTheDocument();
    expect(screen.queryByTestId(JOB_LOCK_NOTE_TEST_IDS.FRAME)).not.toBeInTheDocument();
  });

  it('puts a reason no step says on its own button as a dot without a tab stop, the button describing it', async () => {
    renderJobCard(await newGcodeExportTestStore({ areLayersEnabled: false }));

    const exportNote: HTMLElement = screen.getByTestId(JOB_LOCK_NOTE_TEST_IDS.EXPORT);

    expect(exportNote).not.toHaveTextContent(LOCK_REASON_LAYER);
    expect(exportNote.querySelector('[tabindex]')).toBeNull();
    expect(getExportButton()).toHaveAccessibleDescription();
    expect(exportNote.parentElement).toContainElement(getExportButton());
    expect(exportNote.parentElement).not.toContainElement(screen.getByRole('button', { name: FRAME_LABEL }));
  });

  it('stops asking for the connection once the laser is connected', () => {
    renderJobCard(newStartableJobStore());

    expect(screen.queryByText(LOCK_REASON_CONNECT)).not.toBeInTheDocument();
  });

  it('shows Export G-code as the quiet secondary action', async () => {
    renderJobCard(await newGcodeExportTestStore());

    expect(getExportButton().className).toContain(QUIET_BUTTON_CLASS);
  });

  it('has no Soon tag any more, since Frame job works', async () => {
    renderJobCard(await newGcodeExportTestStore());

    expect(screen.queryByText(SOON_LABEL)).not.toBeInTheDocument();
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

    expect(getExportButton()).toHaveAttribute('aria-disabled', 'true');

    fireEvent.mouseEnter(getExportButton().parentElement ?? getExportButton());

    expect(await screen.findByText(NEEDS_PROFILE_TOOLTIP)).toBeInTheDocument();
  });

  // A job with every layer off cannot be exported and writes no burn move.
  it('disables export with every layer off, and the G-code of that document burns nothing', async () => {
    const store: AppStore = await newGcodeExportTestStore({ areLayersEnabled: false });
    const drawableSet: BedDrawableSet = getBedDrawables(selectProjectDocument(store.getState()));
    const gcodeText: string = getGcodeText(
      getToolpath({
        ...drawableSet,
        layers: selectProjectLayers(store.getState()),
        machineArea: selectToolpathMachineArea(store.getState()),
      }),
      getGcodeExportContext({
        profile: newMachineProfile(),
        laserSettings: {},
        projectName: 'Off layers',
        createdAtIso: CREATED_AT_ISO,
      }),
    );

    renderJobCard(store);

    expect(getExportButton()).toHaveAttribute('aria-disabled', 'true');
    fireEvent.mouseEnter(getExportButton().parentElement ?? getExportButton());
    expect(await screen.findByText(NEEDS_LAYER_TOOLTIP)).toBeInTheDocument();
    expect(drawableSet.drawables.length).toBeGreaterThan(0);
    expect(gcodeText).not.toMatch(BURN_LINE_PATTERN);
  });

  it('folds to its facts and Start, remembers the fold, and unfolds again', async () => {
    const store: AppStore = await newGcodeExportTestStore();

    renderJobCard(store);
    fireEvent.click(screen.getByRole('button', { name: JOB_FOLD_LABEL }));

    const unfoldButton: HTMLElement = screen.getByRole('button', { name: JOB_UNFOLD_LABEL });

    expect(selectIsJobCardCollapsed(store.getState())).toBe(true);
    expect(unfoldButton).toHaveAttribute('aria-expanded', 'false');
    expect(screen.getByRole('button', { name: START_JOB_LABEL })).toBeInTheDocument();
    expect(screen.getByText(ESTIMATE_LABEL)).toBeInTheDocument();
    expect(screen.queryByRole('list', { name: READINESS_LABEL })).not.toBeInTheDocument();
    expect(screen.queryByRole('button', { name: FRAME_LABEL })).not.toBeInTheDocument();

    fireEvent.click(unfoldButton);

    expect(selectIsJobCardCollapsed(store.getState())).toBe(false);
    expect(screen.getByRole('list', { name: READINESS_LABEL })).toBeInTheDocument();
  });
});
