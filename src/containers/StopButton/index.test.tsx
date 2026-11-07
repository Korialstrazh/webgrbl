import { act, fireEvent, render, screen } from '@testing-library/react';
import { Provider } from 'react-redux';
import { StopButton } from '.';
import { GRBL_CONNECTION_STATUS } from '../../utils/grbl/grbl.constants';
import { ConnectionStatusChanged } from '../../utils/states/grbl.connection.state';
import { MachineStopRequested } from '../../utils/states/machine.status.state';
import { newStore } from '../../utils/states/new.store';
import type { AppStore } from '../../utils/states/new.store';

const STOP_LABEL = 'Stop';
const SHORTCUT_HINT_TEXT = 'Esc';
const ESCAPE_KEY_NAME = 'Escape';
const NOT_CONNECTED_TEXT = 'Laser not connected';
const OFFLINE_CUE_TEXT = 'Not connected';
// antd's classes for a solid danger button in the large size: the most prominent button on the page.
// After an antd upgrade, check these class names in the rendered button if this test fails.
const PROMINENT_DANGER_CLASS_NAMES: readonly string[] = [
  'ant-btn-color-dangerous',
  'ant-btn-variant-solid',
  'ant-btn-lg',
];

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

  it('is drawn as a large solid danger button', () => {
    renderStopButton(newStore());

    expect(screen.getByRole('button', { name: STOP_LABEL })).toHaveClass(...PROMINENT_DANGER_CLASS_NAMES);
  });

  it('says it is not connected while disconnected', () => {
    renderStopButton(newStore());

    expect(screen.getByRole('button', { name: STOP_LABEL })).toHaveAccessibleDescription(NOT_CONNECTED_TEXT);
  });

  it('shows a visible Not connected cue beside the label while disconnected, outside the button name', () => {
    renderStopButton(newStore());

    expect(screen.getByText(OFFLINE_CUE_TEXT)).toBeVisible();
    expect(screen.getByRole('button', { name: STOP_LABEL })).toHaveTextContent(OFFLINE_CUE_TEXT);
  });

  it('is an enabled solid danger button without the not-connected cue while connected', () => {
    const store: AppStore = newStore();

    renderStopButton(store);
    act(() => {
      store.dispatch(new ConnectionStatusChanged({ connectionStatus: GRBL_CONNECTION_STATUS.CONNECTED }));
    });

    const stopButton: HTMLElement = screen.getByRole('button', { name: STOP_LABEL });

    expect(stopButton).toBeEnabled();
    expect(stopButton).toHaveClass(...PROMINENT_DANGER_CLASS_NAMES);
    expect(stopButton).not.toHaveAttribute('aria-describedby');
    expect(screen.queryByText(NOT_CONNECTED_TEXT)).not.toBeInTheDocument();
    expect(screen.queryByText(OFFLINE_CUE_TEXT)).not.toBeInTheDocument();
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

  it('shows its Esc shortcut without adding it to the button name', () => {
    renderStopButton(newStore());

    const stopButton: HTMLElement = screen.getByRole('button', { name: STOP_LABEL });

    expect(stopButton).toHaveAttribute('aria-keyshortcuts', ESCAPE_KEY_NAME);
    expect(stopButton).toContainElement(screen.getByText(SHORTCUT_HINT_TEXT));
  });
});
