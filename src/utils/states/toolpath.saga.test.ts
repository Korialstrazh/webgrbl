import { afterEach, describe, expect, it, vi } from 'vitest';
import * as downloadModule from '../browser/download.text.file';
import { getLayerKey } from '../layers/get.layer.key';
import type { ProjectLayer } from '../layers/interfaces/ProjectLayer';
import { GRBL_CONNECTION_STATUS, GRBL_SETTING_X_MAX_TRAVEL, GRBL_SETTING_Y_MAX_TRAVEL } from '../grbl/grbl.constants';
import type { GrblConnectionInfo } from '../grbl/interfaces/GrblConnectionInfo';
import { DEFAULT } from '../localization/default.locales';
import type { MachineProfile } from '../profiles/interfaces/MachineProfile';
import { MACHINE_ORIGIN_CORNER } from '../profiles/machine.profile.constants';
import { newMachineProfile } from '../profiles/new.machine.profile';
import type { ProjectObject } from '../project/interfaces/ProjectObject';
import { newProjectObject } from '../project/new.project.object';
import * as expandedDocumentModule from '../svg/geometry/get.svg.expanded.document';
import { SVG_UNSUPPORTED_KIND } from '../svg/geometry/svg.shape.constants';
import { newGcodeExportTestStore } from '../test.support/new.gcode.export.test.store';
import { useStorageSafeFakeTimers } from '../test.support/use.storage.safe.fake.timers';
import { BrowserToolpathWorkerClient } from '../toolpath/browser.toolpath.worker.client';
import { GCODE_LASER_MODE_ON, GCODE_MIME_TYPE } from '../toolpath/gcode.constants';
import { getBedDrawables } from '../toolpath/get.bed.drawables';
import { getToolpath } from '../toolpath/get.toolpath';
import type { BedDrawableSet } from '../toolpath/interfaces/BedDrawableSet';
import type { ObjectWarning } from '../toolpath/interfaces/ObjectWarning';
import { AnsweringToolpathWorker } from '../toolpath/test.support/answering.toolpath.worker';
import { FakeToolpathWorkerClient } from '../toolpath/test.support/fake.toolpath.worker.client';
import { ConnectionEstablished, ConnectionStatusChanged } from './grbl.connection.state';
import type { AppToast } from './interfaces/AppToast';
import { LIVE_STORE_TASK_REGISTRY } from './live.store.tasks';
import { ActiveMachineProfileSelected, MachineProfileSaved, selectActiveMachineProfile } from './machine.profile.state';
import type { AppStore } from './new.store';
import {
  LayerToggled,
  ProjectDocumentLoaded,
  ProjectObjectsTransformed,
  selectProjectDocument,
  selectProjectLayers,
  selectProjectObjects,
} from './project.document.state';
import { ProjectOpened } from './project.state';
import { selectToasts } from './toast.state';
import { selectToolpathMachineArea } from './toolpath.machine.area.selector';
import { watchToolpath } from './toolpath.saga';
import { TOOLPATH_RESTART_DEBOUNCE_MS } from './toolpath.saga.constants';
import {
  GcodeExportRequested,
  SampleGcodeExportRequested,
  ToolpathCancelled,
  ToolpathRequested,
  selectIsGcodeExportConfirmationOpen,
  selectToolpath,
  selectToolpathProgress,
  selectToolpathStatus,
} from './toolpath.state';
import { TOOLPATH_STATUS } from './toolpath.status.constants';

const PROFILE_S_VALUE_MAX = 255;
const PROFILE_HEADER_TEXT = `S max ${PROFILE_S_VALUE_MAX}`;
const GCODE_FILE_NAME = 'Coaster set.gcode';
const TEXT_SVG_TEXT = '<svg xmlns="http://www.w3.org/2000/svg" width="10mm" height="10mm" viewBox="0 0 10 10">'
  + '<rect fill="none" stroke="#ff0000" width="10" height="10"/><text x="1" y="5">Hi</text></svg>';
const FIRST_GENERATION = 0;
const SECOND_GENERATION = 1;
const FULL_PROGRESS = 1;
const GENERATION_ERROR = new Error('worker crashed');
const OTHER_PROJECT_ID = 'other-project';
const OTHER_PROJECT_NAME = 'Other project';
const NUDGE_COUNT = 3;
const OFF_LAYER_OBJECT_X_MM = 200;
const BLUE_LAYER_KEY = '#0000ff';
const RED_SQUARE_SVG_TEXT = '<svg xmlns="http://www.w3.org/2000/svg" width="10mm" height="10mm" viewBox="0 0 10 10">'
  + '<rect fill="none" stroke="#ff0000" width="10" height="10"/></svg>';
const RENAMED_PROFILE_NAME = 'Renamed laser';
const NUDGE_STEP_MM = 1;
const REPORTED_X_TRAVEL_MM = 250;
const REPORTED_Y_TRAVEL_MM = 180;
const REPORTED_CONNECTION_INFO: GrblConnectionInfo = {
  identity: { firmwareName: 'Grbl', version: '1.1h', vendorText: '' },
  rxBufferSize: 127,
  settings: {
    [GRBL_SETTING_X_MAX_TRAVEL]: String(REPORTED_X_TRAVEL_MM),
    [GRBL_SETTING_Y_MAX_TRAVEL]: String(REPORTED_Y_TRAVEL_MM),
  },
  buildInfoLines: [],
};
const NARROW_WORK_AREA_MM = 100;
const WIDE_WORK_AREA_MM = 400;
const WIDE_AREA_OBJECT_X_MM = 200;
const SECOND_SQUARE_SVG_TEXT = '<svg xmlns="http://www.w3.org/2000/svg" width="10mm" height="10mm" viewBox="0 0 10 10">'
  + '<rect fill="none" stroke="#0000ff" width="10" height="10"/></svg>';

const getFirstObject = (store: AppStore): ProjectObject => {
  const [firstObject] = selectProjectObjects(store.getState());

  if (!firstObject) {
    throw new Error('The test project has no object');
  }

  return firstObject;
};

const nudgeFirstObject = (store: AppStore, stepIndex: number): void => {
  const firstObject: ProjectObject = getFirstObject(store);

  store.dispatch(new ProjectObjectsTransformed({
    transforms: { [firstObject.id]: { ...firstObject, xMm: firstObject.xMm + NUDGE_STEP_MM * (stepIndex + 1) } },
  }));
};

const getActiveProfile = (store: AppStore): MachineProfile => {
  const activeProfile: MachineProfile | undefined = selectActiveMachineProfile(store.getState());

  if (!activeProfile) {
    throw new Error('The test store has no active profile');
  }

  return activeProfile;
};

const getFirstLayer = (store: AppStore): ProjectLayer => {
  const [firstLayer] = selectProjectLayers(store.getState());

  if (!firstLayer) {
    throw new Error('The test project has no layer');
  }

  return firstLayer;
};

const waitForToolpathStatus = async (store: AppStore, status: string): Promise<void> => {
  await vi.waitFor((): void => {
    expect(selectToolpathStatus(store.getState())).toBe(status);
  });
};

const spyOnDownload = () => vi.spyOn(downloadModule, 'downloadTextFile').mockImplementation(() => undefined);

const getDownloadedText = (downloadSpy: ReturnType<typeof spyOnDownload>): string =>
  downloadSpy.mock.calls[0]?.[0].text ?? '';

const flushSagas = async (): Promise<void> => {
  await new Promise((resolve: (value: unknown) => void) => {
    setTimeout(resolve);
  });
};

describe(watchToolpath.name, () => {
  afterEach(() => {
    vi.restoreAllMocks();
    vi.unstubAllGlobals();
  });

  it('sets generating on a request, then ready with the toolpath of the document', async () => {
    const toolpathWorkerClient: FakeToolpathWorkerClient = new FakeToolpathWorkerClient(true);
    const store: AppStore = await newGcodeExportTestStore({ toolpathWorkerClient });

    store.dispatch(new ToolpathRequested());

    expect(selectToolpathStatus(store.getState())).toBe(TOOLPATH_STATUS.GENERATING);

    toolpathWorkerClient.resolveHeldGeneration(FIRST_GENERATION);
    await waitForToolpathStatus(store, TOOLPATH_STATUS.READY);

    const drawableSet: BedDrawableSet = getBedDrawables(selectProjectDocument(store.getState()));

    expect(selectToolpath(store.getState())).toEqual(
      getToolpath({
        ...drawableSet,
        layers: selectProjectLayers(store.getState()),
        machineArea: selectToolpathMachineArea(store.getState()),
      }),
    );
    expect(selectToolpathProgress(store.getState())).toBe(FULL_PROGRESS);
  });

  it('hands the worker plain drawables and layers read on the main thread, not the document', async () => {
    const toolpathWorkerClient: FakeToolpathWorkerClient = new FakeToolpathWorkerClient();
    const store: AppStore = await newGcodeExportTestStore({ toolpathWorkerClient });

    store.dispatch(new ToolpathRequested());
    await waitForToolpathStatus(store, TOOLPATH_STATUS.READY);

    expect(toolpathWorkerClient.generationInputs).toEqual([{
      ...getBedDrawables(selectProjectDocument(store.getState())),
      layers: selectProjectLayers(store.getState()),
      machineArea: selectToolpathMachineArea(store.getState()),
    }]);
  });

  it('marks a ready toolpath stale when the active profile moves the origin corner', async () => {
    const store: AppStore = await newGcodeExportTestStore();
    const profile: MachineProfile = getActiveProfile(store);

    store.dispatch(new ToolpathRequested());
    await waitForToolpathStatus(store, TOOLPATH_STATUS.READY);
    const movedOriginProfile: MachineProfile = { ...profile, originCorner: MACHINE_ORIGIN_CORNER.BACK_RIGHT };

    store.dispatch(new MachineProfileSaved({ profile: movedOriginProfile }));

    expect(selectToolpathStatus(store.getState())).toBe(TOOLPATH_STATUS.STALE);
  });

  it('keeps a ready toolpath current when a profile save leaves the work area and origin alone', async () => {
    const store: AppStore = await newGcodeExportTestStore();
    const profile: MachineProfile = getActiveProfile(store);

    store.dispatch(new ToolpathRequested());
    await waitForToolpathStatus(store, TOOLPATH_STATUS.READY);
    store.dispatch(new MachineProfileSaved({ profile: { ...profile, name: RENAMED_PROFILE_NAME } }));

    expect(selectToolpathStatus(store.getState())).toBe(TOOLPATH_STATUS.READY);
  });

  it('marks a ready toolpath stale when the document changes', async () => {
    const store: AppStore = await newGcodeExportTestStore();

    store.dispatch(new ToolpathRequested());
    await waitForToolpathStatus(store, TOOLPATH_STATUS.READY);
    store.dispatch(new LayerToggled({ layerKey: getLayerKey(getFirstLayer(store)), enabled: false }));

    expect(selectToolpathStatus(store.getState())).toBe(TOOLPATH_STATUS.STALE);
  });

  it('regenerates an out-of-date toolpath in the background once the document is quiet', async () => {
    const toolpathWorkerClient: FakeToolpathWorkerClient = new FakeToolpathWorkerClient();
    const store: AppStore = await newGcodeExportTestStore({ toolpathWorkerClient });

    await waitForToolpathStatus(store, TOOLPATH_STATUS.READY);
    const generationCountBeforeEdit: number = toolpathWorkerClient.generationInputs.length;

    nudgeFirstObject(store, 0);

    expect(selectToolpathStatus(store.getState())).toBe(TOOLPATH_STATUS.STALE);

    await waitForToolpathStatus(store, TOOLPATH_STATUS.READY);

    expect(toolpathWorkerClient.generationInputs).toHaveLength(generationCountBeforeEdit + 1);
  });

  it('generates nothing in the background while no layer is switched on', async () => {
    useStorageSafeFakeTimers();
    const toolpathWorkerClient: FakeToolpathWorkerClient = new FakeToolpathWorkerClient();
    const store: AppStore = await newGcodeExportTestStore({ toolpathWorkerClient, areLayersEnabled: false });

    nudgeFirstObject(store, 0);
    await vi.advanceTimersByTimeAsync(TOOLPATH_RESTART_DEBOUNCE_MS);
    vi.useRealTimers();

    expect(toolpathWorkerClient.generationInputs).toHaveLength(0);
    expect(selectToolpathStatus(store.getState())).toBe(TOOLPATH_STATUS.IDLE);
  });

  it('cancels the running generation when a second request comes in', async () => {
    const toolpathWorkerClient: FakeToolpathWorkerClient = new FakeToolpathWorkerClient(true);
    const store: AppStore = await newGcodeExportTestStore({ toolpathWorkerClient });

    store.dispatch(new ToolpathRequested());
    store.dispatch(new ToolpathRequested());

    expect(toolpathWorkerClient.generationInputs).toHaveLength(2);
    expect(toolpathWorkerClient.cancelledGenerationCount).toBe(1);

    toolpathWorkerClient.resolveHeldGeneration(SECOND_GENERATION);
    await waitForToolpathStatus(store, TOOLPATH_STATUS.READY);
  });

  it('restarts a running generation when the document changes, so the result is never out of date', async () => {
    const toolpathWorkerClient: FakeToolpathWorkerClient = new FakeToolpathWorkerClient(true);
    const store: AppStore = await newGcodeExportTestStore({ toolpathWorkerClient });

    store.dispatch(new ToolpathRequested());
    store.dispatch(new LayerToggled({ layerKey: getLayerKey(getFirstLayer(store)), enabled: false }));
    await vi.waitFor((): void => {
      expect(toolpathWorkerClient.generationInputs).toHaveLength(2);
    });

    expect(toolpathWorkerClient.cancelledGenerationCount).toBe(1);
    expect(toolpathWorkerClient.generationInputs[SECOND_GENERATION]?.layers).toEqual(
      selectProjectLayers(store.getState()),
    );
    expect(selectToolpathStatus(store.getState())).toBe(TOOLPATH_STATUS.GENERATING);
  });

  it('stops the generation on cancel', async () => {
    const toolpathWorkerClient: FakeToolpathWorkerClient = new FakeToolpathWorkerClient(true);
    const store: AppStore = await newGcodeExportTestStore({ toolpathWorkerClient });

    store.dispatch(new ToolpathRequested());
    store.dispatch(new ToolpathCancelled());

    expect(toolpathWorkerClient.cancelledGenerationCount).toBe(1);
    expect(selectToolpathStatus(store.getState())).toBe(TOOLPATH_STATUS.IDLE);
  });

  it('sets failed when the worker fails', async () => {
    vi.spyOn(console, 'error').mockImplementation(() => undefined);
    const toolpathWorkerClient: FakeToolpathWorkerClient = new FakeToolpathWorkerClient(true);
    const store: AppStore = await newGcodeExportTestStore({ toolpathWorkerClient });

    store.dispatch(new ToolpathRequested());
    toolpathWorkerClient.rejectHeldGeneration(FIRST_GENERATION, GENERATION_ERROR);

    await waitForToolpathStatus(store, TOOLPATH_STATUS.FAILED);
  });

  it('writes no burn move from the geometry of a switched-off layer into the downloaded G-code', async () => {
    const downloadSpy = spyOnDownload();
    const store: AppStore = await newGcodeExportTestStore({
      objects: [
        newProjectObject({ svgText: RED_SQUARE_SVG_TEXT, xMm: 0, yMm: 0 }),
        newProjectObject({ svgText: SECOND_SQUARE_SVG_TEXT, xMm: OFF_LAYER_OBJECT_X_MM, yMm: 0 }),
      ],
    });

    store.dispatch(new LayerToggled({ layerKey: BLUE_LAYER_KEY, enabled: false }));
    store.dispatch(new GcodeExportRequested({ isWarningConfirmed: false }));
    await vi.waitFor((): void => {
      expect(downloadSpy).toHaveBeenCalledTimes(1);
    });

    const burnXs: number[] = Array.from(
      getDownloadedText(downloadSpy).matchAll(/^G1 X(-?[\d.]+)/gm),
      (match: RegExpMatchArray): number => Number(match[1]),
    );

    expect(burnXs.length).toBeGreaterThan(0);
    expect(Math.max(...burnXs)).toBeLessThan(OFF_LAYER_OBJECT_X_MM);
  });

  it('generates when needed and downloads Coaster set.gcode with M4 S0 and the profile S max', async () => {
    const downloadSpy = spyOnDownload();
    const store: AppStore = await newGcodeExportTestStore({
      activeProfile: newMachineProfile({ sValueMax: PROFILE_S_VALUE_MAX }),
    });

    store.dispatch(new GcodeExportRequested({ isWarningConfirmed: false }));

    await vi.waitFor((): void => {
      expect(downloadSpy).toHaveBeenCalledTimes(1);
    });
    expect(downloadSpy.mock.calls[0]?.[0]).toMatchObject({ fileName: GCODE_FILE_NAME, mimeType: GCODE_MIME_TYPE });
    expect(getDownloadedText(downloadSpy)).toContain(GCODE_LASER_MODE_ON);
    expect(getDownloadedText(downloadSpy)).toContain(PROFILE_HEADER_TEXT);
  });

  it('asks for confirmation before exporting a toolpath with a text warning, and downloads nothing', async () => {
    const downloadSpy = spyOnDownload();
    const store: AppStore = await newGcodeExportTestStore({
      objects: [newProjectObject({ svgText: TEXT_SVG_TEXT })],
    });

    store.dispatch(new GcodeExportRequested({ isWarningConfirmed: false }));

    await vi.waitFor((): void => {
      expect(selectIsGcodeExportConfirmationOpen(store.getState())).toBe(true);
    });
    expect(selectToolpath(store.getState())?.warnings.map((warning: ObjectWarning) => warning.kind))
      .toEqual([SVG_UNSUPPORTED_KIND.TEXT]);
    expect(downloadSpy).not.toHaveBeenCalled();
  });

  it('downloads a toolpath with warnings once the warnings are confirmed', async () => {
    const downloadSpy = spyOnDownload();
    const store: AppStore = await newGcodeExportTestStore({
      objects: [newProjectObject({ svgText: TEXT_SVG_TEXT })],
    });

    store.dispatch(new GcodeExportRequested({ isWarningConfirmed: true }));

    await vi.waitFor((): void => {
      expect(downloadSpy).toHaveBeenCalledTimes(1);
    });
    expect(selectIsGcodeExportConfirmationOpen(store.getState())).toBe(false);
  });

  it('neither generates nor downloads when there is no active machine profile', async () => {
    const downloadSpy = spyOnDownload();
    const store: AppStore = await newGcodeExportTestStore({ activeProfile: undefined });

    store.dispatch(new GcodeExportRequested({ isWarningConfirmed: false }));
    await flushSagas();

    expect(selectToolpathStatus(store.getState())).toBe(TOOLPATH_STATUS.IDLE);
    expect(downloadSpy).not.toHaveBeenCalled();
  });

  it('reuses the parsed drawables of unchanged objects, so a layer change parses no SVG again', async () => {
    const store: AppStore = await newGcodeExportTestStore();

    store.dispatch(new ToolpathRequested());
    await waitForToolpathStatus(store, TOOLPATH_STATUS.READY);

    const parseSpy = vi.spyOn(expandedDocumentModule, 'getSvgExpandedDocument');

    store.dispatch(new LayerToggled({ layerKey: getLayerKey(getFirstLayer(store)), enabled: false }));
    store.dispatch(new ToolpathRequested());
    await waitForToolpathStatus(store, TOOLPATH_STATUS.READY);

    expect(parseSpy).not.toHaveBeenCalled();
  });

  it('parses no SVG again after a nudge', async () => {
    const store: AppStore = await newGcodeExportTestStore({
      objects: [
        newProjectObject({ svgText: TEXT_SVG_TEXT }),
        newProjectObject({ svgText: SECOND_SQUARE_SVG_TEXT }),
      ],
    });

    store.dispatch(new ToolpathRequested());
    await waitForToolpathStatus(store, TOOLPATH_STATUS.READY);

    const parseSpy = vi.spyOn(expandedDocumentModule, 'getSvgExpandedDocument');

    nudgeFirstObject(store, 0);
    store.dispatch(new ToolpathRequested());
    await waitForToolpathStatus(store, TOOLPATH_STATUS.READY);

    expect(parseSpy).toHaveBeenCalledTimes(0);
  });

  it('restarts a running generation once for several nudges within the debounce time', async () => {
    useStorageSafeFakeTimers();
    const toolpathWorkerClient: FakeToolpathWorkerClient = new FakeToolpathWorkerClient(true);
    const store: AppStore = await newGcodeExportTestStore({ toolpathWorkerClient });

    store.dispatch(new ToolpathRequested());

    for (let nudgeIndex = 0; nudgeIndex < NUDGE_COUNT; nudgeIndex++) {
      nudgeFirstObject(store, nudgeIndex);
    }

    await vi.advanceTimersByTimeAsync(TOOLPATH_RESTART_DEBOUNCE_MS);
    vi.useRealTimers();

    expect(toolpathWorkerClient.generationInputs).toHaveLength(2);
  });

  it('terminates the idle worker when the store stops', async () => {
    AnsweringToolpathWorker.createdWorkers.length = 0;
    vi.stubGlobal('Worker', AnsweringToolpathWorker);
    const store: AppStore = await newGcodeExportTestStore({ toolpathWorkerClient: new BrowserToolpathWorkerClient() });

    store.dispatch(new ToolpathRequested());
    await waitForToolpathStatus(store, TOOLPATH_STATUS.READY);
    LIVE_STORE_TASK_REGISTRY.cancelLiveStoreTasks();

    expect(
      AnsweringToolpathWorker.createdWorkers.map((worker: AnsweringToolpathWorker) => worker.isTerminated),
    ).toEqual([true]);
  });

  it('drops a pending export when another project opens, and says so', async () => {
    const downloadSpy = spyOnDownload();
    const toolpathWorkerClient: FakeToolpathWorkerClient = new FakeToolpathWorkerClient(true);
    const store: AppStore = await newGcodeExportTestStore({ toolpathWorkerClient });

    store.dispatch(new GcodeExportRequested({ isWarningConfirmed: false }));
    store.dispatch(new ProjectDocumentLoaded({ document: { objects: [], layers: [] } }));
    store.dispatch(new ProjectOpened({ projectId: OTHER_PROJECT_ID, name: OTHER_PROJECT_NAME }));
    toolpathWorkerClient.resolveHeldGeneration(FIRST_GENERATION);
    await vi.waitFor((): void => {
      expect(toolpathWorkerClient.generationInputs).toHaveLength(2);
    });
    toolpathWorkerClient.resolveHeldGeneration(SECOND_GENERATION);
    await flushSagas();

    expect(downloadSpy).not.toHaveBeenCalled();
    expect(selectToasts(store.getState()).map((toast: AppToast) => toast.messageKey))
      .toContain(DEFAULT.TOAST_GCODE_EXPORT_DROPPED);
  });

  it('keeps the G-code of a waiting export inside the work area after a profile switch', async () => {
    const downloadSpy = spyOnDownload();
    const toolpathWorkerClient: FakeToolpathWorkerClient = new FakeToolpathWorkerClient(true);
    const narrowProfile: MachineProfile = newMachineProfile({
      workAreaXMm: NARROW_WORK_AREA_MM,
      workAreaYMm: NARROW_WORK_AREA_MM,
      originCorner: MACHINE_ORIGIN_CORNER.FRONT_RIGHT,
    });
    const wideProfile: MachineProfile = newMachineProfile({
      workAreaXMm: WIDE_WORK_AREA_MM,
      workAreaYMm: WIDE_WORK_AREA_MM,
      originCorner: MACHINE_ORIGIN_CORNER.FRONT_RIGHT,
    });
    const store: AppStore = await newGcodeExportTestStore({
      toolpathWorkerClient,
      activeProfile: narrowProfile,
      objects: [newProjectObject({ svgText: RED_SQUARE_SVG_TEXT, xMm: WIDE_AREA_OBJECT_X_MM, yMm: 0 })],
    });

    store.dispatch(new GcodeExportRequested({ isWarningConfirmed: false }));
    store.dispatch(new MachineProfileSaved({ profile: wideProfile }));
    store.dispatch(new ActiveMachineProfileSelected({ profileId: wideProfile.id }));
    await vi.waitFor((): void => {
      expect(toolpathWorkerClient.generationInputs.at(-1)?.machineArea.workAreaXMm).toBe(WIDE_WORK_AREA_MM);
    });
    toolpathWorkerClient.resolveHeldGeneration(toolpathWorkerClient.generationInputs.length - 1);
    await vi.waitFor((): void => {
      expect(downloadSpy).toHaveBeenCalledTimes(1);
    });

    const gcodeXs: number[] = Array.from(
      getDownloadedText(downloadSpy).matchAll(/^G[01] X(-?[\d.]+)/gm),
      (match: RegExpMatchArray): number => Number(match[1]),
    );

    expect(gcodeXs.length).toBeGreaterThan(0);
    expect(Math.min(...gcodeXs)).toBeGreaterThanOrEqual(0);
    expect(Math.max(...gcodeXs)).toBeLessThanOrEqual(WIDE_WORK_AREA_MM);
  });

  it('marks a ready toolpath stale when a connect or disconnect changes the work area without a profile', async () => {
    const store: AppStore = await newGcodeExportTestStore({ activeProfile: undefined });

    // A stored but inactive profile keeps the connect from creating and selecting one.
    store.dispatch(new MachineProfileSaved({ profile: newMachineProfile() }));
    store.dispatch(new ConnectionEstablished({ connectionInfo: REPORTED_CONNECTION_INFO }));
    store.dispatch(new ToolpathRequested());
    await waitForToolpathStatus(store, TOOLPATH_STATUS.READY);
    store.dispatch(new ConnectionStatusChanged({ connectionStatus: GRBL_CONNECTION_STATUS.CONNECTED }));

    expect(selectToolpathMachineArea(store.getState()).workAreaXMm).toBe(REPORTED_X_TRAVEL_MM);
    expect(selectToolpathStatus(store.getState())).toBe(TOOLPATH_STATUS.STALE);

    store.dispatch(new ToolpathRequested());
    await waitForToolpathStatus(store, TOOLPATH_STATUS.READY);
    store.dispatch(new ConnectionStatusChanged({ connectionStatus: GRBL_CONNECTION_STATUS.DISCONNECTED }));

    expect(selectToolpathStatus(store.getState())).toBe(TOOLPATH_STATUS.STALE);
  });
});

describe('sample G-code export', () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  const SAMPLE_JOB_NAME = 'Plywood sample';
  const SAMPLE_CUT_SETTINGS = { powerPercent: 80, speedMmPerMin: 600, passes: 1 };

  it('downloads <job name>.gcode with M4 S0 and no S above sMax, leaving the project alone', async () => {
    const downloadSpy = spyOnDownload();
    const store: AppStore = await newGcodeExportTestStore({
      activeProfile: newMachineProfile({ sValueMax: PROFILE_S_VALUE_MAX }),
    });
    const documentBefore = selectProjectDocument(store.getState());
    const toolpathStateBefore = selectToolpathStatus(store.getState());

    store.dispatch(new SampleGcodeExportRequested({ cutSettings: SAMPLE_CUT_SETTINGS, jobName: SAMPLE_JOB_NAME }));

    await vi.waitFor((): void => {
      expect(downloadSpy).toHaveBeenCalledTimes(1);
    });

    const sValues: number[] = [...getDownloadedText(downloadSpy).matchAll(/S(\d+)/g)].map(
      (match: RegExpMatchArray): number => Number(match[1]),
    );

    expect(downloadSpy.mock.calls[0]?.[0]).toMatchObject({ fileName: `${SAMPLE_JOB_NAME}.gcode` });
    expect(getDownloadedText(downloadSpy)).toContain(GCODE_LASER_MODE_ON);
    expect(Math.max(...sValues)).toBeLessThanOrEqual(PROFILE_S_VALUE_MAX);
    expect(selectProjectDocument(store.getState())).toBe(documentBefore);
    expect(selectToolpathStatus(store.getState())).toBe(toolpathStateBefore);
    expect(selectToolpath(store.getState())).toBeUndefined();
  });

  it('downloads nothing with no active machine profile', async () => {
    const downloadSpy = spyOnDownload();
    const store: AppStore = await newGcodeExportTestStore({ activeProfile: undefined });

    store.dispatch(new SampleGcodeExportRequested({ cutSettings: SAMPLE_CUT_SETTINGS, jobName: SAMPLE_JOB_NAME }));
    await flushSagas();

    expect(downloadSpy).not.toHaveBeenCalled();
  });
});
