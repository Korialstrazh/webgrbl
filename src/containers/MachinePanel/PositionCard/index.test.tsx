import { act, fireEvent, render, screen, within } from '@testing-library/react';
import { vi } from 'vitest';
import { Provider } from 'react-redux';
import { PositionCard } from '.';
import { GRBL_CONNECTION_STATUS, GRBL_MACHINE_STATE } from '../../../utils/grbl/grbl.constants';
import type { GrblAxisPosition } from '../../../utils/grbl/interfaces/GrblAxisPosition';
import type { GrblResolvedStatus } from '../../../utils/grbl/interfaces/GrblResolvedStatus';
import { MISSING_VALUE_TEXT } from '../../../utils/missing.value.constants';
import { ConnectionStatusChanged } from '../../../utils/states/grbl.connection.state';
import { MachineLineRequested, MachineStatusReceived } from '../../../utils/states/machine.status.state';
import { MACHINE_COMMAND } from '../../../utils/machine/machine.commands';
import { newStore } from '../../../utils/states/new.store';
import type { AppStore } from '../../../utils/states/new.store';
import { selectIsConnectionPopoverOpen } from '../../../utils/states/ui.overlay.state';

const DISCONNECTED_TEXT = 'Connect to see the position';
const WORK_ROW_NAME = 'Work position';
const SET_ZERO_LABEL = 'Set zero here';

const newStatus = (workPosition: GrblAxisPosition, machinePosition: GrblAxisPosition): GrblResolvedStatus => ({
  machineState: GRBL_MACHINE_STATE.IDLE,
  machineSubstate: undefined,
  machinePosition,
  workPosition,
  workCoordinateOffset: undefined,
  plannerBlocksAvailable: undefined,
  rxBytesAvailable: undefined,
  feedRate: 0,
  spindleSpeed: 0,
  overrides: undefined,
});

const renderCard = (store: AppStore): void => {
  render(
    <Provider store={store}>
      <PositionCard />
    </Provider>,
  );
};

const connect = (store: AppStore): void => {
  act(() => {
    store.dispatch(new ConnectionStatusChanged({ connectionStatus: GRBL_CONNECTION_STATUS.CONNECTED }));
  });
};

const receive = (store: AppStore, status: GrblResolvedStatus): void => {
  act(() => {
    store.dispatch(new MachineStatusReceived({ status }));
  });
};

const getWorkRow = (): HTMLElement => screen.getByLabelText(WORK_ROW_NAME);

const getWorkRowTexts = (): string[] =>
  within(getWorkRow()).getAllByRole('definition').map((value: HTMLElement): string => value.textContent ?? '');

describe(PositionCard.name, () => {
  it('while disconnected shows its heading with a plug badge and no numbers', () => {
    const store: AppStore = newStore();

    renderCard(store);

    expect(screen.getByRole('heading', { name: 'Position' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: DISCONNECTED_TEXT })).toBeInTheDocument();
    expect(screen.queryByRole('table')).not.toBeInTheDocument();
  });

  it('opens the connection popover from its plug badge', () => {
    const store: AppStore = newStore();

    renderCard(store);
    fireEvent.click(screen.getByRole('button', { name: DISCONNECTED_TEXT }));

    expect(selectIsConnectionPopoverOpen(store.getState())).toBe(true);
  });

  it('while connected shows the work position in one row, the laser position in its tooltip, per report', () => {
    const store: AppStore = newStore();

    renderCard(store);
    connect(store);

    expect(getWorkRowTexts()).toEqual([MISSING_VALUE_TEXT, MISSING_VALUE_TEXT, MISSING_VALUE_TEXT]);

    receive(store, newStatus({ x: 8, y: 1.25, z: 0 }, { x: 10.5, y: 0, z: -1 }));

    expect(getWorkRowTexts()).toEqual(['8.000', '1.250', '0.000']);
    expect(within(getWorkRow()).getAllByRole('term').map((axis: HTMLElement): string => axis.textContent ?? ''))
      .toEqual(['X', 'Y', 'Z']);
    expect(getWorkRow()).toHaveAttribute('title', 'Laser position: X 10.500, Y 0.000, Z -1.000');

    receive(store, newStatus({ x: 18, y: 1.25, z: 0 }, { x: 20.5, y: 0, z: -1 }));

    expect(getWorkRowTexts()).toEqual(['18.000', '1.250', '0.000']);
    expect(screen.queryByRole('button', { name: DISCONNECTED_TEXT })).not.toBeInTheDocument();
  });

  it('sets the work zero from the small button in its title row, only while idle', () => {
    const store: AppStore = newStore();
    const dispatchSpy = vi.spyOn(store, 'dispatch');
    const ZERO: GrblAxisPosition = { x: 0, y: 0, z: 0 };

    renderCard(store);
    connect(store);
    receive(store, { ...newStatus(ZERO, ZERO), machineState: GRBL_MACHINE_STATE.JOG });

    expect(screen.getByRole('button', { name: SET_ZERO_LABEL })).toBeDisabled();

    receive(store, newStatus(ZERO, ZERO));
    fireEvent.click(screen.getByRole('button', { name: SET_ZERO_LABEL }));

    expect(dispatchSpy).toHaveBeenCalledWith(new MachineLineRequested({ line: MACHINE_COMMAND.SET_WORK_ZERO }));
  });
});
