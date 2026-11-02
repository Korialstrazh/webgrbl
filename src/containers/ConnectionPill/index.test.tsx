import { act, fireEvent, render, screen, waitFor, within } from '@testing-library/react';
import { Provider } from 'react-redux';
import { ConnectionPill } from '.';
import { ESCAPE_KEY, OFFLINE_EVENT_NAME } from '../../utils/browser/browser.events.constants';
import { GRBL_CONNECTION_STATUS } from '../../utils/grbl/grbl.constants';
import type { GrblConnectionStatus } from '../../utils/grbl/grbl.constants';
import { ANSWER_SETTLE_MS } from '../../utils/grbl/test.support/grbl.answer.settle';
import type { MachineProfile } from '../../utils/profiles/interfaces/MachineProfile';
import { newMachineProfile } from '../../utils/profiles/new.machine.profile';
import { ConnectionStatusChanged } from '../../utils/states/grbl.connection.state';
import { ActiveMachineProfileSelected, MachineProfileSaved } from '../../utils/states/machine.profile.state';
import { newStore } from '../../utils/states/new.store';
import type { AppStore } from '../../utils/states/new.store';
import { ConnectionPopoverOpenChanged, selectIsAnyOverlayOpen } from '../../utils/states/ui.overlay.state';
import { AntdTestProvider } from '../../utils/test.support/antd.test.provider';

const ONLINE_OR_OFFLINE_PATTERN = /Online|Offline/;
const DISCONNECTED_PATTERN = /^Connection: Not connected.*Open the connection menu\.$/;
const CONNECT_VERB_TEXT = 'Connect';
const CONNECT_LABEL = 'Connect';
const FIRMWARE_TEXT = 'Grbl 1.1h';
const CONNECTED_WITH_FIRMWARE_PATTERN = /Connected.*Grbl 1\.1h/;
const POPOVER_LABEL = 'Laser connection';
const NO_WEB_SERIAL_LABEL = 'No Web Serial';
const SIMULATED_LASER_LABEL = 'Simulated laser';
const PORT_LABEL = 'Port';
const PROFILE_NAME = 'Workshop laser';
const PILL_WITH_PROFILE_PATTERN = /Not connected, Workshop laser/;
const STATUS_LABELS: Record<GrblConnectionStatus, string> = {
  [GRBL_CONNECTION_STATUS.DISCONNECTED]: 'Not connected',
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
  it('shows Not connected with the selected port and a Connect verb, and opens the popover on click', () => {
    renderConnectionPill();

    const pillButton: HTMLElement = screen.getByRole('button', { name: DISCONNECTED_PATTERN });

    expect(screen.getByText(SIMULATED_LASER_LABEL)).toBeInTheDocument();
    expect(within(pillButton).getByText(CONNECT_VERB_TEXT)).toBeInTheDocument();
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

      const pillButton: HTMLElement = screen.getByRole('button', { name: CONNECTED_WITH_FIRMWARE_PATTERN });

      expect(screen.getByText(FIRMWARE_TEXT)).toBeInTheDocument();
      expect(within(pillButton).queryByText(CONNECT_VERB_TEXT)).not.toBeInTheDocument();
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

  it('shows the name of the active machine profile', () => {
    const store: AppStore = renderConnectionPill();
    const profile: MachineProfile = newMachineProfile({ name: PROFILE_NAME });

    expect(screen.queryByText(PROFILE_NAME)).not.toBeInTheDocument();

    act(() => {
      store.dispatch(new MachineProfileSaved({ profile }));
      store.dispatch(new ActiveMachineProfileSelected({ profileId: profile.id }));
    });

    expect(screen.getByRole('button', { name: PILL_WITH_PROFILE_PATTERN })).toBeInTheDocument();
  });

  it('leaves the browser network state out of the pill, also while offline', () => {
    renderConnectionPill();

    act(() => {
      window.dispatchEvent(new Event(OFFLINE_EVENT_NAME));
    });

    expect(screen.queryByText(ONLINE_OR_OFFLINE_PATTERN)).not.toBeInTheDocument();
  });

  it('opens its popover when another control asks for it, such as the Status card', () => {
    const store: AppStore = renderConnectionPill();

    act(() => {
      store.dispatch(new ConnectionPopoverOpenChanged({ isConnectionPopoverOpen: true }));
    });

    expect(screen.getByRole('dialog', { name: POPOVER_LABEL })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: DISCONNECTED_PATTERN })).toHaveAttribute('aria-expanded', 'true');
  });

  it('flags Web Serial as unavailable in a browser without navigator.serial', () => {
    renderConnectionPill();

    expect(screen.getByText(NO_WEB_SERIAL_LABEL)).toBeInTheDocument();
  });
});
