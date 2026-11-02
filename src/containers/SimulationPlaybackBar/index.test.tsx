import { act, fireEvent, render, screen } from '@testing-library/react';
import { Provider } from 'react-redux';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { SimulationPlaybackBar } from '.';
import { MULTIPLICATION_SIGN } from '../../utils/characters.constants';
import { newProjectObject } from '../../utils/project/new.project.object';
import { newStore } from '../../utils/states/new.store';
import type { AppStore } from '../../utils/states/new.store';
import { ConnectionEstablished } from '../../utils/states/grbl.connection.state';
import { ProjectDocumentLoaded } from '../../utils/states/project.document.state';
import {
  SimulationPlayToggled,
  SimulationReset,
  SimulationSpeedSet,
  SimulationTimeSet,
  selectIsSimulationPlaying,
  selectSimulationSpeed,
  selectSimulationTimeS,
} from '../../utils/states/simulation.state';
import { SIMULATION_SPEED_FIFTY_TIMES, SIMULATION_SPEED_TWO_HUNDRED_TIMES } from '../../utils/states/simulation.speed.constants';
import { selectReadyToolpathTotalTimeS } from '../../utils/states/toolpath.timeline.selectors';
import { ToolpathReady, ToolpathRequested, selectToolpathDocumentVersion } from '../../utils/states/toolpath.state';
import { AnimationFrameStub } from '../../utils/test.support/animation.frame.stub';
import { AntdTestProvider } from '../../utils/test.support/antd.test.provider';
import type { Toolpath } from '../../utils/toolpath/interfaces/Toolpath';
import { FakeToolpathWorkerClient } from '../../utils/toolpath/test.support/fake.toolpath.worker.client';
import { newToolpath } from '../../utils/toolpath/test.support/new.toolpath';
import { newToolpathMove } from '../../utils/toolpath/test.support/new.toolpath.move';
import { TOOLPATH_MOVE_KIND } from '../../utils/toolpath/toolpath.constants';
import type { GrblFirmwareIdentity } from '../../utils/grbl/interfaces/GrblFirmwareIdentity';
import { GRBL_SETTING_X_MAX_RATE, GRBL_SETTING_Y_MAX_RATE } from '../../utils/grbl/grbl.constants';
import { SIMULATION_LAYER_SEGMENT_TEST_ID } from './simulation.playback.constants';

const PLAY_LABEL = 'Play';
const PAUSE_LABEL = 'Pause';
const BACK_TO_START_LABEL = 'Back to start';
const TO_END_LABEL = 'To end';
const SLIDER_LABEL = 'Simulation time';
const BAR_LABEL = 'Simulation playback';
const FIFTY_TIMES_LABEL = `50${MULTIPLICATION_SIGN}`;
const RED_LAYER_KEY = '#ff0000';
const BLUE_LAYER_KEY = '#0000ff';
// One burn at 6000 mm/min (100 mm/s) from rest to rest with the default 1000 mm/s2: 0.1 s and 5 mm of ramp at each
// end, so the head is at 5 + 100 x (t - 0.1) mm while it cruises, and the job takes 66 s.
const SIXTY_SIX_SECOND_TOOLPATH: Toolpath = newToolpath({
  moves: [newToolpathMove({ from: { x: 0, y: 0 }, to: { x: 6590, y: 0 } })],
  layers: [{ layerKey: RED_LAYER_KEY, firstMoveIndex: 0, lastMoveIndex: 0 }],
});
const TOTAL_TIME_S = 66;
const SIXTY_SIX_SECONDS_TEXT = '01:06';
// The red burn takes 0.2 + 1000 / 100 = 10.2 s and the blue one 0.2 + 3000 / 100 = 30.2 s; the travel between them
// turns back, so both burns start and end at rest, and the travel is left out of the shares.
const TWO_LAYER_TOOLPATH: Toolpath = newToolpath({
  moves: [
    newToolpathMove({ from: { x: 0, y: 0 }, to: { x: 1010, y: 0 } }),
    newToolpathMove({ kind: TOOLPATH_MOVE_KIND.TRAVEL, from: { x: 1010, y: 0 }, to: { x: 0, y: 0 }, powerPercent: 0 }),
    newToolpathMove({ from: { x: 0, y: 0 }, to: { x: 3010, y: 0 }, layerKey: BLUE_LAYER_KEY }),
  ],
  layers: [
    { layerKey: RED_LAYER_KEY, firstMoveIndex: 0, lastMoveIndex: 0 },
    { layerKey: BLUE_LAYER_KEY, firstMoveIndex: 1, lastMoveIndex: 2 },
  ],
});
const RED_SHARE_PERCENT = (10.2 / 40.4) * 100;
const BLUE_SHARE_PERCENT = (30.2 / 40.4) * 100;
const SHARE_DECIMALS = 6;
const FRAME_STEP_MS = 100;
const ONE_SECOND_MS = 1000;
const FIRST_FRAME_MS = 5000;
const FIFTY_SECONDS = 50;
const NEAR_END_TIME_S = 60;
const DRAG_TIME_S = 30;
const SLIDER_WIDTH_PX = 660;
const SLIDER_HEIGHT_PX = 10;
const DRAG_TIME_TEXT = '00:30';
const DRAG_X_TEXT = 'X 2995.0 mm';
const DRAG_Y_TEXT = 'Y 0.0 mm';
const DRAG_POWER_TEXT = 'Power 50 %';
const BACKGROUNDED_TAB_GAP_MS = 60_000;
const LONGEST_FRAME_S = 0.25;
const SPACE_KEY = ' ';
const ANTD_SLIDER_SELECTOR = '.ant-slider';
// A feed far above the machine's rate, so the default 6000 mm/min max rate sets the speed: 66 s at 100 mm/s. At a
// max rate of 12000 mm/min (200 mm/s) the same move takes 0.4 s of ramps plus 6550 / 200 s, 33.15 s.
const RATE_LIMITED_FEED_MM_PER_MIN = 60_000;
const RATE_LIMITED_TOOLPATH: Toolpath = newToolpath({
  moves: [newToolpathMove({ from: { x: 0, y: 0 }, to: { x: 6590, y: 0 }, feedMmPerMin: RATE_LIMITED_FEED_MM_PER_MIN })],
  layers: [{ layerKey: RED_LAYER_KEY, firstMoveIndex: 0, lastMoveIndex: 0 }],
});
const FAST_MAX_RATE_MM_PER_MIN = '12000';
const SHRUNK_TOTAL_TIME_S = 33.15;
const SHRUNK_CLOCK_TEXT = '00:33 / 00:33';
const LATE_TIME_S = 50;
const FIRMWARE_IDENTITY: GrblFirmwareIdentity = { firmwareName: 'Grbl', version: '1.1h', vendorText: '' };
const RX_BUFFER_SIZE = 128;
const FAST_RATE_SETTINGS: Record<number, string> = {
  [GRBL_SETTING_X_MAX_RATE]: FAST_MAX_RATE_MM_PER_MIN,
  [GRBL_SETTING_Y_MAX_RATE]: FAST_MAX_RATE_MM_PER_MIN,
};

const newReadyStore = (toolpath: Toolpath = SIXTY_SIX_SECOND_TOOLPATH): AppStore => {
  const store: AppStore = newStore(undefined, new FakeToolpathWorkerClient(true));

  store.dispatch(new ToolpathRequested());
  store.dispatch(new ToolpathReady({ toolpath, documentVersion: selectToolpathDocumentVersion(store.getState()) }));

  return store;
};

const renderBar = (store: AppStore): (() => void) => render(
  <Provider store={store}>
    <AntdTestProvider>
      <SimulationPlaybackBar />
    </AntdTestProvider>
  </Provider>,
).unmount;

const getButton = (name: string): HTMLElement => screen.getByRole('button', { name });

const getSlider = (): HTMLElement => screen.getByRole('slider', { name: SLIDER_LABEL });

/** Drags the slider by pressing its rail at the point of the given second, with the rail SLIDER_WIDTH_PX wide. */
const dragSliderTo = (timeS: number): void => {
  const sliderRoot: HTMLElement | null = getSlider().closest(ANTD_SLIDER_SELECTOR);

  if (!sliderRoot) {
    throw new Error('The slider has no root element');
  }

  vi.spyOn(sliderRoot, 'getBoundingClientRect')
    .mockReturnValue(DOMRect.fromRect({ x: 0, y: 0, width: SLIDER_WIDTH_PX, height: SLIDER_HEIGHT_PX }));
  fireEvent.mouseDown(sliderRoot, { clientX: (timeS / TOTAL_TIME_S) * SLIDER_WIDTH_PX, clientY: 0 });
  fireEvent.mouseUp(document);
};

const getSegmentWidthPercents = (): number[] => screen.getAllByTestId(SIMULATION_LAYER_SEGMENT_TEST_ID)
  .map((segment: HTMLElement): number => Number.parseFloat(segment.style.width));

describe(SimulationPlaybackBar.name, () => {
  let animationFrames: AnimationFrameStub;

  beforeEach(() => {
    animationFrames = new AnimationFrameStub();
    animationFrames.install();
  });

  afterEach(() => {
    vi.unstubAllGlobals();
    vi.restoreAllMocks();
  });

  it('advances the time by the speed times the real time: 1 s at 50x is 50 s', () => {
    const store: AppStore = newReadyStore();

    store.dispatch(new SimulationSpeedSet({ speed: SIMULATION_SPEED_FIFTY_TIMES }));
    renderBar(store);
    fireEvent.click(getButton(PLAY_LABEL));
    animationFrames.runFrames(FIRST_FRAME_MS, FIRST_FRAME_MS + ONE_SECOND_MS, FRAME_STEP_MS);

    expect(selectSimulationTimeS(store.getState())).toBeCloseTo(FIFTY_SECONDS, SHARE_DECIMALS);
    expect(selectIsSimulationPlaying(store.getState())).toBe(true);
  });

  it('stops at the end of the job, paused, with no frame left waiting', () => {
    const store: AppStore = newReadyStore();

    store.dispatch(new SimulationSpeedSet({ speed: SIMULATION_SPEED_TWO_HUNDRED_TIMES }));
    store.dispatch(new SimulationTimeSet({ timeS: NEAR_END_TIME_S }));
    renderBar(store);
    fireEvent.click(getButton(PLAY_LABEL));
    animationFrames.runFrames(FIRST_FRAME_MS, FIRST_FRAME_MS + ONE_SECOND_MS, FRAME_STEP_MS);

    expect(selectSimulationTimeS(store.getState())).toBe(selectReadyToolpathTotalTimeS(store.getState()));
    expect(selectIsSimulationPlaying(store.getState())).toBe(false);
    expect(animationFrames.getWaitingCallbackCount()).toBe(0);
    expect(getButton(PLAY_LABEL)).toBeInTheDocument();
  });

  it('advances a long gap between two frames by one short frame only, so a hidden tab does not jump', () => {
    const store: AppStore = newReadyStore();

    renderBar(store);
    fireEvent.click(getButton(PLAY_LABEL));
    animationFrames.runFrame(FIRST_FRAME_MS);
    animationFrames.runFrame(FIRST_FRAME_MS + BACKGROUNDED_TAB_GAP_MS);

    expect(selectSimulationTimeS(store.getState())).toBeCloseTo(LONGEST_FRAME_S, SHARE_DECIMALS);
  });

  it('restarts from 0 when Play is pressed at the end', () => {
    const store: AppStore = newReadyStore();

    store.dispatch(new SimulationTimeSet({ timeS: TOTAL_TIME_S }));
    renderBar(store);
    fireEvent.click(getButton(PLAY_LABEL));

    expect(selectSimulationTimeS(store.getState())).toBe(0);
    expect(selectIsSimulationPlaying(store.getState())).toBe(true);
  });

  it('pauses and stops asking for frames when Pause is pressed', () => {
    const store: AppStore = newReadyStore();

    renderBar(store);
    fireEvent.click(getButton(PLAY_LABEL));
    fireEvent.click(getButton(PAUSE_LABEL));

    expect(selectIsSimulationPlaying(store.getState())).toBe(false);
    expect(animationFrames.getWaitingCallbackCount()).toBe(0);
  });

  it('stops asking for frames and pauses once it is no longer shown', () => {
    const store: AppStore = newReadyStore();
    const unmountBar: () => void = renderBar(store);

    fireEvent.click(getButton(PLAY_LABEL));
    act(unmountBar);

    expect(animationFrames.getWaitingCallbackCount()).toBe(0);
    expect(selectIsSimulationPlaying(store.getState())).toBe(false);
  });

  it('sets the time while the slider is dragged to 30 s and moves the readout to the head position then', () => {
    const store: AppStore = newReadyStore();

    renderBar(store);
    dragSliderTo(DRAG_TIME_S);

    expect(selectSimulationTimeS(store.getState())).toBeCloseTo(DRAG_TIME_S, SHARE_DECIMALS);
    expect(screen.getByText(`${DRAG_TIME_TEXT} / ${SIXTY_SIX_SECONDS_TEXT}`)).toBeInTheDocument();
    expect(screen.getByText(DRAG_X_TEXT)).toBeInTheDocument();
    expect(screen.getByText(DRAG_Y_TEXT)).toBeInTheDocument();
    expect(screen.getByText(DRAG_POWER_TEXT)).toBeInTheDocument();
  });

  it('jumps to the end with To end and back to 0 with Back to start', () => {
    const store: AppStore = newReadyStore();

    renderBar(store);
    fireEvent.click(getButton(TO_END_LABEL));

    expect(selectSimulationTimeS(store.getState())).toBe(selectReadyToolpathTotalTimeS(store.getState()));
    expect(getSlider()).toHaveAttribute('aria-valuenow', String(selectReadyToolpathTotalTimeS(store.getState())));

    fireEvent.click(getButton(BACK_TO_START_LABEL));

    expect(selectSimulationTimeS(store.getState())).toBe(0);
  });

  it('sets the speed from the speed switch', () => {
    const store: AppStore = newReadyStore();

    renderBar(store);
    fireEvent.click(screen.getByRole('radio', { name: FIFTY_TIMES_LABEL }));

    expect(selectSimulationSpeed(store.getState())).toBe(SIMULATION_SPEED_FIFTY_TIMES);
  });

  it('draws one layer bar segment per layer of the toolpath, as wide as its share of the burn time', () => {
    renderBar(newReadyStore(TWO_LAYER_TOOLPATH));

    const segmentWidthPercents: number[] = getSegmentWidthPercents();

    expect(segmentWidthPercents).toHaveLength(TWO_LAYER_TOOLPATH.layers.length);
    expect(segmentWidthPercents[0]).toBeCloseTo(RED_SHARE_PERCENT, SHARE_DECIMALS);
    expect(segmentWidthPercents[1]).toBeCloseTo(BLUE_SHARE_PERCENT, SHARE_DECIMALS);
  });

  it('toggles play with Space while the bar has the focus', () => {
    const store: AppStore = newReadyStore();

    renderBar(store);

    const focusedBar: HTMLElement = screen.getByRole('group', { name: BAR_LABEL });

    focusedBar.focus();
    fireEvent.keyDown(document.activeElement ?? focusedBar, { key: SPACE_KEY });

    expect(document.activeElement).toBe(focusedBar);
    expect(selectIsSimulationPlaying(store.getState())).toBe(true);
  });

  it('toggles once on Space on the focused Play button, which the button handles itself', () => {
    const store: AppStore = newReadyStore();

    renderBar(store);

    const playButton: HTMLElement = getButton(PLAY_LABEL);

    playButton.focus();
    // A browser clicks a focused button on Space; jsdom does not, so the click follows the key by hand.
    fireEvent.keyDown(playButton, { key: SPACE_KEY });
    fireEvent.keyUp(playButton, { key: SPACE_KEY });
    fireEvent.click(playButton);

    expect(selectIsSimulationPlaying(store.getState())).toBe(true);
  });

  it('keeps the clock and slider inside the job when new machine limits make the job shorter', () => {
    const store: AppStore = newReadyStore(RATE_LIMITED_TOOLPATH);

    store.dispatch(new SimulationTimeSet({ timeS: LATE_TIME_S }));
    renderBar(store);
    act(() => {
      store.dispatch(new ConnectionEstablished({
        connectionInfo: {
          identity: FIRMWARE_IDENTITY,
          rxBufferSize: RX_BUFFER_SIZE,
          settings: FAST_RATE_SETTINGS,
          buildInfoLines: [],
        },
      }));
    });

    expect(selectReadyToolpathTotalTimeS(store.getState())).toBeCloseTo(SHRUNK_TOTAL_TIME_S, SHARE_DECIMALS);
    expect(screen.getByText(SHRUNK_CLOCK_TEXT)).toBeInTheDocument();
    expect(Number(getSlider().getAttribute('aria-valuenow'))).toBeCloseTo(SHRUNK_TOTAL_TIME_S, SHARE_DECIMALS);
  });

  it('ignores a frame that runs after the store paused the playback, before the loop is stopped', () => {
    const store: AppStore = newReadyStore();

    renderBar(store);
    fireEvent.click(getButton(PLAY_LABEL));
    animationFrames.runFrame(FIRST_FRAME_MS);

    const requestCountBeforeReset: number = animationFrames.getRequestCount();

    // Outside act on purpose: the effect that stops the loop has not run yet when the waiting frame fires.
    store.dispatch(new SimulationReset());
    animationFrames.runFrame(FIRST_FRAME_MS + FRAME_STEP_MS);

    expect(selectSimulationTimeS(store.getState())).toBe(0);
    expect(animationFrames.getRequestCount()).toBe(requestCountBeforeReset);
  });

  it('disables play and ignores Space while the toolpath is out of date, and pauses a running playback', () => {
    const store: AppStore = newReadyStore();

    renderBar(store);
    fireEvent.click(getButton(PLAY_LABEL));
    act(() => {
      store.dispatch(new ProjectDocumentLoaded({ document: { objects: [newProjectObject()], layers: [] } }));
    });
    fireEvent.keyDown(screen.getByRole('group', { name: BAR_LABEL }), { key: SPACE_KEY });

    expect(getButton(PLAY_LABEL)).toBeDisabled();
    expect(getButton(TO_END_LABEL)).toBeDisabled();
    expect(selectIsSimulationPlaying(store.getState())).toBe(false);
    expect(animationFrames.getWaitingCallbackCount()).toBe(0);
  });

  it('disables play while the toolpath is generating', () => {
    const store: AppStore = newReadyStore();

    store.dispatch(new ToolpathRequested());
    renderBar(store);

    expect(getButton(PLAY_LABEL)).toBeDisabled();
  });

  it('does not start a playback that is toggled on while the toolpath is generating', () => {
    const store: AppStore = newReadyStore();

    store.dispatch(new ToolpathRequested());
    renderBar(store);
    act(() => {
      store.dispatch(new SimulationPlayToggled());
    });

    expect(selectIsSimulationPlaying(store.getState())).toBe(false);
    expect(animationFrames.getWaitingCallbackCount()).toBe(0);
  });
});
