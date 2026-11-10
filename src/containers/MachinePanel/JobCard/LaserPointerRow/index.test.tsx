import { act, cleanup, fireEvent, render, screen } from '@testing-library/react';
import { Provider } from 'react-redux';
import { LaserPointerRow } from '.';
import { ENTER_KEY, SPACE_KEY } from '../../../../utils/browser/browser.events.constants';
import { GRBL_CONNECTION_STATUS, GRBL_MACHINE_STATE } from '../../../../utils/grbl/grbl.constants';
import type { GrblConnectionStatus, GrblMachineState } from '../../../../utils/grbl/grbl.constants';
import type { GrblResolvedStatus } from '../../../../utils/grbl/interfaces/GrblResolvedStatus';
import { MACHINE_COMMAND } from '../../../../utils/machine/machine.commands';
import type { MachineProfile } from '../../../../utils/profiles/interfaces/MachineProfile';
import { newMachineProfile } from '../../../../utils/profiles/new.machine.profile';
import type { Action } from '../../../../utils/states/action';
import { ConnectionStatusChanged } from '../../../../utils/states/grbl.connection.state';
import {
  LaserPointerFireRequested,
  LaserPointerFiringStarted,
  LaserPointerPowerChanged,
  LaserPointerReleaseRequested,
  selectLaserPointerPowerPercent,
} from '../../../../utils/states/laser.pointer.state';
import { ActiveMachineProfileSelected, MachineProfileSaved } from '../../../../utils/states/machine.profile.state';
import {
  MachineLineRequested,
  MachineResetRequested,
  MachineStatusReceived,
  MachineStopRequested,
} from '../../../../utils/states/machine.status.state';
import { newStore } from '../../../../utils/states/new.store';
import type { AppStore } from '../../../../utils/states/new.store';

const FIRE_LABEL = 'Hold to fire';
const LASER_ON_LABEL = 'LASER ON';
const AIR_ASSIST_LABEL = 'Air assist';
const POWER_LABEL = 'Pointer power';
const SECONDARY_POINTER_BUTTON = 2;
const ARROW_RIGHT_KEY_CODE = 39;
const UNMAPPED_KEY = 'a';
const MAX_POWER_WATTS = 10;
const POWER_PERCENT = 3;
const WATTS_PATTERN = /0\.30 W/;
const ANY_WATTS_PATTERN = / W$/;
const FIRMWARE_NOTE_TEXT = 'Some firmwares keep the laser off while the head stands still. It switches off when you '
  + 'let go, when the window loses focus, after 10 seconds, or on any stop or alarm.';
const DETAILS_LABEL = 'Laser pointer details';
const POWER_FIGURE_TEXT = '3 %';

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

const openDetails = (): void => {
  fireEvent.click(screen.getByRole('button', { name: DETAILS_LABEL }));
};

const renderLaserPointerRow = (store: AppStore): void => {
  render(
    <Provider store={store}>
      <LaserPointerRow />
    </Provider>,
  );
};

const changeConnection = (store: AppStore, connectionStatus: GrblConnectionStatus): void => {
  act(() => {
    store.dispatch(new ConnectionStatusChanged({ connectionStatus }));
  });
};

const connect = (store: AppStore): void => {
  changeConnection(store, GRBL_CONNECTION_STATUS.CONNECTED);
};

const receiveState = (store: AppStore, machineState: GrblMachineState): void => {
  act(() => {
    store.dispatch(new MachineStatusReceived({ status: { ...NEW_STATUS, machineState } }));
  });
};

const connectIdle = (store: AppStore): void => {
  connect(store);
  receiveState(store, GRBL_MACHINE_STATE.IDLE);
};

const activateProfile = (store: AppStore, overrides: Partial<MachineProfile> = {}): void => {
  const profile: MachineProfile = newMachineProfile(overrides);

  act(() => {
    store.dispatch(new MachineProfileSaved({ profile }));
    store.dispatch(new ActiveMachineProfileSelected({ profileId: profile.id }));
  });
};

const getDispatched = <TAction extends object>(
  dispatchSpy: ReturnType<typeof vi.spyOn>,
  actionClass: new (...args: never[]) => TAction,
): TAction[] => {
  const dispatchedActions: TAction[] = [];

  for (const [dispatched] of dispatchSpy.mock.calls as unknown[][]) {
    if (dispatched instanceof actionClass) {
      dispatchedActions.push(dispatched);
    }
  }

  return dispatchedActions;
};

const getRequestedLines = (dispatchSpy: ReturnType<typeof vi.spyOn>): string[] =>
  getDispatched(dispatchSpy, MachineLineRequested).map(
    (dispatched: MachineLineRequested): string => dispatched.payload.line,
  );

describe(LaserPointerRow.name, () => {
  it('requests fire on pointer down', () => {
    const store: AppStore = newStore();
    const dispatchSpy = vi.spyOn(store, 'dispatch');

    renderLaserPointerRow(store);
    connectIdle(store);
    fireEvent.pointerDown(screen.getByRole('button', { name: FIRE_LABEL }));

    expect(getDispatched(dispatchSpy, LaserPointerFireRequested)).toHaveLength(1);
  });

  it('ignores a pointer down from a non-primary button', () => {
    const store: AppStore = newStore();
    const dispatchSpy = vi.spyOn(store, 'dispatch');

    renderLaserPointerRow(store);
    connectIdle(store);
    fireEvent.pointerDown(screen.getByRole('button', { name: FIRE_LABEL }), { button: SECONDARY_POINTER_BUTTON });

    expect(getDispatched(dispatchSpy, LaserPointerFireRequested)).toHaveLength(0);
  });

  it('requests release when focus leaves the button during a key hold', () => {
    const store: AppStore = newStore();
    const dispatchSpy = vi.spyOn(store, 'dispatch');

    renderLaserPointerRow(store);
    connectIdle(store);
    const fireButton: HTMLElement = screen.getByRole('button', { name: FIRE_LABEL });

    fireEvent.keyDown(fireButton, { key: SPACE_KEY });
    fireEvent.blur(fireButton);

    expect(getDispatched(dispatchSpy, LaserPointerReleaseRequested)).toHaveLength(1);
  });

  it('requests release when the card unmounts during a hold', () => {
    const store: AppStore = newStore();
    const dispatchSpy = vi.spyOn(store, 'dispatch');

    renderLaserPointerRow(store);
    connectIdle(store);
    fireEvent.pointerDown(screen.getByRole('button', { name: FIRE_LABEL }));
    cleanup();

    expect(getDispatched(dispatchSpy, LaserPointerReleaseRequested)).toHaveLength(1);
  });

  it.each(['pointerUp', 'pointerLeave', 'pointerCancel'] as const)('requests release on %s', (eventName) => {
    const store: AppStore = newStore();
    const dispatchSpy = vi.spyOn(store, 'dispatch');

    renderLaserPointerRow(store);
    connectIdle(store);
    const fireButton: HTMLElement = screen.getByRole('button', { name: FIRE_LABEL });

    fireEvent.pointerDown(fireButton);
    fireEvent[eventName](fireButton);

    expect(getDispatched(dispatchSpy, LaserPointerReleaseRequested)).toHaveLength(1);
  });

  it.each([SPACE_KEY, ENTER_KEY])('fires on key %j down, releases on key up, ignores repeat', (key: string) => {
    const store: AppStore = newStore();
    const dispatchSpy = vi.spyOn(store, 'dispatch');

    renderLaserPointerRow(store);
    connectIdle(store);
    const fireButton: HTMLElement = screen.getByRole('button', { name: FIRE_LABEL });

    fireEvent.keyDown(fireButton, { key });
    fireEvent.keyDown(fireButton, { key, repeat: true });
    fireEvent.keyDown(fireButton, { key, repeat: true });

    expect(getDispatched(dispatchSpy, LaserPointerFireRequested)).toHaveLength(1);

    fireEvent.keyUp(fireButton, { key });

    expect(getDispatched(dispatchSpy, LaserPointerReleaseRequested)).toHaveLength(1);
  });

  it('ignores other keys', () => {
    const store: AppStore = newStore();
    const dispatchSpy = vi.spyOn(store, 'dispatch');

    renderLaserPointerRow(store);
    connectIdle(store);
    const fireButton: HTMLElement = screen.getByRole('button', { name: FIRE_LABEL });

    fireEvent.keyDown(fireButton, { key: UNMAPPED_KEY });
    fireEvent.keyUp(fireButton, { key: UNMAPPED_KEY });

    expect(getDispatched(dispatchSpy, LaserPointerFireRequested)).toHaveLength(0);
    expect(getDispatched(dispatchSpy, LaserPointerReleaseRequested)).toHaveLength(0);
  });

  it('shows LASER ON while the pointer is firing', () => {
    const store: AppStore = newStore();

    renderLaserPointerRow(store);
    connectIdle(store);

    expect(screen.queryByText(LASER_ON_LABEL)).not.toBeInTheDocument();

    act(() => {
      store.dispatch(new LaserPointerFiringStarted());
    });

    expect(screen.getByRole('button', { name: LASER_ON_LABEL })).toBeInTheDocument();
  });

  it('disables the fire button while disconnected and when the machine is not Idle', () => {
    const store: AppStore = newStore();

    renderLaserPointerRow(store);

    expect(screen.getByRole('button', { name: FIRE_LABEL })).toBeDisabled();

    connect(store);
    receiveState(store, GRBL_MACHINE_STATE.RUN);

    expect(screen.getByRole('button', { name: FIRE_LABEL })).toBeDisabled();

    receiveState(store, GRBL_MACHINE_STATE.IDLE);

    expect(screen.getByRole('button', { name: FIRE_LABEL })).toBeEnabled();
  });

  it('keeps the fire button enabled while firing when the state leaves Idle, so release still works', () => {
    const store: AppStore = newStore();
    const dispatchSpy = vi.spyOn(store, 'dispatch');

    renderLaserPointerRow(store);
    connectIdle(store);
    act(() => {
      store.dispatch(new LaserPointerFiringStarted());
    });
    receiveState(store, GRBL_MACHINE_STATE.RUN);
    const laserOnButton: HTMLElement = screen.getByRole('button', { name: LASER_ON_LABEL });

    expect(laserOnButton).toBeEnabled();

    fireEvent.pointerUp(laserOnButton);

    expect(getDispatched(dispatchSpy, LaserPointerReleaseRequested)).toHaveLength(1);
  });

  it('stores the slider power in the state and shows the approximate watts', () => {
    const store: AppStore = newStore();

    renderLaserPointerRow(store);
    activateProfile(store, { maxPowerWatts: MAX_POWER_WATTS });
    act(() => {
      store.dispatch(new LaserPointerPowerChanged({ percent: POWER_PERCENT }));
    });

    expect(selectLaserPointerPowerPercent(store.getState())).toBe(POWER_PERCENT);
    expect(screen.getByText(POWER_FIGURE_TEXT)).toBeInTheDocument();

    openDetails();

    expect(screen.getByText(WATTS_PATTERN)).toBeInTheDocument();
    expect(screen.getByRole('slider', { name: POWER_LABEL })).toHaveAttribute('aria-valuenow', String(POWER_PERCENT));
  });

  it('dispatches the power change from the slider', () => {
    const store: AppStore = newStore();
    const dispatchSpy = vi.spyOn(store, 'dispatch');

    renderLaserPointerRow(store);
    fireEvent.keyDown(screen.getByRole('slider', { name: POWER_LABEL }), {
      key: 'ArrowRight',
      keyCode: ARROW_RIGHT_KEY_CODE,
    });

    expect(getDispatched(dispatchSpy, LaserPointerPowerChanged)).toHaveLength(1);
  });

  it('hides the watts without an active profile', () => {
    renderLaserPointerRow(newStore());
    openDetails();

    expect(screen.queryByText(ANY_WATTS_PATTERN)).not.toBeInTheDocument();
  });

  it('hides air assist without the profile flag', () => {
    const store: AppStore = newStore();

    renderLaserPointerRow(store);
    activateProfile(store, { hasAirAssist: false });
    openDetails();

    expect(screen.queryByRole('switch', { name: AIR_ASSIST_LABEL })).not.toBeInTheDocument();
  });

  it('sends M8 then M9 when air assist is toggled, and resets on disconnect', () => {
    const store: AppStore = newStore();
    const dispatchSpy = vi.spyOn(store, 'dispatch');

    renderLaserPointerRow(store);
    activateProfile(store, { hasAirAssist: true });
    openDetails();

    expect(screen.getByRole('switch', { name: AIR_ASSIST_LABEL })).toBeDisabled();

    connectIdle(store);
    fireEvent.click(screen.getByRole('switch', { name: AIR_ASSIST_LABEL }));

    expect(screen.getByRole('switch', { name: AIR_ASSIST_LABEL })).toBeChecked();

    fireEvent.click(screen.getByRole('switch', { name: AIR_ASSIST_LABEL }));

    expect(getRequestedLines(dispatchSpy)).toEqual([MACHINE_COMMAND.AIR_ON, MACHINE_COMMAND.AIR_OFF]);

    fireEvent.click(screen.getByRole('switch', { name: AIR_ASSIST_LABEL }));
    changeConnection(store, GRBL_CONNECTION_STATUS.DISCONNECTED);

    expect(screen.getByRole('switch', { name: AIR_ASSIST_LABEL })).not.toBeChecked();
  });

  it.each([
    ['Stop', (): Action<unknown> => new MachineStopRequested()],
    ['Reset', (): Action<unknown> => new MachineResetRequested()],
  ])('resets air assist on %s, since the soft reset turns the coolant off', (
    _requestName: string,
    newRequest: () => Action<unknown>,
  ) => {
    const store: AppStore = newStore();

    renderLaserPointerRow(store);
    activateProfile(store, { hasAirAssist: true });
    connectIdle(store);
    openDetails();
    fireEvent.click(screen.getByRole('switch', { name: AIR_ASSIST_LABEL }));

    expect(screen.getByRole('switch', { name: AIR_ASSIST_LABEL })).toBeChecked();

    act(() => {
      store.dispatch(newRequest());
    });

    expect(screen.getByRole('switch', { name: AIR_ASSIST_LABEL })).not.toBeChecked();
  });

  it('keeps the row in sight while disconnected, with the fire button off', () => {
    renderLaserPointerRow(newStore());

    expect(screen.getByRole('button', { name: FIRE_LABEL })).toBeDisabled();
  });

  it('enables the fire button once connected', () => {
    const store: AppStore = newStore();

    renderLaserPointerRow(store);
    connectIdle(store);

    expect(screen.getByRole('button', { name: FIRE_LABEL })).toBeEnabled();
  });

  it('keeps the one-row card to the controls and opens the switch-off note from the details button', () => {
    renderLaserPointerRow(newStore());

    expect(screen.queryByText(FIRMWARE_NOTE_TEXT)).not.toBeInTheDocument();

    openDetails();

    expect(screen.getByText(FIRMWARE_NOTE_TEXT)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: DETAILS_LABEL })).toHaveAttribute('aria-expanded', 'true');
  });
});
