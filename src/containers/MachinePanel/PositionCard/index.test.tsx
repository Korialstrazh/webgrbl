import { act, fireEvent, render, screen, within } from '@testing-library/react';
import { Provider } from 'react-redux';
import { PositionCard } from '.';
import { GRBL_CONNECTION_STATUS, GRBL_MACHINE_STATE } from '../../../utils/grbl/grbl.constants';
import type { GrblAxisPosition } from '../../../utils/grbl/interfaces/GrblAxisPosition';
import type { GrblResolvedStatus } from '../../../utils/grbl/interfaces/GrblResolvedStatus';
import { MISSING_VALUE_TEXT } from '../../../utils/missing.value.constants';
import { ConnectionStatusChanged } from '../../../utils/states/grbl.connection.state';
import { MachineStatusReceived } from '../../../utils/states/machine.status.state';
import { newStore } from '../../../utils/states/new.store';
import type { AppStore } from '../../../utils/states/new.store';
import { selectIsConnectionPopoverOpen } from '../../../utils/states/ui.overlay.state';

const DISCONNECTED_TEXT = 'Connect to see the position';
const WORK_ROW_NAME = 'Work position';
const LASER_ROW_NAME = 'Laser position';

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

const getRowTexts = (rowName: string): string[] => {
  const row: HTMLElement | null = screen.getByRole('rowheader', { name: rowName }).closest('tr');

  return row ? within(row).getAllByRole('cell').map((cell: HTMLElement): string => cell.textContent ?? '') : [];
};

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

  it('while connected shows the work and laser positions per axis and follows each status report', () => {
    const store: AppStore = newStore();

    renderCard(store);
    connect(store);

    expect(getRowTexts(WORK_ROW_NAME)).toEqual([MISSING_VALUE_TEXT, MISSING_VALUE_TEXT, MISSING_VALUE_TEXT]);

    receive(store, newStatus({ x: 8, y: 1.25, z: 0 }, { x: 10.5, y: 0, z: -1 }));

    expect(getRowTexts(WORK_ROW_NAME)).toEqual(['8.000', '1.250', '0.000']);
    expect(getRowTexts(LASER_ROW_NAME)).toEqual(['10.500', '0.000', '-1.000']);

    receive(store, newStatus({ x: 18, y: 1.25, z: 0 }, { x: 20.5, y: 0, z: -1 }));

    expect(getRowTexts(WORK_ROW_NAME)).toEqual(['18.000', '1.250', '0.000']);
    expect(screen.queryByRole('button', { name: DISCONNECTED_TEXT })).not.toBeInTheDocument();
  });
});
