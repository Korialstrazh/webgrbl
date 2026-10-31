import { act, fireEvent, render, screen, waitFor } from '@testing-library/react';
import { Provider } from 'react-redux';
import { ConnectionPill } from '.';
import { ESCAPE_KEY, OFFLINE_EVENT_NAME } from '../../utils/browser/browser.events.constants';
import { GRBL_CONNECTION_STATUS } from '../../utils/grbl/grbl.constants';
import type { GrblConnectionStatus } from '../../utils/grbl/grbl.constants';
import { ANSWER_SETTLE_MS } from '../../utils/grbl/test.support/grbl.answer.settle';
import { ConnectionStatusChanged } from '../../utils/states/grbl.connection.state';
import { newStore } from '../../utils/states/new.store';
import type { AppStore } from '../../utils/states/new.store';
import { selectIsAnyOverlayOpen } from '../../utils/states/ui.overlay.state';
import { AntdTestProvider } from '../../utils/test.support/antd.test.provider';

const OFFLINE_LABEL = 'Offline';
const DISCONNECTED_PATTERN = /Disconnected/;
const CONNECT_LABEL = 'Connect';
const FIRMWARE_TEXT = 'Grbl 1.1h';
const CONNECTED_WITH_FIRMWARE_PATTERN = /Connected.*Grbl 1\.1h/;
const POPOVER_LABEL = 'Laser connection';
const NO_WEB_SERIAL_LABEL = 'No Web Serial';
const SIMULATED_LASER_LABEL = 'Simulated laser';
const PORT_LABEL = 'Port';
const STATUS_LABELS: Record<GrblConnectionStatus, string> = {
  [GRBL_CONNECTION_STATUS.DISCONNECTED]: 'Disconnected',
  [GRBL_CONNECTION_STATUS.CONNECTING]: 'Connecting',
  [GRBL_CONNECTION_STATUS.CONNECTED]: 'Connected',
  [GRBL_CONNECTION_STATUS.LOST]: 'Connection lost',
};

const renderConnectionPill = (): AppStore => {
  const store: AppStore = newStore();

  render(
    <Provider store={store}>
      <AntdTestProvider>
        <ConnectionPill />
      </AntdTestProvider>
    </Provider>,
  );

  return store;
};

const settle = async (): Promise<void> => {
  await act(async () => {
    await vi.advanceTimersByTimeAsync(ANSWER_SETTLE_MS);
  });
};

describe(ConnectionPill.name, () => {
  it('shows Disconnected with the selected port and opens the popover on click', () => {
    renderConnectionPill();

    const pillButton: HTMLElement = screen.getByRole('button', { name: DISCONNECTED_PATTERN });

    expect(screen.getByText(SIMULATED_LASER_LABEL)).toBeInTheDocument();
    expect(screen.queryByRole('dialog', { name: POPOVER_LABEL })).not.toBeInTheDocument();

    fireEvent.click(pillButton);

    expect(screen.getByRole('dialog', { name: POPOVER_LABEL })).toBeInTheDocument();
  });

  it.each(Object.values(GRBL_CONNECTION_STATUS))('shows the label of the %s state', (status: GrblConnectionStatus) => {
    const store: AppStore = renderConnectionPill();

    act(() => {
      store.dispatch(new ConnectionStatusChanged({ connectionStatus: status }));
    });

    expect(screen.getByText(STATUS_LABELS[status])).toBeInTheDocument();
  });

  describe('with the simulated laser', () => {
    beforeEach(() => {
      vi.useFakeTimers();
    });

    afterEach(() => {
      vi.useRealTimers();
    });

    it('connecting to the simulated laser from the popover shows Grbl 1.1h in the pill', async () => {
      renderConnectionPill();

      fireEvent.click(screen.getByRole('button', { name: DISCONNECTED_PATTERN }));
      fireEvent.click(screen.getByRole('button', { name: CONNECT_LABEL }));
      await settle();

      expect(screen.getByText(FIRMWARE_TEXT)).toBeInTheDocument();
      expect(screen.getByRole('button', { name: CONNECTED_WITH_FIRMWARE_PATTERN })).toBeInTheDocument();
    });
  });

  it('counts the open popover as an open overlay until Escape closes it', () => {
    const store: AppStore = renderConnectionPill();

    fireEvent.click(screen.getByRole('button', { name: DISCONNECTED_PATTERN }));

    expect(selectIsAnyOverlayOpen(store.getState())).toBe(true);

    fireEvent.keyDown(screen.getByRole('dialog', { name: POPOVER_LABEL }), { key: ESCAPE_KEY });

    expect(screen.queryByRole('dialog', { name: POPOVER_LABEL })).not.toBeInTheDocument();
    expect(selectIsAnyOverlayOpen(store.getState())).toBe(false);
  });

  it('moves focus into the opened popover and back to the pill when Escape closes it', async () => {
    renderConnectionPill();

    const pillButton: HTMLElement = screen.getByRole('button', { name: DISCONNECTED_PATTERN });

    // Not focused first: Safari and Firefox on macOS do not focus a clicked button.
    fireEvent.click(pillButton);

    await waitFor(() => {
      expect(screen.getByLabelText(PORT_LABEL)).toHaveFocus();
    });

    fireEvent.keyDown(screen.getByLabelText(PORT_LABEL), { key: ESCAPE_KEY });

    expect(pillButton).toHaveFocus();
  });

  it('switches to offline when the browser loses its connection', () => {
    renderConnectionPill();

    act(() => {
      window.dispatchEvent(new Event(OFFLINE_EVENT_NAME));
    });

    expect(screen.getByText(OFFLINE_LABEL)).toBeInTheDocument();
  });

  it('flags Web Serial as unavailable in a browser without navigator.serial', () => {
    renderConnectionPill();

    expect(screen.getByText(NO_WEB_SERIAL_LABEL)).toBeInTheDocument();
  });
});
