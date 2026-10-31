import { act, fireEvent, render, screen } from '@testing-library/react';
import { Provider } from 'react-redux';
import { StopButton } from '.';
import { GRBL_CONNECTION_STATUS } from '../../utils/grbl/grbl.constants';
import { ConnectionStatusChanged } from '../../utils/states/grbl.connection.state';
import { MachineStopRequested } from '../../utils/states/machine.status.state';
import { newStore } from '../../utils/states/new.store';
import type { AppStore } from '../../utils/states/new.store';

const STOP_LABEL = 'Stop';

const renderStopButton = (store: AppStore): void => {
  render(
    <Provider store={store}>
      <StopButton />
    </Provider>,
  );
};

describe(StopButton.name, () => {
  it('is disabled while disconnected', () => {
    renderStopButton(newStore());

    expect(screen.getByRole('button', { name: STOP_LABEL })).toBeDisabled();
  });

  it('dispatches the stop request when clicked while connected', () => {
    const store: AppStore = newStore();
    const dispatchSpy = vi.spyOn(store, 'dispatch');

    renderStopButton(store);
    act(() => {
      store.dispatch(new ConnectionStatusChanged({ connectionStatus: GRBL_CONNECTION_STATUS.CONNECTED }));
    });
    fireEvent.click(screen.getByRole('button', { name: STOP_LABEL }));

    expect(dispatchSpy).toHaveBeenCalledWith(expect.any(MachineStopRequested));
  });
});
