import { act, fireEvent, render, screen } from '@testing-library/react';
import { Provider } from 'react-redux';
import { MoveCard } from '.';
import { GRBL_CONNECTION_STATUS, GRBL_MACHINE_STATE } from '../../../utils/grbl/grbl.constants';
import type { GrblMachineState } from '../../../utils/grbl/grbl.constants';
import type { GrblResolvedStatus } from '../../../utils/grbl/interfaces/GrblResolvedStatus';
import { MACHINE_COMMAND } from '../../../utils/machine/machine.commands';
import type { MachineProfile } from '../../../utils/profiles/interfaces/MachineProfile';
import { newMachineProfile } from '../../../utils/profiles/new.machine.profile';
import { ConnectionStatusChanged } from '../../../utils/states/grbl.connection.state';
import { ActiveMachineProfileSelected, MachineProfileSaved } from '../../../utils/states/machine.profile.state';
import { MachineLineRequested, MachineStatusReceived } from '../../../utils/states/machine.status.state';
import { newStore } from '../../../utils/states/new.store';
import type { AppStore } from '../../../utils/states/new.store';

const JOG_NORTH_EAST_LABEL = 'Jog up and right';
const JOG_ORIGIN_LABEL = 'Origin';
const HOME_LABEL = 'Home';
const SET_ZERO_LABEL = 'Set zero';
const STEP_ONE_LABEL = '1 mm';
const JOG_SPEED_LABEL = 'Jog speed';
const JOG_NORTH_EAST_STEP_ONE_LINE = '$J=G91 G21 X1 Y1 F1500';
const GO_TO_ZERO_LINE = '$J=G90 G21 X0 Y0 F1500';
const DEFAULT_JOG_NORTH_EAST_LINE = '$J=G91 G21 X10 Y10 F1500';
const NEW_JOG_FEED_RATE = 2400;
const NEW_JOG_FEED_RATE_TEXT = String(NEW_JOG_FEED_RATE);
const DEFAULT_JOG_FEED_RATE_TEXT = '1500';

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

  it('disables the jog pad while disconnected and in Run, enables it in Idle and Jog', () => {
    const store: AppStore = newStore();

    renderMoveCard(store);

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

    receiveState(store, GRBL_MACHINE_STATE.ALARM);

    fireEvent.click(screen.getByRole('button', { name: HOME_LABEL }));

    expect(getRequestedLines(dispatchSpy)).toEqual([MACHINE_COMMAND.HOME]);
  });

  it('enables Set zero only in Idle and sends the exact line', () => {
    const store: AppStore = newStore();
    const dispatchSpy = vi.spyOn(store, 'dispatch');

    renderMoveCard(store);
    connect(store);
    receiveState(store, GRBL_MACHINE_STATE.JOG);

    expect(screen.getByRole('button', { name: SET_ZERO_LABEL })).toBeDisabled();

    receiveState(store, GRBL_MACHINE_STATE.IDLE);

    fireEvent.click(screen.getByRole('button', { name: SET_ZERO_LABEL }));

    expect(getRequestedLines(dispatchSpy)).toEqual([MACHINE_COMMAND.SET_WORK_ZERO]);
  });

  it('disables the jog speed without a profile and shows the default', () => {
    renderMoveCard(newStore());

    const jogSpeedInput: HTMLElement = screen.getByRole('spinbutton', { name: JOG_SPEED_LABEL });

    expect(jogSpeedInput).toBeDisabled();
    expect(jogSpeedInput).toHaveValue(DEFAULT_JOG_FEED_RATE_TEXT);
  });

  it('saves the profile with the new jog speed on blur', () => {
    const store: AppStore = newStore();
    const dispatchSpy = vi.spyOn(store, 'dispatch');

    renderMoveCard(store);

    const profile: MachineProfile = activateProfile(store);
    const jogSpeedInput: HTMLElement = screen.getByRole('spinbutton', { name: JOG_SPEED_LABEL });

    fireEvent.change(jogSpeedInput, { target: { value: NEW_JOG_FEED_RATE_TEXT } });
    fireEvent.blur(jogSpeedInput);

    expect(dispatchSpy).toHaveBeenCalledWith(
      expect.objectContaining({ payload: { profile: { ...profile, jogFeedRate: NEW_JOG_FEED_RATE } } }),
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
