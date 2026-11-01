import { afterEach, describe, expect, it, vi } from 'vitest';
import * as downloadModule from '../browser/download.text.file';
import { getLayerKey } from '../layers/get.layer.key';
import type { ProjectLayer } from '../layers/interfaces/ProjectLayer';
import { newMachineProfile } from '../profiles/new.machine.profile';
import { newProjectObject } from '../project/new.project.object';
import { SVG_UNSUPPORTED_KIND } from '../svg/geometry/svg.shape.constants';
import { newGcodeExportTestStore } from '../test.support/new.gcode.export.test.store';
import { getBedDrawables } from '../toolpath/get.bed.drawables';
import { getToolpath } from '../toolpath/get.toolpath';
import { GCODE_LASER_MODE_ON, GCODE_MIME_TYPE } from '../toolpath/gcode.constants';
import type { BedDrawableSet } from '../toolpath/interfaces/BedDrawableSet';
import { FakeToolpathWorkerClient } from '../toolpath/test.support/fake.toolpath.worker.client';
import type { AppStore } from './new.store';
import { LayerToggled, selectProjectDocument, selectProjectLayers } from './project.document.state';
import { watchToolpath } from './toolpath.saga';
import {
  GcodeExportRequested,
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
  await new Promise((resolve) => {
    setTimeout(resolve);
  });
};

describe(watchToolpath.name, () => {
  afterEach(() => {
    vi.restoreAllMocks();
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
      getToolpath(drawableSet.drawables, drawableSet.warnings, selectProjectLayers(store.getState())),
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
    }]);
  });

  it('marks a ready toolpath stale when the document changes', async () => {
    const store: AppStore = await newGcodeExportTestStore();

    store.dispatch(new ToolpathRequested());
    await waitForToolpathStatus(store, TOOLPATH_STATUS.READY);
    store.dispatch(new LayerToggled({ layerKey: getLayerKey(getFirstLayer(store)), enabled: false }));

    expect(selectToolpathStatus(store.getState())).toBe(TOOLPATH_STATUS.STALE);
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
    expect(selectToolpath(store.getState())?.warnings.map((warning) => warning.kind))
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
});
