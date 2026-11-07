import { act, fireEvent, render, screen } from '@testing-library/react';
import { Provider } from 'react-redux';
import type { MockInstance } from 'vitest';
import { FrameControls } from '.';
import { GRBL_CONNECTION_STATUS, GRBL_MACHINE_STATE, GRBL_SETTING_LASER_MODE, GRBL_SETTING_ON_VALUE } from '../../../../utils/grbl/grbl.constants';
import type { MachineProfile } from '../../../../utils/profiles/interfaces/MachineProfile';
import { MACHINE_JOG_FEED_RATE_MAX, MACHINE_JOG_FEED_RATE_MIN } from '../../../../utils/profiles/machine.profile.constants';
import { newMachineProfile } from '../../../../utils/profiles/new.machine.profile';
import { ConnectionEstablished, ConnectionStatusChanged } from '../../../../utils/states/grbl.connection.state';
import { JOB_RUN_KIND } from '../../../../utils/states/job.run.kind.constants';
import { FrameRunAlarmed, FrameStartRequested, JobRunStarted, JobRunStatusChanged } from '../../../../utils/states/job.run.state';
import { JOB_RUN_STATUS } from '../../../../utils/states/job.run.status.constants';
import {
  ActiveMachineProfileSelected,
  MachineProfileSaved,
  selectActiveMachineProfile,
} from '../../../../utils/states/machine.profile.state';
import { MachineStatusReceived } from '../../../../utils/states/machine.status.state';
import type { AppDispatch, AppStore } from '../../../../utils/states/new.store';
import { newStore } from '../../../../utils/states/new.store';
import { selectIsAnyOverlayOpen } from '../../../../utils/states/ui.overlay.state';
import { ToolpathReady, selectToolpathDocumentVersion } from '../../../../utils/states/toolpath.state';
import { AntdTestProvider } from '../../../../utils/test.support/antd.test.provider';
import { FakeToolpathWorkerClient } from '../../../../utils/toolpath/test.support/fake.toolpath.worker.client';
import { newToolpath } from '../../../../utils/toolpath/test.support/new.toolpath';
import { newToolpathMove } from '../../../../utils/toolpath/test.support/new.toolpath.move';

const FRAME_JOB_LABEL = 'Frame job';
const NEEDS_PROFILE_TEXT = 'Set up a laser profile first.';
const GRID_LABEL = 'Frame grid';
const FRAME_SPLIT_SELECTOR = '[class*="frameSplit"]';
const MARGIN_LABEL = 'Frame margin (mm)';
const SPEED_LABEL = 'Frame speed (mm/min)';
const PROFILE_NAME = 'Test laser';
const OTHER_PROFILE_NAME = 'Other laser';
// The 100 mm wide outline of the stored toolpath.
const OUTLINE_END_X_MM = 100;
const OVERRUN_MM = 12;
const SAVED_MARGIN_MM = 5;
const SAVED_GRID_CELL_MM = 20;
const INVALID_MARGIN_MM = -3;
const SAVED_SPEED_MM_PER_MIN = 3000;
const TOO_SLOW_SPEED_MM_PER_MIN = 50;
const OUT_OF_RANGE_SPEED_MM_PER_MIN = 60000;
const DEFAULT_SPEED_TEXT = '6000';
const GRID_20_LABEL = '2 cm';
const SELECT_OPTION_SELECTOR = '.ant-select-item-option';
// The 100 mm by 50 mm outline has a 300 mm perimeter, 3 s at 6000 mm/min.
const FRAME_TIME_TEXT = '3 s';
// The same perimeter at 3000 mm/min takes 6 s.
const SLOWER_FRAME_TIME_TEXT = '6 s';
const ALARM_TEXT_PATTERN = /reported an alarm, possibly a limit/;
const SELECT_OPTION_TITLE_ATTRIBUTE = 'title';

const newIdleStatusReceived = (hasWorkPosition: boolean): MachineStatusReceived =>
  new MachineStatusReceived({
    status: {
      machineState: GRBL_MACHINE_STATE.IDLE,
      machineSubstate: undefined,
      machinePosition: undefined,
      workPosition: hasWorkPosition ? { x: 0, y: 0, z: 0 } : undefined,
      workCoordinateOffset: undefined,
      plannerBlocksAvailable: undefined,
      rxBytesAvailable: undefined,
      feedRate: undefined,
      spindleSpeed: undefined,
      overrides: undefined,
    },
  });

const newFrameStore = (endX: number): AppStore => {
  const store: AppStore = newStore(undefined, new FakeToolpathWorkerClient(true));
  const profile: MachineProfile = newMachineProfile({ name: PROFILE_NAME });

  store.dispatch(new MachineProfileSaved({ profile }));
  store.dispatch(new ActiveMachineProfileSelected({ profileId: profile.id }));
  store.dispatch(new ConnectionStatusChanged({ connectionStatus: GRBL_CONNECTION_STATUS.CONNECTED }));
  store.dispatch(new ConnectionEstablished({
    connectionInfo: {
      identity: { firmwareName: 'Grbl', version: '1.1h', vendorText: '' },
      rxBufferSize: 128,
      settings: { [GRBL_SETTING_LASER_MODE]: GRBL_SETTING_ON_VALUE },
      buildInfoLines: [],
    },
  }));
  store.dispatch(newIdleStatusReceived(true));
  store.dispatch(new ToolpathReady({
    toolpath: newToolpath({
      moves: [newToolpathMove({ from: { x: 0, y: 0 }, to: { x: endX, y: 50 } })],
      warnings: [],
    }),
    documentVersion: selectToolpathDocumentVersion(store.getState()),
  }));

  return store;
};

const SHOW_SETTINGS_LABEL = 'Show frame settings';
const HIDE_SETTINGS_LABEL = 'Hide frame settings';

const renderFrameControls = (store: AppStore): void => {
  render(
    <Provider store={store}>
      <AntdTestProvider>
        <FrameControls />
      </AntdTestProvider>
    </Provider>,
  );
  fireEvent.click(screen.getByRole('button', { name: SHOW_SETTINGS_LABEL }));
};

const getFrameJobButton = (): HTMLElement => screen.getByRole('button', { name: FRAME_JOB_LABEL });

const getActiveProfile = (store: AppStore): MachineProfile => {
  const profile: MachineProfile | undefined = selectActiveMachineProfile(store.getState());

  if (!profile) {
    throw new Error('The test store has no active profile');
  }

  return profile;
};

describe(FrameControls.name, () => {
  it('keeps the frame settings closed until the gear is pressed', () => {
    render(
      <Provider store={newFrameStore(OUTLINE_END_X_MM)}>
        <AntdTestProvider>
          <FrameControls />
        </AntdTestProvider>
      </Provider>,
    );

    expect(screen.queryByLabelText('Frame margin (mm)')).not.toBeInTheDocument();
    expect(screen.getByRole('button', { name: SHOW_SETTINGS_LABEL })).toHaveAttribute('aria-expanded', 'false');

    fireEvent.click(screen.getByRole('button', { name: SHOW_SETTINGS_LABEL }));

    expect(screen.getByLabelText('Frame margin (mm)')).toBeInTheDocument();
  });

  it('registers the open settings as an overlay, so Escape only closes them', () => {
    const store: AppStore = newFrameStore(OUTLINE_END_X_MM);

    renderFrameControls(store);

    expect(selectIsAnyOverlayOpen(store.getState())).toBe(true);
  });

  it('says why the settings are off while no profile is active', () => {
    const store: AppStore = newStore(undefined, new FakeToolpathWorkerClient(true));

    renderFrameControls(store);

    expect(screen.getByText(NEEDS_PROFILE_TEXT)).toBeInTheDocument();
    expect(screen.queryByLabelText(MARGIN_LABEL)).not.toBeInTheDocument();
  });

  it('keeps the settings editable while disconnected, as they only change the stored profile', () => {
    const store: AppStore = newFrameStore(OUTLINE_END_X_MM);

    store.dispatch(new ConnectionStatusChanged({ connectionStatus: GRBL_CONNECTION_STATUS.DISCONNECTED }));
    renderFrameControls(store);
    fireEvent.change(screen.getByLabelText(MARGIN_LABEL), { target: { value: String(SAVED_MARGIN_MM) } });
    fireEvent.blur(screen.getByLabelText(MARGIN_LABEL));

    expect(getActiveProfile(store).frameMarginMm).toBe(SAVED_MARGIN_MM);
  });

  it('shows the frame time, the dot power and the profile the power is worked out for', () => {
    renderFrameControls(newFrameStore(OUTLINE_END_X_MM));

    expect(screen.getByText(FRAME_TIME_TEXT)).toBeInTheDocument();
    expect(screen.getByText('\u2248 0.05 W')).toBeInTheDocument();
  });

  it('draws an enabled Frame and its gear inside one split button', () => {
    renderFrameControls(newFrameStore(OUTLINE_END_X_MM));

    const frameButton: HTMLElement = getFrameJobButton();
    const splitButton: HTMLElement | null = frameButton.closest(FRAME_SPLIT_SELECTOR);

    expect(frameButton).not.toHaveAttribute('aria-disabled');
    expect(splitButton).not.toBeNull();
    expect(splitButton).toContainElement(screen.getByRole('button', { name: HIDE_SETTINGS_LABEL }));
  });

  it('starts the frame at once, with no confirmation', () => {
    const store: AppStore = newFrameStore(OUTLINE_END_X_MM);
    const dispatchSpy: MockInstance<AppDispatch> = vi.spyOn(store, 'dispatch');

    renderFrameControls(store);
    fireEvent.click(getFrameJobButton());

    expect(dispatchSpy).toHaveBeenCalledWith(expect.any(FrameStartRequested));
  });

  it('saves the grid the user picks to the active profile', () => {
    const store: AppStore = newFrameStore(OUTLINE_END_X_MM);

    renderFrameControls(store);
    fireEvent.mouseDown(screen.getByRole('combobox', { name: GRID_LABEL }));
    const option: Element | null = Array.from(document.querySelectorAll(SELECT_OPTION_SELECTOR)).find(
      (candidate: Element): boolean => candidate.getAttribute(SELECT_OPTION_TITLE_ATTRIBUTE) === GRID_20_LABEL,
    ) ?? null;

    fireEvent.click(option as Element);

    expect(getActiveProfile(store).frameGridCellMm).toBe(SAVED_GRID_CELL_MM);
  });

  it('saves a valid margin to the active profile', () => {
    const store: AppStore = newFrameStore(OUTLINE_END_X_MM);

    renderFrameControls(store);
    fireEvent.change(screen.getByLabelText(MARGIN_LABEL), { target: { value: String(SAVED_MARGIN_MM) } });
    fireEvent.blur(screen.getByLabelText(MARGIN_LABEL));

    expect(getActiveProfile(store).frameMarginMm).toBe(SAVED_MARGIN_MM);
  });

  it('raises a negative margin to 0 on blur', () => {
    const store: AppStore = newFrameStore(OUTLINE_END_X_MM);

    renderFrameControls(store);
    fireEvent.change(screen.getByLabelText(MARGIN_LABEL), { target: { value: String(INVALID_MARGIN_MM) } });
    fireEvent.blur(screen.getByLabelText(MARGIN_LABEL));

    expect(screen.queryByRole('alert')).not.toBeInTheDocument();
    expect(getActiveProfile(store).frameMarginMm).toBe(0);
  });

  it('keeps a cleared margin empty while typing and gives the saved one back on blur', () => {
    const store: AppStore = newFrameStore(OUTLINE_END_X_MM);

    renderFrameControls(store);
    fireEvent.change(screen.getByLabelText(MARGIN_LABEL), { target: { value: String(SAVED_MARGIN_MM) } });
    fireEvent.blur(screen.getByLabelText(MARGIN_LABEL));
    fireEvent.change(screen.getByLabelText(MARGIN_LABEL), { target: { value: '' } });

    expect(screen.getByLabelText(MARGIN_LABEL)).toHaveValue('');

    fireEvent.blur(screen.getByLabelText(MARGIN_LABEL));

    expect(screen.getByLabelText(MARGIN_LABEL)).toHaveValue(String(SAVED_MARGIN_MM));
    expect(getActiveProfile(store).frameMarginMm).toBe(SAVED_MARGIN_MM);
  });

  it('drops an unsaved margin when another profile becomes active', () => {
    const store: AppStore = newFrameStore(OUTLINE_END_X_MM);
    const otherProfile: MachineProfile = newMachineProfile({
      name: OTHER_PROFILE_NAME,
      frameMarginMm: SAVED_MARGIN_MM,
    });

    renderFrameControls(store);
    fireEvent.change(screen.getByLabelText(MARGIN_LABEL), { target: { value: String(INVALID_MARGIN_MM) } });

    act(() => {
      store.dispatch(new MachineProfileSaved({ profile: otherProfile }));
      store.dispatch(new ActiveMachineProfileSelected({ profileId: otherProfile.id }));
    });

    expect(screen.getByLabelText(MARGIN_LABEL)).toHaveValue(String(SAVED_MARGIN_MM));
  });

  it('shows the default speed and saves a valid speed to the active profile', () => {
    const store: AppStore = newFrameStore(OUTLINE_END_X_MM);

    renderFrameControls(store);
    expect(screen.getByLabelText(SPEED_LABEL)).toHaveValue(DEFAULT_SPEED_TEXT);

    fireEvent.change(screen.getByLabelText(SPEED_LABEL), { target: { value: String(SAVED_SPEED_MM_PER_MIN) } });
    fireEvent.blur(screen.getByLabelText(SPEED_LABEL));

    expect(getActiveProfile(store).frameFeedMmPerMin).toBe(SAVED_SPEED_MM_PER_MIN);
    expect(screen.getByText(SLOWER_FRAME_TIME_TEXT)).toBeInTheDocument();
  });

  it.each([
    [TOO_SLOW_SPEED_MM_PER_MIN, MACHINE_JOG_FEED_RATE_MIN],
    [OUT_OF_RANGE_SPEED_MM_PER_MIN, MACHINE_JOG_FEED_RATE_MAX],
  ])('holds the speed %d inside the limits on blur, at %d', (typedSpeed: number, savedSpeed: number) => {
    const store: AppStore = newFrameStore(OUTLINE_END_X_MM);

    renderFrameControls(store);
    fireEvent.change(screen.getByLabelText(SPEED_LABEL), { target: { value: String(typedSpeed) } });

    expect(screen.getByLabelText(SPEED_LABEL)).toHaveValue(String(typedSpeed));

    fireEvent.blur(screen.getByLabelText(SPEED_LABEL));

    expect(screen.queryByRole('alert')).not.toBeInTheDocument();
    expect(getActiveProfile(store).frameFeedMmPerMin).toBe(savedSpeed);
  });

  it('shows the default speed and its time for a stored speed that is out of range', () => {
    const store: AppStore = newFrameStore(OUTLINE_END_X_MM);

    store.dispatch(new MachineProfileSaved({
      profile: { ...getActiveProfile(store), frameFeedMmPerMin: OUT_OF_RANGE_SPEED_MM_PER_MIN },
    }));
    renderFrameControls(store);

    expect(screen.getByLabelText(SPEED_LABEL)).toHaveValue(DEFAULT_SPEED_TEXT);
    expect(screen.getByText(FRAME_TIME_TEXT)).toBeInTheDocument();
  });

  it('drops an unsaved speed when another profile becomes active', () => {
    const store: AppStore = newFrameStore(OUTLINE_END_X_MM);
    const otherProfile: MachineProfile = newMachineProfile({ name: OTHER_PROFILE_NAME });

    renderFrameControls(store);
    fireEvent.change(screen.getByLabelText(SPEED_LABEL), { target: { value: String(TOO_SLOW_SPEED_MM_PER_MIN) } });

    act(() => {
      store.dispatch(new MachineProfileSaved({ profile: otherProfile }));
      store.dispatch(new ActiveMachineProfileSelected({ profileId: otherProfile.id }));
    });

    expect(screen.getByLabelText(SPEED_LABEL)).toHaveValue(DEFAULT_SPEED_TEXT);
  });

  it('turns the button off and names the edge and distance when the frame leaves the bed', () => {
    const store: AppStore = newFrameStore(getActiveProfile(newFrameStore(0)).workAreaXMm + OVERRUN_MM);

    renderFrameControls(store);

    expect(getFrameJobButton()).toHaveAttribute('aria-disabled', 'true');
    expect(screen.getByText(
      `The frame goes ${OVERRUN_MM} mm past the right edge of the bed. Move the job before framing.`,
    )).toBeInTheDocument();
  });

  it('turns the button off while no work position is known, with the reason on hover', async () => {
    const store: AppStore = newFrameStore(OUTLINE_END_X_MM);

    store.dispatch(newIdleStatusReceived(false));
    renderFrameControls(store);
    fireEvent.mouseEnter(getFrameJobButton().parentElement as HTMLElement);

    expect(getFrameJobButton()).toHaveAttribute('aria-disabled', 'true');
    expect(await screen.findByText('The laser has not reported its position yet.')).toBeInTheDocument();
  });

  it('keeps a blocked Frame focusable and starts no frame on a click', () => {
    const store: AppStore = newFrameStore(getActiveProfile(newFrameStore(0)).workAreaXMm + OVERRUN_MM);
    const dispatchSpy: MockInstance<AppDispatch> = vi.spyOn(store, 'dispatch');

    renderFrameControls(store);
    getFrameJobButton().focus();
    fireEvent.click(getFrameJobButton());

    expect(getFrameJobButton()).toHaveFocus();
    expect(dispatchSpy).not.toHaveBeenCalledWith(expect.any(FrameStartRequested));
  });

  it('turns the controls off while a frame runs', () => {
    const store: AppStore = newFrameStore(OUTLINE_END_X_MM);

    store.dispatch(new JobRunStarted({ startedAtMs: 0, kind: JOB_RUN_KIND.FRAME }));
    renderFrameControls(store);

    expect(getFrameJobButton()).toHaveAttribute('aria-disabled', 'true');
    expect(screen.getByRole('combobox', { name: GRID_LABEL })).toBeDisabled();
    expect(screen.getByLabelText(MARGIN_LABEL)).toBeDisabled();
    expect(screen.getByLabelText(SPEED_LABEL)).toBeDisabled();
  });

  it('says the machine reported an alarm after a frame ended by one, and not flatly that a limit was hit', () => {
    const store: AppStore = newFrameStore(OUTLINE_END_X_MM);

    renderFrameControls(store);
    expect(screen.queryByText(ALARM_TEXT_PATTERN)).not.toBeInTheDocument();

    act(() => {
      store.dispatch(new JobRunStarted({ startedAtMs: 0, kind: JOB_RUN_KIND.FRAME }));
      store.dispatch(new FrameRunAlarmed());
      store.dispatch(new JobRunStatusChanged({ status: JOB_RUN_STATUS.INTERRUPTED }));
    });

    expect(screen.getByText(ALARM_TEXT_PATTERN)).toBeInTheDocument();
  });
});
