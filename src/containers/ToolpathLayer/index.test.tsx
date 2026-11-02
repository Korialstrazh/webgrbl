import { act, render, screen } from '@testing-library/react';
import { Provider } from 'react-redux';
import { ToolpathLayer } from '.';
import type { BedDimensions } from '../../utils/bed/interfaces/BedDimensions';
import { BED_PLACEHOLDER_KIND } from '../../utils/bed/bed.constants';
import type { MachineProfile } from '../../utils/profiles/interfaces/MachineProfile';
import { MACHINE_ORIGIN_CORNER, MACHINE_PROFILES_DOCUMENT_VERSION } from '../../utils/profiles/machine.profile.constants';
import { newMachineProfile } from '../../utils/profiles/new.machine.profile';
import { newProjectObject } from '../../utils/project/new.project.object';
import { GRBL_SETTING_X_MAX_RATE, GRBL_SETTING_Y_MAX_RATE } from '../../utils/grbl/grbl.constants';
import { ConnectionEstablished } from '../../utils/states/grbl.connection.state';
import { MachineProfilesLoaded } from '../../utils/states/machine.profile.state';
import { newStore } from '../../utils/states/new.store';
import type { AppStore } from '../../utils/states/new.store';
import { ProjectDocumentLoaded } from '../../utils/states/project.document.state';
import { SimulationTimeSet } from '../../utils/states/simulation.state';
import { selectToolpathMotionTimeline } from '../../utils/states/toolpath.timeline.selectors';
import { ToolpathReady, ToolpathRequested, selectToolpathDocumentVersion } from '../../utils/states/toolpath.state';
import type { Toolpath } from '../../utils/toolpath/interfaces/Toolpath';
import { newToolpath } from '../../utils/toolpath/test.support/new.toolpath';
import { newToolpathMove } from '../../utils/toolpath/test.support/new.toolpath.move';
import { TOOLPATH_MOVE_KIND } from '../../utils/toolpath/toolpath.constants';
import { TOOLPATH_BURN_STATE, TOOLPATH_DISPLAY_MODE } from '../../utils/toolpath/toolpath.drawing.constants';
import type { ToolpathDisplayMode } from '../../utils/toolpath/toolpath.drawing.constants';
import { FakeToolpathWorkerClient } from '../../utils/toolpath/test.support/fake.toolpath.worker.client';
import {
  TOOLPATH_BURN_PATH_TEST_ID,
  TOOLPATH_BURN_STATE_ATTRIBUTE,
  TOOLPATH_HEAD_TEST_ID,
  TOOLPATH_ORIGIN_TEST_ID,
  TOOLPATH_TRAVEL_PATH_TEST_ID,
} from './toolpath.layer.constants';

const BED_WIDTH_MM = 300;
const BED_HEIGHT_MM = 200;
const DIMENSIONS: BedDimensions = {
  widthMm: BED_WIDTH_MM,
  heightMm: BED_HEIGHT_MM,
  placeholderKind: BED_PLACEHOLDER_KIND.NONE,
};
const BLUE_LAYER_KEY = '#0000ff';
const RED_LAYER_KEY = '#ff0000';
const LOW_POWER_PERCENT = 15;
const HIGH_POWER_PERCENT = 95;
const HALF_TIME_FRACTION = 0.5;
const HIGH_POWER_MOVE_INDEX = 2;
const TWO_LAYER_TOOLPATH: Toolpath = newToolpath({
  moves: [
    newToolpathMove({ kind: TOOLPATH_MOVE_KIND.TRAVEL, from: { x: 0, y: 0 }, to: { x: 10, y: 10 }, powerPercent: 0 }),
    newToolpathMove({ from: { x: 10, y: 10 }, to: { x: 50, y: 10 }, powerPercent: LOW_POWER_PERCENT }),
    newToolpathMove({ from: { x: 50, y: 10 }, to: { x: 50, y: 40 }, powerPercent: HIGH_POWER_PERCENT }),
    newToolpathMove({ kind: TOOLPATH_MOVE_KIND.TRAVEL, from: { x: 50, y: 40 }, to: { x: 80, y: 40 }, powerPercent: 0 }),
    newToolpathMove({ from: { x: 80, y: 40 }, to: { x: 80, y: 90 }, layerKey: BLUE_LAYER_KEY }),
  ],
  layers: [
    { layerKey: RED_LAYER_KEY, firstMoveIndex: 0, lastMoveIndex: 2 },
    { layerKey: BLUE_LAYER_KEY, firstMoveIndex: 3, lastMoveIndex: 4 },
  ],
  bounds: { minX: 10, minY: 10, maxX: 80, maxY: 90 },
});

// A feed far above the machine's rate, so the max rate sets the speed: 66 s at the default 6000 mm/min, about 33 s
// at 12000 mm/min.
const RATE_LIMITED_FEED_MM_PER_MIN = 60_000;
const RATE_LIMITED_END_X_MM = 6590;
const RATE_LIMITED_TOOLPATH: Toolpath = newToolpath({
  moves: [newToolpathMove({ to: { x: RATE_LIMITED_END_X_MM, y: 0 }, feedMmPerMin: RATE_LIMITED_FEED_MM_PER_MIN })],
  layers: [{ layerKey: RED_LAYER_KEY, firstMoveIndex: 0, lastMoveIndex: 0 }],
});
const FAST_MAX_RATE_MM_PER_MIN = '12000';
const LATE_TIME_S = 50;
const FAST_RATE_SETTINGS: Record<number, string> = {
  [GRBL_SETTING_X_MAX_RATE]: FAST_MAX_RATE_MM_PER_MIN,
  [GRBL_SETTING_Y_MAX_RATE]: FAST_MAX_RATE_MM_PER_MIN,
};

interface ToolpathLayerTestProps {
  displayMode?: ToolpathDisplayMode;
  isTravelShown?: boolean;
}

const renderLayer = (store: AppStore, props: ToolpathLayerTestProps = {}): void => {
  render(
    <Provider store={store}>
      <svg>
        <ToolpathLayer
          dimensions={DIMENSIONS}
          displayMode={props.displayMode ?? TOOLPATH_DISPLAY_MODE.BY_LAYER}
          isTravelShown={props.isTravelShown ?? true}
        />
      </svg>
    </Provider>,
  );
};

const newReadyStore = (toolpath: Toolpath = TWO_LAYER_TOOLPATH): AppStore => {
  const store: AppStore = newStore(undefined, new FakeToolpathWorkerClient(true));

  store.dispatch(new ToolpathRequested());
  store.dispatch(new ToolpathReady({ toolpath, documentVersion: selectToolpathDocumentVersion(store.getState()) }));

  return store;
};

const getTotalTimeS = (store: AppStore): number => selectToolpathMotionTimeline(store.getState())?.totalTimeS ?? 0;

/** The second half way through one move of the toolpath. */
const getMoveMiddleTimeS = (store: AppStore, moveIndex: number): number => {
  const moveStartTimesS: number[] = selectToolpathMotionTimeline(store.getState())?.moveStartTimesS ?? [];
  const startTimeS: number = moveStartTimesS[moveIndex] ?? 0;
  const endTimeS: number = moveStartTimesS[moveIndex + 1] ?? getTotalTimeS(store);

  return startTimeS + (endTimeS - startTimeS) * HALF_TIME_FRACTION;
};

const getBurnStates = (): (string | null)[] => screen.queryAllByTestId(TOOLPATH_BURN_PATH_TEST_ID)
  .map((burnPath: HTMLElement): string | null => burnPath.getAttribute(TOOLPATH_BURN_STATE_ATTRIBUTE));

describe(ToolpathLayer.name, () => {
  it('draws every burn path in the remaining style at time 0', () => {
    renderLayer(newReadyStore());

    expect(getBurnStates()).toEqual([TOOLPATH_BURN_STATE.REMAINING, TOOLPATH_BURN_STATE.REMAINING]);
  });

  it('draws every burn path in the burnt style at the end of the job', () => {
    const store: AppStore = newReadyStore();

    renderLayer(store);
    act(() => {
      store.dispatch(new SimulationTimeSet({ timeS: getTotalTimeS(store) }));
    });

    expect(getBurnStates()).toEqual([TOOLPATH_BURN_STATE.BURNT, TOOLPATH_BURN_STATE.BURNT]);
  });

  it('splits the running layer into a burnt and a remaining path half way through one of its moves', () => {
    const store: AppStore = newReadyStore();

    renderLayer(store);
    act(() => {
      store.dispatch(new SimulationTimeSet({ timeS: getMoveMiddleTimeS(store, HIGH_POWER_MOVE_INDEX) }));
    });

    expect(getBurnStates()).toEqual([
      TOOLPATH_BURN_STATE.REMAINING,
      TOOLPATH_BURN_STATE.REMAINING,
      TOOLPATH_BURN_STATE.BURNT,
    ]);
  });

  it('groups the burn moves of a layer by power band when power shading is on', () => {
    renderLayer(newReadyStore(), { displayMode: TOOLPATH_DISPLAY_MODE.POWER_SHADING });

    expect(getBurnStates()).toHaveLength(TWO_LAYER_TOOLPATH.layers.length + 1);
  });

  it('renders no travel path while travel moves are hidden', () => {
    renderLayer(newReadyStore(), { isTravelShown: false });

    expect(screen.queryByTestId(TOOLPATH_TRAVEL_PATH_TEST_ID)).not.toBeInTheDocument();
    expect(screen.getAllByTestId(TOOLPATH_BURN_PATH_TEST_ID)).toHaveLength(TWO_LAYER_TOOLPATH.layers.length);
  });

  it('draws the travel moves as one path while they are shown', () => {
    renderLayer(newReadyStore(), { isTravelShown: true });

    expect(screen.getByTestId(TOOLPATH_TRAVEL_PATH_TEST_ID)).toHaveAttribute('d', 'M0 0L10 10M50 40L80 40');
  });

  it('hides the toolpath and the head once the document changes', () => {
    const store: AppStore = newReadyStore();

    renderLayer(store);
    act(() => {
      store.dispatch(new ProjectDocumentLoaded({ document: { objects: [newProjectObject()], layers: [] } }));
    });

    expect(screen.queryAllByTestId(TOOLPATH_BURN_PATH_TEST_ID)).toEqual([]);
    expect(screen.queryByTestId(TOOLPATH_HEAD_TEST_ID)).not.toBeInTheDocument();
  });

  it('puts the work zero marker at the origin corner of the active profile', () => {
    const store: AppStore = newReadyStore();
    const profile: MachineProfile = newMachineProfile({ originCorner: MACHINE_ORIGIN_CORNER.BACK_RIGHT });

    store.dispatch(new MachineProfilesLoaded({
      document: { version: MACHINE_PROFILES_DOCUMENT_VERSION, activeProfileId: profile.id, profiles: [profile] },
    }));
    renderLayer(store);

    expect(screen.getByTestId(TOOLPATH_ORIGIN_TEST_ID)).toHaveAttribute('transform', `translate(${BED_WIDTH_MM} 0)`);
  });

  it('puts the head at the end of the last move at the end of the job', () => {
    const store: AppStore = newReadyStore();

    renderLayer(store);
    act(() => {
      store.dispatch(new SimulationTimeSet({ timeS: getTotalTimeS(store) }));
    });

    expect(screen.getByTestId(TOOLPATH_HEAD_TEST_ID)).toHaveAttribute('transform', 'translate(80 90)');
  });

  it('keeps the head at the end of the job when new machine limits make the job shorter than the time', () => {
    const store: AppStore = newReadyStore(RATE_LIMITED_TOOLPATH);

    store.dispatch(new SimulationTimeSet({ timeS: LATE_TIME_S }));
    renderLayer(store);
    act(() => {
      store.dispatch(new ConnectionEstablished({
        connectionInfo: {
          identity: { firmwareName: 'Grbl', version: '1.1h', vendorText: '' },
          rxBufferSize: 128,
          settings: FAST_RATE_SETTINGS,
          buildInfoLines: [],
        },
      }));
    });

    expect(screen.getByTestId(TOOLPATH_HEAD_TEST_ID))
      .toHaveAttribute('transform', `translate(${RATE_LIMITED_END_X_MM} 0)`);
    expect(getBurnStates()).toEqual([TOOLPATH_BURN_STATE.BURNT]);
  });
});
