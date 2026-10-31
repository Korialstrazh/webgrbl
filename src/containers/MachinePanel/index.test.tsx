import { act, fireEvent, render, screen } from '@testing-library/react';
import { Provider } from 'react-redux';
import { MachinePanel } from '.';
import { GRBL_CONNECTION_STATUS, GRBL_MACHINE_STATE } from '../../utils/grbl/grbl.constants';
import type { GrblResolvedStatus } from '../../utils/grbl/interfaces/GrblResolvedStatus';
import { ConnectionStatusChanged } from '../../utils/states/grbl.connection.state';
import {
  MachineResetRequested,
  MachineStatusReceived,
  MachineUnlockRequested,
} from '../../utils/states/machine.status.state';
import { newStore } from '../../utils/states/new.store';
import type { AppStore } from '../../utils/states/new.store';

const WORK_POSITION_TEXT = '8.000';
const MACHINE_POSITION_TEXT = '10.500';
const FEED_RATE = 1200;
const SPINDLE_SPEED = 750;
const MISSING_VALUE_TEXT = '-';
const IDLE_LABEL = 'Idle';
const RUN_LABEL = 'Run';
const RESET_LABEL = 'Reset';
const UNLOCK_LABEL = 'Unlock';
const STOP_LABEL = 'Stop';
const DISABLED_REGION_SELECTOR = '[aria-disabled="true"]';
const CONTROL_SELECTOR = 'button, input';
const COMING_SOON_TITLES: readonly string[] = ['Laser pointer', 'Pre-flight check', 'Job'];

const NEW_STATUS: GrblResolvedStatus = {
  machineState: GRBL_MACHINE_STATE.RUN,
  machineSubstate: undefined,
  machinePosition: { x: 10.5, y: 0, z: 0 },
  workPosition: { x: 8, y: 1.25, z: 0 },
  workCoordinateOffset: undefined,
  plannerBlocksAvailable: undefined,
  rxBytesAvailable: undefined,
  feedRate: FEED_RATE,
  spindleSpeed: SPINDLE_SPEED,
  overrides: undefined,
};

const renderMachinePanel = (store: AppStore = newStore(), isWide: boolean = true): AppStore => {
  render(
    <Provider store={store}>
      <MachinePanel isWide={isWide} />
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

describe(MachinePanel.name, () => {
  it('shows dashes while there is no status', () => {
    renderMachinePanel();

    expect(screen.getAllByText(MISSING_VALUE_TEXT).length).toBeGreaterThan(0);
    expect(screen.queryByText(IDLE_LABEL)).not.toBeInTheDocument();
  });

  it('shows the state, positions with three decimals, feed and power after a status report', () => {
    const store: AppStore = renderMachinePanel();

    act(() => {
      store.dispatch(new MachineStatusReceived({ status: NEW_STATUS }));
    });

    expect(screen.getByText(RUN_LABEL)).toBeInTheDocument();
    expect(screen.getByText(new RegExp(WORK_POSITION_TEXT))).toBeInTheDocument();
    expect(screen.getByText(new RegExp(MACHINE_POSITION_TEXT))).toBeInTheDocument();
    expect(screen.getByText(String(FEED_RATE))).toBeInTheDocument();
    expect(screen.getByText(String(SPINDLE_SPEED))).toBeInTheDocument();
  });

  it('disables reset and unlock while disconnected', () => {
    renderMachinePanel();

    expect(screen.getByRole('button', { name: RESET_LABEL })).toBeDisabled();
    expect(screen.getByRole('button', { name: UNLOCK_LABEL })).toBeDisabled();
  });

  it('enables reset when connected, and unlock only in alarm', () => {
    const store: AppStore = renderMachinePanel();

    connect(store);
    receiveState(store, GRBL_MACHINE_STATE.IDLE);

    expect(screen.getByRole('button', { name: RESET_LABEL })).toBeEnabled();
    expect(screen.getByRole('button', { name: UNLOCK_LABEL })).toBeDisabled();

    receiveState(store, GRBL_MACHINE_STATE.ALARM);

    expect(screen.getByRole('button', { name: UNLOCK_LABEL })).toBeEnabled();
  });

  it('dispatches the reset and unlock requests when their buttons are clicked', () => {
    const store: AppStore = newStore();
    const dispatchSpy = vi.spyOn(store, 'dispatch');

    renderMachinePanel(store);
    connect(store);
    receiveState(store, GRBL_MACHINE_STATE.ALARM);
    fireEvent.click(screen.getByRole('button', { name: RESET_LABEL }));
    fireEvent.click(screen.getByRole('button', { name: UNLOCK_LABEL }));

    expect(dispatchSpy).toHaveBeenCalledWith(expect.any(MachineResetRequested));
    expect(dispatchSpy).toHaveBeenCalledWith(expect.any(MachineUnlockRequested));
  });

  it('shows every coming-soon card', () => {
    renderMachinePanel();

    for (const cardTitle of COMING_SOON_TITLES) {
      expect(screen.getByRole('heading', { name: cardTitle })).toBeInTheDocument();
    }
  });

  it('every coming-soon control in the machine panel dispatches nothing', () => {
    const store: AppStore = newStore();

    renderMachinePanel(store);
    connect(store);

    const dispatchSpy = vi.spyOn(store, 'dispatch');
    const disabledRegions: NodeListOf<Element> = document.querySelectorAll(DISABLED_REGION_SELECTOR);
    let clickedControlCount = 0;

    for (const disabledRegion of disabledRegions) {
      for (const control of disabledRegion.querySelectorAll(CONTROL_SELECTOR)) {
        fireEvent.click(control);
        clickedControlCount++;
      }
    }

    expect(disabledRegions.length).toBeGreaterThan(0);
    expect(clickedControlCount).toBeGreaterThan(0);
    expect(dispatchSpy).not.toHaveBeenCalled();
  });

  it('renders STOP only in a wide window', () => {
    const { unmount } = render(
      <Provider store={newStore()}>
        <MachinePanel isWide />
      </Provider>,
    );

    expect(screen.getByRole('button', { name: STOP_LABEL })).toBeInTheDocument();

    unmount();
    renderMachinePanel(newStore(), false);

    expect(screen.queryByRole('button', { name: STOP_LABEL })).not.toBeInTheDocument();
  });
});
