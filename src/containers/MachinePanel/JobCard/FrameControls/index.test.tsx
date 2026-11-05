import { act, fireEvent, render, screen } from '@testing-library/react';
import { Provider } from 'react-redux';
import type { MockInstance } from 'vitest';
import { FrameControls } from '.';
import { GRBL_CONNECTION_STATUS, GRBL_MACHINE_STATE, GRBL_SETTING_LASER_MODE, GRBL_SETTING_ON_VALUE } from '../../../../utils/grbl/grbl.constants';
import type { MachineProfile } from '../../../../utils/profiles/interfaces/MachineProfile';
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
import { ToolpathReady, selectToolpathDocumentVersion } from '../../../../utils/states/toolpath.state';
import { AntdTestProvider } from '../../../../utils/test.support/antd.test.provider';
import { FakeToolpathWorkerClient } from '../../../../utils/toolpath/test.support/fake.toolpath.worker.client';
import { newToolpath } from '../../../../utils/toolpath/test.support/new.toolpath';
import { newToolpathMove } from '../../../../utils/toolpath/test.support/new.toolpath.move';

const FRAME_JOB_LABEL = 'Frame job';
const GRID_LABEL = 'Frame grid';
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
const FRAME_TIME_TEXT = '0 min 3 s';
// The same perimeter at 3000 mm/min takes 6 s.
const SLOWER_FRAME_TIME_TEXT = '0 min 6 s';
const SPEED_ERROR_TEXT = 'Frame speed must be between 100 and 10000 mm/min';
const MARGIN_ERROR_TEXT = 'Frame margin must not be negative';
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

  it('shows the frame time, the dot power and the profile the power is worked out for', () => {
    renderFrameControls(newFrameStore(OUTLINE_END_X_MM));

    expect(screen.getByText(FRAME_TIME_TEXT)).toBeInTheDocument();
    expect(screen.getByText(`about 0.05 W (${PROFILE_NAME}, assumed 10 W laser)`)).toBeInTheDocument();
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

  it('shows the profile error of an invalid margin and does not save it', () => {
    const store: AppStore = newFrameStore(OUTLINE_END_X_MM);

    renderFrameControls(store);
    fireEvent.change(screen.getByLabelText(MARGIN_LABEL), { target: { value: String(INVALID_MARGIN_MM) } });
    fireEvent.blur(screen.getByLabelText(MARGIN_LABEL));

    expect(screen.getByRole('alert')).toHaveTextContent(MARGIN_ERROR_TEXT);
    expect(getActiveProfile(store).frameMarginMm).toBeUndefined();
  });

  it('drops an unsaved margin and its error when another profile becomes active', () => {
    const store: AppStore = newFrameStore(OUTLINE_END_X_MM);
    const otherProfile: MachineProfile = newMachineProfile({
      name: OTHER_PROFILE_NAME,
      frameMarginMm: SAVED_MARGIN_MM,
    });

    renderFrameControls(store);
    fireEvent.change(screen.getByLabelText(MARGIN_LABEL), { target: { value: String(INVALID_MARGIN_MM) } });
    fireEvent.blur(screen.getByLabelText(MARGIN_LABEL));
    expect(screen.getByRole('alert')).toHaveTextContent(MARGIN_ERROR_TEXT);

    act(() => {
      store.dispatch(new MachineProfileSaved({ profile: otherProfile }));
      store.dispatch(new ActiveMachineProfileSelected({ profileId: otherProfile.id }));
    });

    expect(screen.queryByText(MARGIN_ERROR_TEXT)).not.toBeInTheDocument();
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

  it.each([[TOO_SLOW_SPEED_MM_PER_MIN], [OUT_OF_RANGE_SPEED_MM_PER_MIN]])(
    'shows the profile error of the speed %d and does not save it',
    (invalidSpeed: number) => {
      const store: AppStore = newFrameStore(OUTLINE_END_X_MM);

      renderFrameControls(store);
      fireEvent.change(screen.getByLabelText(SPEED_LABEL), { target: { value: String(invalidSpeed) } });
      fireEvent.blur(screen.getByLabelText(SPEED_LABEL));

      expect(screen.getByRole('alert')).toHaveTextContent(SPEED_ERROR_TEXT);
      expect(getActiveProfile(store).frameFeedMmPerMin).toBeUndefined();
    },
  );

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
    fireEvent.blur(screen.getByLabelText(SPEED_LABEL));
    expect(screen.getByRole('alert')).toHaveTextContent(SPEED_ERROR_TEXT);

    act(() => {
      store.dispatch(new MachineProfileSaved({ profile: otherProfile }));
      store.dispatch(new ActiveMachineProfileSelected({ profileId: otherProfile.id }));
    });

    expect(screen.queryByText(SPEED_ERROR_TEXT)).not.toBeInTheDocument();
    expect(screen.getByLabelText(SPEED_LABEL)).toHaveValue(DEFAULT_SPEED_TEXT);
  });

  it('turns the button off and names the edge and distance when the frame leaves the bed', () => {
    const store: AppStore = newFrameStore(getActiveProfile(newFrameStore(0)).workAreaXMm + OVERRUN_MM);

    renderFrameControls(store);

    expect(getFrameJobButton()).toBeDisabled();
    expect(screen.getByText(
      `The frame goes ${OVERRUN_MM} mm past the right edge of the bed. Move the job before framing.`,
    )).toBeInTheDocument();
  });

  it('turns the button off while no work position is known, with the reason on hover', async () => {
    const store: AppStore = newFrameStore(OUTLINE_END_X_MM);

    store.dispatch(newIdleStatusReceived(false));
    renderFrameControls(store);
    fireEvent.mouseEnter(getFrameJobButton().parentElement as HTMLElement);

    expect(getFrameJobButton()).toBeDisabled();
    expect(await screen.findByText('The laser has not reported its position yet.')).toBeInTheDocument();
  });

  it('turns the controls off while a frame runs', () => {
    const store: AppStore = newFrameStore(OUTLINE_END_X_MM);

    store.dispatch(new JobRunStarted({ startedAtMs: 0, kind: JOB_RUN_KIND.FRAME }));
    renderFrameControls(store);

    expect(getFrameJobButton()).toBeDisabled();
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
