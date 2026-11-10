import { act, fireEvent, render, screen } from '@testing-library/react';
import { Provider } from 'react-redux';
import type { MockInstance } from 'vitest';
import { MoveCard } from '.';
import { GRBL_CONNECTION_STATUS, GRBL_MACHINE_STATE } from '../../../utils/grbl/grbl.constants';
import type { GrblMachineState } from '../../../utils/grbl/grbl.constants';
import type { GrblResolvedStatus } from '../../../utils/grbl/interfaces/GrblResolvedStatus';
import { MACHINE_COMMAND } from '../../../utils/machine/machine.commands';
import type { MachineProfile } from '../../../utils/profiles/interfaces/MachineProfile';
import { newMachineProfile } from '../../../utils/profiles/new.machine.profile';
import { MACHINE_JOG_FEED_RATE_MAX } from '../../../utils/profiles/machine.profile.constants';
import { ConnectRequested, ConnectionStatusChanged } from '../../../utils/states/grbl.connection.state';
import { LaserPointerFiringStarted, LaserPointerFiringStopped } from '../../../utils/states/laser.pointer.state';
import { ActiveMachineProfileSelected, MachineProfileSaved } from '../../../utils/states/machine.profile.state';
import { MachineLineRequested, MachineStatusReceived } from '../../../utils/states/machine.status.state';
import { newStore } from '../../../utils/states/new.store';
import type { AppDispatch, AppStore } from '../../../utils/states/new.store';
import { selectIsConnectionPopoverOpen } from '../../../utils/states/ui.overlay.state';
import { AntdTestProvider } from '../../../utils/test.support/antd.test.provider';

const JOG_NORTH_EAST_LABEL = 'Jog up and right';
const JOG_ORIGIN_LABEL = 'Origin';
const HOME_LABEL = 'Home';
const STEP_ONE_LABEL = '1 mm';
const DEFAULT_STEP_LABEL = '10 mm';
const JOG_SPEED_LABEL = 'Jog speed';
const JOG_NORTH_EAST_STEP_ONE_LINE = '$J=G91 G21 X1 Y1 F1500';
const GO_TO_ZERO_LINE = '$J=G90 G21 X0 Y0 F1500';
const DEFAULT_JOG_NORTH_EAST_LINE = '$J=G91 G21 X10 Y10 F1500';
const NEW_JOG_FEED_RATE = 2400;
const NEW_JOG_FEED_RATE_TEXT = String(NEW_JOG_FEED_RATE);
const DEFAULT_JOG_FEED_RATE_TEXT = '1500';
const EMPTY_INPUT_TEXT = '';
const TOO_FAST_JOG_FEED_RATE_TEXT = '99999';
const COLLAPSED_HINT_TEXT = 'Connect to move';
const SHOW_CONTROLS_LABEL = 'Show the move controls';
const HIDE_CONTROLS_LABEL = 'Hide the move controls';
const ARIA_EXPANDED_ATTRIBUTE = 'aria-expanded';

const NEW_STATUS: GrblResolvedStatus = {
  machineState: GRBL_MACHINE_STATE.IDLE,
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

const renderMoveCard = (store: AppStore): void => {
  render(
    <Provider store={store}>
      <MoveCard />
    </Provider>,
  );
};

const connect = (store: AppStore): void => {
  act(() => {
    store.dispatch(new ConnectionStatusChanged({ connectionStatus: GRBL_CONNECTION_STATUS.CONNECTED }));
  });
};

const receiveState = (store: AppStore, machineState: GrblMachineState): void => {
  act(() => {
    store.dispatch(new MachineStatusReceived({ status: { ...NEW_STATUS, machineState } }));
  });
};

const activateProfile = (store: AppStore, overrides: Partial<MachineProfile> = {}): MachineProfile => {
  const profile: MachineProfile = newMachineProfile(overrides);

  act(() => {
    store.dispatch(new MachineProfileSaved({ profile }));
    store.dispatch(new ActiveMachineProfileSelected({ profileId: profile.id }));
  });

  return profile;
};

const showControlsWhileDisconnected = (): void => {
  fireEvent.click(screen.getByRole('button', { name: SHOW_CONTROLS_LABEL }));
};

const getRequestedLines = (dispatchSpy: ReturnType<typeof vi.spyOn>): string[] => {
  const requestedLines: string[] = [];

  for (const [dispatched] of dispatchSpy.mock.calls as unknown[][]) {
    if (dispatched instanceof MachineLineRequested) {
      requestedLines.push(dispatched.payload.line);
    }
  }

  return requestedLines;
};

describe(MoveCard.name, () => {
  it('opens the connection popover from the plug and asks for no connection', () => {
    const store: AppStore = newStore();
    const dispatchSpy: MockInstance<AppDispatch> = vi.spyOn(store, 'dispatch');

    render(<Provider store={store}><AntdTestProvider><MoveCard /></AntdTestProvider></Provider>);
    fireEvent.click(screen.getByRole('button', { name: COLLAPSED_HINT_TEXT }));

    expect(selectIsConnectionPopoverOpen(store.getState())).toBe(true);
    expect(dispatchSpy).not.toHaveBeenCalledWith(expect.any(ConnectRequested));
  });

  it('collapses to one line with a plug badge while disconnected, without any move control', () => {
    renderMoveCard(newStore());

    expect(screen.getByRole('button', { name: COLLAPSED_HINT_TEXT })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: SHOW_CONTROLS_LABEL })).toHaveAttribute(ARIA_EXPANDED_ATTRIBUTE, 'false');
    expect(screen.queryByRole('button', { name: JOG_NORTH_EAST_LABEL })).not.toBeInTheDocument();
    expect(screen.queryByRole('spinbutton', { name: JOG_SPEED_LABEL })).not.toBeInTheDocument();
  });

  it('shows the disabled controls on Show while disconnected, still saying why, and hides them again on Hide', () => {
    renderMoveCard(newStore());

    showControlsWhileDisconnected();

    const hideButton: HTMLElement = screen.getByRole('button', { name: HIDE_CONTROLS_LABEL });

    expect(hideButton).toHaveAttribute(ARIA_EXPANDED_ATTRIBUTE, 'true');
    expect(document.getElementById(hideButton.getAttribute('aria-controls') ?? '')).toContainElement(
      screen.getByRole('button', { name: JOG_NORTH_EAST_LABEL }),
    );
    expect(screen.getByRole('button', { name: JOG_NORTH_EAST_LABEL })).toBeDisabled();
    expect(screen.getByRole('button', { name: COLLAPSED_HINT_TEXT })).toBeInTheDocument();

    fireEvent.click(hideButton);

    expect(screen.queryByRole('button', { name: JOG_NORTH_EAST_LABEL })).not.toBeInTheDocument();
  });

  it('opens the controls without a toggle once a laser is connected', () => {
    const store: AppStore = newStore();

    renderMoveCard(store);
    connect(store);

    expect(screen.getByRole('button', { name: JOG_NORTH_EAST_LABEL })).toBeInTheDocument();
    expect(screen.queryByRole('button', { name: SHOW_CONTROLS_LABEL })).not.toBeInTheDocument();
    expect(screen.queryByRole('button', { name: COLLAPSED_HINT_TEXT })).not.toBeInTheDocument();
  });

  it('jogs north-east at step 1 with the default feed rate', () => {
    const store: AppStore = newStore();
    const dispatchSpy = vi.spyOn(store, 'dispatch');

    renderMoveCard(store);
    connect(store);
    receiveState(store, GRBL_MACHINE_STATE.IDLE);

    fireEvent.click(screen.getByText(STEP_ONE_LABEL));
    fireEvent.click(screen.getByRole('button', { name: JOG_NORTH_EAST_LABEL }));

    expect(getRequestedLines(dispatchSpy)).toEqual([JOG_NORTH_EAST_STEP_ONE_LINE]);
  });

  it('jogs 10 mm by default and goes to work zero from the centre button', () => {
    const store: AppStore = newStore();
    const dispatchSpy = vi.spyOn(store, 'dispatch');

    renderMoveCard(store);
    connect(store);
    receiveState(store, GRBL_MACHINE_STATE.IDLE);

    fireEvent.click(screen.getByRole('button', { name: JOG_NORTH_EAST_LABEL }));
    fireEvent.click(screen.getByRole('button', { name: JOG_ORIGIN_LABEL }));

    expect(getRequestedLines(dispatchSpy)).toEqual([DEFAULT_JOG_NORTH_EAST_LINE, GO_TO_ZERO_LINE]);
  });

  it('keeps the step size out of the origin button, so it never reads as a move by that step', () => {
    const store: AppStore = newStore();

    renderMoveCard(store);
    connect(store);
    receiveState(store, GRBL_MACHINE_STATE.IDLE);

    const originButton: HTMLElement = screen.getByRole('button', { name: JOG_ORIGIN_LABEL });

    expect(originButton).not.toHaveTextContent(DEFAULT_STEP_LABEL);

    fireEvent.click(screen.getByText(STEP_ONE_LABEL));

    expect(originButton).not.toHaveTextContent(STEP_ONE_LABEL);
    expect(originButton).toHaveAccessibleName(JOG_ORIGIN_LABEL);
  });

  it('shows Origin as a home icon with its name in the aria-label and tooltip, and keeps the Home text', async () => {
    const store: AppStore = newStore();

    activateProfile(store, { hasHomingSwitches: true });
    renderMoveCard(store);
    connect(store);
    receiveState(store, GRBL_MACHINE_STATE.IDLE);

    expect(screen.getByRole('button', { name: HOME_LABEL })).toHaveTextContent(HOME_LABEL);

    const originButton: HTMLElement = screen.getByRole('button', { name: JOG_ORIGIN_LABEL });

    expect(originButton).not.toHaveTextContent(JOG_ORIGIN_LABEL);
    expect(originButton.querySelector('.anticon-home')).not.toBeNull();

    fireEvent.mouseEnter(originButton);

    expect(await screen.findByRole('tooltip')).toHaveTextContent(JOG_ORIGIN_LABEL);
  });

  it('disables the jog pad while disconnected and in Run, enables it in Idle and Jog', () => {
    const store: AppStore = newStore();

    renderMoveCard(store);
    showControlsWhileDisconnected();

    expect(screen.getByRole('button', { name: JOG_NORTH_EAST_LABEL })).toBeDisabled();

    connect(store);
    receiveState(store, GRBL_MACHINE_STATE.RUN);

    expect(screen.getByRole('button', { name: JOG_NORTH_EAST_LABEL })).toBeDisabled();
    expect(screen.getByRole('button', { name: JOG_ORIGIN_LABEL })).toBeDisabled();

    receiveState(store, GRBL_MACHINE_STATE.IDLE);

    expect(screen.getByRole('button', { name: JOG_NORTH_EAST_LABEL })).toBeEnabled();

    receiveState(store, GRBL_MACHINE_STATE.JOG);

    expect(screen.getByRole('button', { name: JOG_NORTH_EAST_LABEL })).toBeEnabled();
  });

  it('locks jog, go-to-zero and Home while the pointer fires', () => {
    const store: AppStore = newStore();
    const moveButtonLabels: string[] = [JOG_NORTH_EAST_LABEL, JOG_ORIGIN_LABEL, HOME_LABEL];

    renderMoveCard(store);
    activateProfile(store, { hasHomingSwitches: true });
    connect(store);
    receiveState(store, GRBL_MACHINE_STATE.IDLE);
    act(() => {
      store.dispatch(new LaserPointerFiringStarted());
    });

    for (const label of moveButtonLabels) {
      expect(screen.getByRole('button', { name: label })).toBeDisabled();
    }

    act(() => {
      store.dispatch(new LaserPointerFiringStopped());
    });

    for (const label of moveButtonLabels) {
      expect(screen.getByRole('button', { name: label })).toBeEnabled();
    }
  });

  it('hides Home without homing switches', () => {
    const store: AppStore = newStore();

    renderMoveCard(store);
    activateProfile(store, { hasHomingSwitches: false });
    connect(store);
    receiveState(store, GRBL_MACHINE_STATE.IDLE);

    expect(screen.queryByRole('button', { name: HOME_LABEL })).not.toBeInTheDocument();
  });

  it('enables Home in Alarm and Idle with homing switches, and sends $H', () => {
    const store: AppStore = newStore();
    const dispatchSpy = vi.spyOn(store, 'dispatch');

    renderMoveCard(store);
    activateProfile(store, { hasHomingSwitches: true });
    connect(store);
    receiveState(store, GRBL_MACHINE_STATE.RUN);

    expect(screen.getByRole('button', { name: HOME_LABEL })).toBeDisabled();
    expect(screen.queryByRole('button', { name: /^Set zero/ })).not.toBeInTheDocument();

    receiveState(store, GRBL_MACHINE_STATE.ALARM);

    fireEvent.click(screen.getByRole('button', { name: HOME_LABEL }));

    expect(getRequestedLines(dispatchSpy)).toEqual([MACHINE_COMMAND.HOME]);
  });

  it('disables the jog speed without a profile and shows the default', () => {
    renderMoveCard(newStore());
    showControlsWhileDisconnected();

    const jogSpeedInput: HTMLElement = screen.getByRole('spinbutton', { name: JOG_SPEED_LABEL });

    expect(jogSpeedInput).toBeDisabled();
    expect(jogSpeedInput).toHaveValue(DEFAULT_JOG_FEED_RATE_TEXT);
  });

  it('saves the profile with the new jog speed on blur', () => {
    const store: AppStore = newStore();
    const dispatchSpy = vi.spyOn(store, 'dispatch');

    renderMoveCard(store);
    showControlsWhileDisconnected();

    const profile: MachineProfile = activateProfile(store);
    const jogSpeedInput: HTMLElement = screen.getByRole('spinbutton', { name: JOG_SPEED_LABEL });

    fireEvent.change(jogSpeedInput, { target: { value: NEW_JOG_FEED_RATE_TEXT } });
    fireEvent.blur(jogSpeedInput);

    expect(dispatchSpy).toHaveBeenCalledWith(
      expect.objectContaining({ payload: { profile: { ...profile, jogFeedRate: NEW_JOG_FEED_RATE } } }),
    );
  });

  it('keeps a cleared jog speed empty while typing and restores the saved value on blur', () => {
    const store: AppStore = newStore();

    renderMoveCard(store);
    showControlsWhileDisconnected();
    activateProfile(store, { jogFeedRate: NEW_JOG_FEED_RATE });

    const dispatchSpy = vi.spyOn(store, 'dispatch');
    const jogSpeedInput: HTMLElement = screen.getByRole('spinbutton', { name: JOG_SPEED_LABEL });

    fireEvent.change(jogSpeedInput, { target: { value: EMPTY_INPUT_TEXT } });

    expect(jogSpeedInput).toHaveValue(EMPTY_INPUT_TEXT);

    fireEvent.blur(jogSpeedInput);

    expect(jogSpeedInput).toHaveValue(NEW_JOG_FEED_RATE_TEXT);
    expect(dispatchSpy).not.toHaveBeenCalled();
  });

  it('holds a jog speed above the limit at the limit on blur', () => {
    const store: AppStore = newStore();

    renderMoveCard(store);
    showControlsWhileDisconnected();

    const profile: MachineProfile = activateProfile(store);
    const dispatchSpy = vi.spyOn(store, 'dispatch');
    const jogSpeedInput: HTMLElement = screen.getByRole('spinbutton', { name: JOG_SPEED_LABEL });

    fireEvent.change(jogSpeedInput, { target: { value: TOO_FAST_JOG_FEED_RATE_TEXT } });

    expect(jogSpeedInput).toHaveValue(TOO_FAST_JOG_FEED_RATE_TEXT);

    fireEvent.blur(jogSpeedInput);

    expect(dispatchSpy).toHaveBeenCalledWith(
      expect.objectContaining({ payload: { profile: { ...profile, jogFeedRate: MACHINE_JOG_FEED_RATE_MAX } } }),
    );
  });

  it('jogs with the saved jog speed of the active profile', () => {
    const store: AppStore = newStore();
    const dispatchSpy = vi.spyOn(store, 'dispatch');

    renderMoveCard(store);
    activateProfile(store, { jogFeedRate: NEW_JOG_FEED_RATE });
    connect(store);
    receiveState(store, GRBL_MACHINE_STATE.IDLE);

    fireEvent.click(screen.getByRole('button', { name: JOG_NORTH_EAST_LABEL }));

    expect(getRequestedLines(dispatchSpy)).toEqual([`$J=G91 G21 X10 Y10 F${NEW_JOG_FEED_RATE}`]);
  });
});
