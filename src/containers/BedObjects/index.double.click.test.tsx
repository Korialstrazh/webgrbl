import { act, fireEvent, render, screen } from '@testing-library/react';
import { Provider } from 'react-redux';
import type { MockInstance } from 'vitest';
import { BedObjects } from '.';
import { BED_PLACEHOLDER_KIND } from '../../utils/bed/bed.constants';
import type { BedDimensions } from '../../utils/bed/interfaces/BedDimensions';
import { GRBL_CONNECTION_STATUS, GRBL_MACHINE_STATE } from '../../utils/grbl/grbl.constants';
import type { GrblMachineState } from '../../utils/grbl/grbl.constants';
import type { GrblResolvedStatus } from '../../utils/grbl/interfaces/GrblResolvedStatus';
import type { ProjectObject } from '../../utils/project/interfaces/ProjectObject';
import { newProjectObject } from '../../utils/project/new.project.object';
import { DEFAULT_MACHINE_JOG_FEED_RATE } from '../../utils/profiles/machine.profile.constants';
import { BedDoubleClickMovePreferenceChanged } from '../../utils/states/app.preferences.state';
import { ConnectionStatusChanged } from '../../utils/states/grbl.connection.state';
import { JOB_RUN_KIND } from '../../utils/states/job.run.kind.constants';
import { JobRunStarted } from '../../utils/states/job.run.state';
import { MachineLineRequested, MachineStatusReceived } from '../../utils/states/machine.status.state';
import { newStore } from '../../utils/states/new.store';
import type { AppDispatch, AppStore } from '../../utils/states/new.store';
import { ProjectDocumentLoaded } from '../../utils/states/project.document.state';
import { ProjectSelectionChanged } from '../../utils/states/project.selection.state';
import type { ToolpathMachineArea } from '../../utils/toolpath/interfaces/ToolpathMachineArea';
import { selectToolpathMachineArea } from '../../utils/states/toolpath.machine.area.selector';
import { OverlayOpened } from '../../utils/states/ui.overlay.state';
import { IDENTITY_SVG_MATRIX, mockSvgScreenMatrix } from '../../utils/test.support/svg.screen.matrix.mock';
import { BED_HANDLE_SELECTOR, BED_OBJECTS_SURFACE_TEST_ID } from './bed.objects.constants';

const BED: BedDimensions = { widthMm: 400, heightMm: 300, placeholderKind: BED_PLACEHOLDER_KIND.NONE };
const OBJECT_NAME = 'Star';
// SVG y grows down from the back edge, so SVG (150, 200) is the bed point x 150, y 100.
const EMPTY_BED_X_PX = 150;
const EMPTY_BED_Y_PX = 200;
const EXPECTED_JOG_LINE = `$J=G90 G21 X150 Y100 F${DEFAULT_MACHINE_JOG_FEED_RATE}`;
const OUTSIDE_BED_X_PX = 900;
const OUTSIDE_BED_Y_PX = -500;
const OBJECT_X_PX = 15;
const OBJECT_Y_PX = 280;
// SVG (15, 280) is the bed point x 15, y 20, inside the object.
const OBJECT_JOG_LINE = `$J=G90 G21 X15 Y20 F${DEFAULT_MACHINE_JOG_FEED_RATE}`;
const OVERLAY_ID = 'test-overlay';
const STARTED_AT_MS = 1;

const IDLE_STATUS: GrblResolvedStatus = {
  machineState: GRBL_MACHINE_STATE.IDLE,
  machineSubstate: undefined,
  machinePosition: undefined,
  workPosition: undefined,
  workCoordinateOffset: undefined,
  plannerBlocksAvailable: undefined,
  rxBytesAvailable: undefined,
  feedRate: undefined,
  spindleSpeed: undefined,
  overrides: undefined,
};

const starObject: ProjectObject = newProjectObject({ name: OBJECT_NAME, xMm: 10, yMm: 10, widthMm: 20, heightMm: 20 });

const renderObjects = (): AppStore => {
  const store: AppStore = newStore();

  store.dispatch(new ProjectDocumentLoaded({ document: { objects: [starObject], layers: [] } }));
  render(
    <Provider store={store}>
      <svg>
        <BedObjects dimensions={BED} />
      </svg>
    </Provider>,
  );

  return store;
};

const setMoveReady = (store: AppStore, machineState: GrblMachineState = GRBL_MACHINE_STATE.IDLE): void => {
  act(() => {
    store.dispatch(new BedDoubleClickMovePreferenceChanged({ isBedDoubleClickMovingLaser: true }));
    store.dispatch(new ConnectionStatusChanged({ connectionStatus: GRBL_CONNECTION_STATUS.CONNECTED }));
    store.dispatch(new MachineStatusReceived({ status: { ...IDLE_STATUS, machineState } }));
  });
};

const getRequestedLines = (dispatchSpy: MockInstance<AppDispatch>): string[] => {
  const lines: string[] = [];

  for (const [action] of dispatchSpy.mock.calls) {
    if (action instanceof MachineLineRequested) {
      lines.push(action.payload.line);
    }
  }

  return lines;
};

const doubleClickEmptyBed = (clientX: number = EMPTY_BED_X_PX, clientY: number = EMPTY_BED_Y_PX): void => {
  fireEvent.doubleClick(screen.getByTestId(BED_OBJECTS_SURFACE_TEST_ID), { clientX, clientY });
};

beforeEach(() => {
  mockSvgScreenMatrix(IDENTITY_SVG_MATRIX, IDENTITY_SVG_MATRIX);
});

describe(`${BedObjects.name} double-click move`, () => {
  it('sends nothing while the preference is off', () => {
    const store: AppStore = renderObjects();

    act(() => {
      store.dispatch(new ConnectionStatusChanged({ connectionStatus: GRBL_CONNECTION_STATUS.CONNECTED }));
      store.dispatch(new MachineStatusReceived({ status: IDLE_STATUS }));
    });
    const dispatchSpy: MockInstance<AppDispatch> = vi.spyOn(store, 'dispatch');

    doubleClickEmptyBed();

    expect(getRequestedLines(dispatchSpy)).toEqual([]);
  });

  it('sends exactly one jog to the double-clicked bed point when connected and idle', () => {
    const store: AppStore = renderObjects();

    setMoveReady(store);
    const dispatchSpy: MockInstance<AppDispatch> = vi.spyOn(store, 'dispatch');

    doubleClickEmptyBed();

    expect(getRequestedLines(dispatchSpy)).toEqual([EXPECTED_JOG_LINE]);
  });

  it('holds a point past the bed edge inside the work area', () => {
    const store: AppStore = renderObjects();

    setMoveReady(store);
    const dispatchSpy: MockInstance<AppDispatch> = vi.spyOn(store, 'dispatch');

    doubleClickEmptyBed(OUTSIDE_BED_X_PX, OUTSIDE_BED_Y_PX);

    const { workAreaXMm, workAreaYMm }: ToolpathMachineArea = selectToolpathMachineArea(store.getState());

    expect(getRequestedLines(dispatchSpy)).toEqual([
      `$J=G90 G21 X${workAreaXMm} Y${workAreaYMm} F${DEFAULT_MACHINE_JOG_FEED_RATE}`,
    ]);
  });

  it('sends nothing when disconnected', () => {
    const store: AppStore = renderObjects();

    setMoveReady(store);
    act(() => {
      store.dispatch(new ConnectionStatusChanged({ connectionStatus: GRBL_CONNECTION_STATUS.DISCONNECTED }));
    });
    const dispatchSpy: MockInstance<AppDispatch> = vi.spyOn(store, 'dispatch');

    doubleClickEmptyBed();

    expect(getRequestedLines(dispatchSpy)).toEqual([]);
  });

  it.each([JOB_RUN_KIND.JOB, JOB_RUN_KIND.FRAME])('sends nothing while a %s runs', (kind) => {
    const store: AppStore = renderObjects();

    setMoveReady(store);
    act(() => {
      store.dispatch(new JobRunStarted({ startedAtMs: STARTED_AT_MS, kind }));
    });
    const dispatchSpy: MockInstance<AppDispatch> = vi.spyOn(store, 'dispatch');

    doubleClickEmptyBed();

    expect(getRequestedLines(dispatchSpy)).toEqual([]);
  });

  it('sends nothing in alarm', () => {
    const store: AppStore = renderObjects();

    setMoveReady(store, GRBL_MACHINE_STATE.ALARM);
    const dispatchSpy: MockInstance<AppDispatch> = vi.spyOn(store, 'dispatch');

    doubleClickEmptyBed();

    expect(getRequestedLines(dispatchSpy)).toEqual([]);
  });

  it('sends nothing while an overlay is open', () => {
    const store: AppStore = renderObjects();

    setMoveReady(store);
    act(() => {
      store.dispatch(new OverlayOpened({ overlayId: OVERLAY_ID }));
    });
    const dispatchSpy: MockInstance<AppDispatch> = vi.spyOn(store, 'dispatch');

    doubleClickEmptyBed();

    expect(getRequestedLines(dispatchSpy)).toEqual([]);
  });

  it('moves the laser to the double-clicked point of an object, as on the empty bed', () => {
    const store: AppStore = renderObjects();

    setMoveReady(store);
    const dispatchSpy: MockInstance<AppDispatch> = vi.spyOn(store, 'dispatch');

    fireEvent.doubleClick(screen.getByRole('img', { name: OBJECT_NAME }), {
      clientX: OBJECT_X_PX,
      clientY: OBJECT_Y_PX,
    });

    expect(getRequestedLines(dispatchSpy)).toEqual([OBJECT_JOG_LINE]);
  });

  it('keeps the guards for a double-click on an object', () => {
    const store: AppStore = renderObjects();

    setMoveReady(store, GRBL_MACHINE_STATE.ALARM);
    const dispatchSpy: MockInstance<AppDispatch> = vi.spyOn(store, 'dispatch');

    fireEvent.doubleClick(screen.getByRole('img', { name: OBJECT_NAME }), {
      clientX: OBJECT_X_PX,
      clientY: OBJECT_Y_PX,
    });

    expect(getRequestedLines(dispatchSpy)).toEqual([]);
  });

  it('never moves the laser for a double-click on a resize handle', () => {
    const store: AppStore = renderObjects();

    setMoveReady(store);
    act(() => {
      store.dispatch(new ProjectSelectionChanged({ objectIds: [starObject.id] }));
    });
    const dispatchSpy: MockInstance<AppDispatch> = vi.spyOn(store, 'dispatch');
    const handle: Element = document.querySelector(BED_HANDLE_SELECTOR) as Element;

    fireEvent.doubleClick(handle, { clientX: OBJECT_X_PX, clientY: OBJECT_Y_PX });

    expect(getRequestedLines(dispatchSpy)).toEqual([]);
  });
});
