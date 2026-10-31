import { act, fireEvent, render, screen } from '@testing-library/react';
import { Provider } from 'react-redux';
import { MachineControlButtons } from '.';
import { GRBL_CONNECTION_STATUS, GRBL_MACHINE_STATE } from '../../utils/grbl/grbl.constants';
import type { GrblResolvedStatus } from '../../utils/grbl/interfaces/GrblResolvedStatus';
import { ConnectionStatusChanged } from '../../utils/states/grbl.connection.state';
import { MachineResetRequested, MachineStatusReceived, MachineStopRequested } from '../../utils/states/machine.status.state';
import { newStore } from '../../utils/states/new.store';
import type { AppStore } from '../../utils/states/new.store';

const STOP_LABEL = 'Stop';
const RESET_LABEL = 'Reset';
const UNLOCK_LABEL = 'Unlock';

const NEW_STATUS: GrblResolvedStatus = {
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

const renderMachineControlButtons = (store: AppStore = newStore()): AppStore => {
  render(
    <Provider store={store}>
      <MachineControlButtons />
    </Provider>,
  );

  return store;
};

const connect = (store: AppStore): void => {
  act(() => {
    store.dispatch(new ConnectionStatusChanged({ connectionStatus: GRBL_CONNECTION_STATUS.CONNECTED }));
  });
};

const receiveState = (store: AppStore, machineState: GrblResolvedStatus['machineState']): void => {
  act(() => {
    store.dispatch(new MachineStatusReceived({ status: { ...NEW_STATUS, machineState } }));
  });
};

describe(MachineControlButtons.name, () => {
  it('disables every button while disconnected', () => {
    renderMachineControlButtons();

    expect(screen.getByRole('button', { name: STOP_LABEL })).toBeDisabled();
    expect(screen.getByRole('button', { name: RESET_LABEL })).toBeDisabled();
    expect(screen.getByRole('button', { name: UNLOCK_LABEL })).toBeDisabled();
  });

  it('enables stop and reset when connected, and unlock only in alarm', () => {
    const store: AppStore = renderMachineControlButtons();

    connect(store);
    receiveState(store, GRBL_MACHINE_STATE.IDLE);

    expect(screen.getByRole('button', { name: STOP_LABEL })).toBeEnabled();
    expect(screen.getByRole('button', { name: RESET_LABEL })).toBeEnabled();
    expect(screen.getByRole('button', { name: UNLOCK_LABEL })).toBeDisabled();

    receiveState(store, GRBL_MACHINE_STATE.ALARM);

    expect(screen.getByRole('button', { name: UNLOCK_LABEL })).toBeEnabled();
  });

  it('dispatches the stop request when stop is clicked', () => {
    const store: AppStore = newStore();
    const dispatchSpy = vi.spyOn(store, 'dispatch');

    renderMachineControlButtons(store);
    connect(store);
    fireEvent.click(screen.getByRole('button', { name: STOP_LABEL }));

    expect(dispatchSpy).toHaveBeenCalledWith(expect.any(MachineStopRequested));
    expect(dispatchSpy).not.toHaveBeenCalledWith(expect.any(MachineResetRequested));
  });
});
