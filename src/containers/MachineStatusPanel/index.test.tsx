import { act, render, screen } from '@testing-library/react';
import { Provider } from 'react-redux';
import { MachineStatusPanel } from '.';
import { GRBL_MACHINE_STATE } from '../../utils/grbl/grbl.constants';
import type { GrblResolvedStatus } from '../../utils/grbl/interfaces/GrblResolvedStatus';
import { MachineStatusReceived } from '../../utils/states/machine.status.state';
import { newStore } from '../../utils/states/new.store';
import type { AppStore } from '../../utils/states/new.store';

const WORK_POSITION_TEXT = '8.000';
const MACHINE_POSITION_TEXT = '10.500';
const FEED_RATE = 1200;
const SPINDLE_SPEED = 750;
const MISSING_VALUE_TEXT = '-';
const IDLE_LABEL = 'Idle';
const RUN_LABEL = 'Run';

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

const renderMachineStatusPanel = (): AppStore => {
  const store: AppStore = newStore();

  render(
    <Provider store={store}>
      <MachineStatusPanel />
    </Provider>,
  );

  return store;
};

describe(MachineStatusPanel.name, () => {
  it('shows dashes while there is no status', () => {
    renderMachineStatusPanel();

    expect(screen.getAllByText(MISSING_VALUE_TEXT).length).toBeGreaterThan(0);
    expect(screen.queryByText(IDLE_LABEL)).not.toBeInTheDocument();
  });

  it('shows the state, positions with three decimals, feed and power after a status report', () => {
    const store: AppStore = renderMachineStatusPanel();

    act(() => {
      store.dispatch(new MachineStatusReceived({ status: NEW_STATUS }));
    });

    expect(screen.getByText(RUN_LABEL)).toBeInTheDocument();
    expect(screen.getByText(new RegExp(WORK_POSITION_TEXT))).toBeInTheDocument();
    expect(screen.getByText(new RegExp(MACHINE_POSITION_TEXT))).toBeInTheDocument();
    expect(screen.getByText(String(FEED_RATE))).toBeInTheDocument();
    expect(screen.getByText(String(SPINDLE_SPEED))).toBeInTheDocument();
  });
});
