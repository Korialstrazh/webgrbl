import { render, screen } from '@testing-library/react';
import { Provider } from 'react-redux';
import { describe, expect, it } from 'vitest';
import { LaserStateChip } from '.';
import { GRBL_CONNECTION_STATUS, GRBL_MACHINE_STATE } from '../../utils/grbl/grbl.constants';
import { ConnectionStatusChanged } from '../../utils/states/grbl.connection.state';
import { MachineStatusReceived } from '../../utils/states/machine.status.state';
import { newStore } from '../../utils/states/new.store';
import type { AppStore } from '../../utils/states/new.store';
import { AntdTestProvider } from '../../utils/test.support/antd.test.provider';

const LASER_OFF_TEXT = 'Laser off';
const FIRING_TEXT = 'Firing 40 %';
/** 40 % of the default S max of 1000. */
const FORTY_PERCENT_POWER = 400;

const newConnectedStore = (spindleSpeed: number): AppStore => {
  const store: AppStore = newStore();

  store.dispatch(new ConnectionStatusChanged({ connectionStatus: GRBL_CONNECTION_STATUS.CONNECTED }));
  store.dispatch(new MachineStatusReceived({
    status: {
      machineState: GRBL_MACHINE_STATE.IDLE,
      machineSubstate: undefined,
      machinePosition: undefined,
      workPosition: undefined,
      workCoordinateOffset: undefined,
      plannerBlocksAvailable: undefined,
      rxBytesAvailable: undefined,
      feedRate: undefined,
      spindleSpeed,
      overrides: undefined,
    },
  }));

  return store;
};

const renderChip = (store: AppStore): void => {
  render(
    <Provider store={store}>
      <AntdTestProvider>
        <LaserStateChip />
      </AntdTestProvider>
    </Provider>,
  );
};

describe(LaserStateChip.name, () => {
  it('says Laser off when the laser reports zero power', () => {
    renderChip(newConnectedStore(0));

    expect(screen.getByText(LASER_OFF_TEXT)).toBeInTheDocument();
  });

  it('says Firing with the power percent when the laser reports power', () => {
    renderChip(newConnectedStore(FORTY_PERCENT_POWER));

    expect(screen.getByText(FIRING_TEXT)).toBeInTheDocument();
  });

  it('shows nothing while no laser is connected', () => {
    const { container } = render(
      <Provider store={newStore()}>
        <AntdTestProvider>
          <LaserStateChip />
        </AntdTestProvider>
      </Provider>,
    );

    expect(container).toBeEmptyDOMElement();
  });
});
