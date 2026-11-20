import { act, fireEvent, render, screen, waitFor, within } from '@testing-library/react';
import { setMatchMediaMatches } from '../../utils/test.support/match.media.mock';
import { Provider } from 'react-redux';
import { ConnectionPill } from '.';
import { ESCAPE_KEY, OFFLINE_EVENT_NAME } from '../../utils/browser/browser.events.constants';
import { GRBL_CONNECTION_STATUS, SIMULATED_LASER_PORT_ID } from '../../utils/grbl/grbl.constants';
import type { GrblConnectionStatus } from '../../utils/grbl/grbl.constants';
import { ANSWER_SETTLE_MS } from '../../utils/grbl/test.support/grbl.answer.settle';
import type { MachineProfile } from '../../utils/profiles/interfaces/MachineProfile';
import { newMachineProfile } from '../../utils/profiles/new.machine.profile';
import { ConnectionStatusChanged, SerialPortSelected } from '../../utils/states/grbl.connection.state';
import { ActiveMachineProfileSelected, MachineProfileSaved } from '../../utils/states/machine.profile.state';
import { newStore } from '../../utils/states/new.store';
import type { AppStore } from '../../utils/states/new.store';
import {
  ConnectionPopoverOpenChanged,
  selectIsAnyOverlayOpen,
  selectIsConnectionPopoverOpen,
} from '../../utils/states/ui.overlay.state';
import { NarrowRegionChanged } from '../../utils/states/ui.workbench.state';
import { WORKBENCH_REGION } from '../../utils/states/workbench.region.constants';
import type { WorkbenchRegion } from '../../utils/states/workbench.region.constants';
import { AntdTestProvider } from '../../utils/test.support/antd.test.provider';

const ONLINE_PATTERN = /Online/;
const SHORT_DISCONNECTED_TEXT = 'Not connected';
const DISCONNECTED_PATTERN = /^Connection: Not connected.*Open the connection menu\.$/;
const CONNECT_VERB_TEXT = 'Connect';
const CONNECT_LABEL = 'Connect';
const DISCONNECT_LABEL = 'Disconnect';
const UNGRANTED_PORT_ID = 'serial-ungranted';
const FIRMWARE_TEXT = 'Grbl 1.1h';
const CONNECTED_WITH_FIRMWARE_PATTERN = /Connected.*Grbl 1\.1h/;
const POPOVER_LABEL = 'Laser connection';
const NO_WEB_SERIAL_LABEL = 'No Web Serial';
const NO_PORT_CHOSEN_LABEL = 'No port chosen';
const PORT_LABEL = 'Port';
const PROFILE_NAME = 'Workshop laser';
const PILL_WITH_PROFILE_PATTERN = /Not connected, Workshop laser/;
const STATUS_LABELS: Record<GrblConnectionStatus, string> = {
  [GRBL_CONNECTION_STATUS.DISCONNECTED]: 'Not connected',
  [GRBL_CONNECTION_STATUS.CONNECTING]: 'Connecting',
  [GRBL_CONNECTION_STATUS.CONNECTED]: 'Connected',
  [GRBL_CONNECTION_STATUS.LOST]: 'Connection lost',
};
const SHORT_STATUS_LABELS: Record<GrblConnectionStatus, string> = {
  ...STATUS_LABELS,
  [GRBL_CONNECTION_STATUS.LOST]: 'Lost',
};
const SIMULATED_PORT_TEXT = 'Simulated laser (no hardware)';

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

/** The Connect button inside the open popover; a chosen port adds a one-click Connect beside the pill too. */
const getPopoverConnectButton = (): HTMLElement =>
  within(screen.getByRole('dialog', { name: POPOVER_LABEL })).getByRole('button', { name: CONNECT_LABEL });

const settle = async (): Promise<void> => {
  await act(async () => {
    await vi.advanceTimersByTimeAsync(ANSWER_SETTLE_MS);
  });
};

describe(ConnectionPill.name, () => {
  it('shows Not connected and a Connect verb, without the empty port, and opens the popover on click', () => {
    renderConnectionPill();

    const pillButton: HTMLElement = screen.getByRole('button', { name: DISCONNECTED_PATTERN });

    expect(screen.queryByText(NO_PORT_CHOSEN_LABEL)).not.toBeInTheDocument();
    expect(within(pillButton).getByText(CONNECT_VERB_TEXT)).toBeInTheDocument();
    expect(screen.queryByRole('dialog', { name: POPOVER_LABEL })).not.toBeInTheDocument();

    fireEvent.click(pillButton);

    expect(screen.getByRole('dialog', { name: POPOVER_LABEL })).toBeInTheDocument();
  });

  it('pairs the dot with a one-word state for a narrow window, hidden from screen readers', () => {
    renderConnectionPill();

    const pillButton: HTMLElement = screen.getByRole('button', { name: DISCONNECTED_PATTERN });

    const shortStatus: HTMLElement | undefined = within(pillButton).getAllByText(SHORT_DISCONNECTED_TEXT).at(-1);

    expect(shortStatus?.closest('[aria-hidden]')).toHaveAttribute('aria-hidden', 'true');
  });

  it('closes the connection popover when the narrow layout switches region', () => {
    const store: AppStore = renderConnectionPill();

    fireEvent.click(screen.getByRole('button', { name: DISCONNECTED_PATTERN }));
    act(() => {
      store.dispatch(new NarrowRegionChanged({ narrowRegion: WORKBENCH_REGION.JOB }));
    });

    expect(selectIsConnectionPopoverOpen(store.getState())).toBe(false);
  });

  it.each(Object.values(WORKBENCH_REGION))('keeps the Connect verb on the narrow %s tab', (region: WorkbenchRegion) => {
    const store: AppStore = renderConnectionPill();

    act(() => {
      store.dispatch(new NarrowRegionChanged({ narrowRegion: region }));
    });

    expect(within(screen.getByRole('button', { name: DISCONNECTED_PATTERN })).getByText(CONNECT_VERB_TEXT))
      .toBeInTheDocument();
  });

  it('keeps the Connect verb in a wide window too, so the idle pill always reads as the place to connect', () => {
    setMatchMediaMatches(true);
    renderConnectionPill();

    expect(within(screen.getByRole('button', { name: DISCONNECTED_PATTERN })).getByText(CONNECT_VERB_TEXT))
      .toBeInTheDocument();
  });

  it.each(Object.values(GRBL_CONNECTION_STATUS))('shows the label of the %s state', (status: GrblConnectionStatus) => {
    const store: AppStore = renderConnectionPill();

    act(() => {
      store.dispatch(new ConnectionStatusChanged({ connectionStatus: status }));
    });

    const pill: HTMLElement = screen.getByRole('button', { name: new RegExp(`^Connection: ${STATUS_LABELS[status]}`) });

    expect(pill).toHaveTextContent(SHORT_STATUS_LABELS[status]);
  });

  it('keeps the chosen port out of the pill text but names it in its accessible name and tooltip', async () => {
    const store: AppStore = renderConnectionPill();

    act(() => {
      store.dispatch(new SerialPortSelected({ portId: SIMULATED_LASER_PORT_ID }));
    });

    const pill: HTMLElement = screen.getByRole('button', { name: DISCONNECTED_PATTERN });

    expect(pill).not.toHaveTextContent(SIMULATED_PORT_TEXT);
    expect(pill).toHaveAccessibleName(new RegExp(SIMULATED_PORT_TEXT.replace(/[()]/g, '\\$&')));

    fireEvent.mouseEnter(pill);

    expect(await screen.findByText(`${STATUS_LABELS[GRBL_CONNECTION_STATUS.DISCONNECTED]}: ${SIMULATED_PORT_TEXT}`))
      .toBeInTheDocument();
  });

  describe('with the simulated laser', () => {
    beforeEach(() => {
      vi.useFakeTimers();
    });

    afterEach(() => {
      vi.useRealTimers();
    });

    it('connecting to the simulated laser from the popover shows Grbl 1.1h in the pill', async () => {
      const store: AppStore = renderConnectionPill();

      act(() => {
        store.dispatch(new SerialPortSelected({ portId: SIMULATED_LASER_PORT_ID }));
      });
      fireEvent.click(screen.getByRole('button', { name: DISCONNECTED_PATTERN }));
      fireEvent.click(getPopoverConnectButton());
      await settle();

      const pillButton: HTMLElement = screen.getByRole('button', { name: CONNECTED_WITH_FIRMWARE_PATTERN });

      expect(screen.getByText(FIRMWARE_TEXT)).toBeInTheDocument();
      expect(within(pillButton).queryByText(CONNECT_VERB_TEXT)).not.toBeInTheDocument();
    });

    it('connects in one click from the Connect button beside the pill once a port is chosen', async () => {
      const store: AppStore = renderConnectionPill();

      act(() => {
        store.dispatch(new SerialPortSelected({ portId: SIMULATED_LASER_PORT_ID }));
      });

      const pillButton: HTMLElement = screen.getByRole('button', { name: DISCONNECTED_PATTERN });

      expect(within(pillButton).queryByText(CONNECT_VERB_TEXT)).not.toBeInTheDocument();

      fireEvent.click(screen.getByRole('button', { name: CONNECT_LABEL }));

      expect(selectIsConnectionPopoverOpen(store.getState())).toBe(false);

      await settle();

      expect(screen.getByRole('button', { name: CONNECTED_WITH_FIRMWARE_PATTERN })).toBeInTheDocument();
      expect(screen.queryByRole('button', { name: CONNECT_LABEL })).not.toBeInTheDocument();
      expect(selectIsConnectionPopoverOpen(store.getState())).toBe(false);
    });

    it('closes the popover by itself after the laser connects, with focus back on the pill', async () => {
      const store: AppStore = renderConnectionPill();

      act(() => {
        store.dispatch(new SerialPortSelected({ portId: SIMULATED_LASER_PORT_ID }));
      });
      fireEvent.click(screen.getByRole('button', { name: DISCONNECTED_PATTERN }));

      const connectButton: HTMLElement = getPopoverConnectButton();

      connectButton.focus();
      fireEvent.click(connectButton);

      expect(selectIsConnectionPopoverOpen(store.getState())).toBe(true);

      await settle();

      expect(selectIsConnectionPopoverOpen(store.getState())).toBe(false);
      expect(screen.getByRole('button', { name: CONNECTED_WITH_FIRMWARE_PATTERN })).toHaveFocus();
    });

    it('leaves the popover open when opened again while connected', async () => {
      const store: AppStore = renderConnectionPill();

      act(() => {
        store.dispatch(new SerialPortSelected({ portId: SIMULATED_LASER_PORT_ID }));
      });
      fireEvent.click(screen.getByRole('button', { name: DISCONNECTED_PATTERN }));
      fireEvent.click(getPopoverConnectButton());
      await settle();
      fireEvent.click(screen.getByRole('button', { name: CONNECTED_WITH_FIRMWARE_PATTERN }));
      await settle();

      expect(selectIsConnectionPopoverOpen(store.getState())).toBe(true);
      expect(screen.getByRole('button', { name: DISCONNECT_LABEL })).toBeInTheDocument();
    });

    it('stays open and shows the error when connecting fails, and clears it on the next try', async () => {
      const store: AppStore = renderConnectionPill();

      act(() => {
        store.dispatch(new SerialPortSelected({ portId: UNGRANTED_PORT_ID }));
      });
      fireEvent.click(screen.getByRole('button', { name: DISCONNECTED_PATTERN }));
      fireEvent.click(getPopoverConnectButton());
      await settle();

      expect(selectIsConnectionPopoverOpen(store.getState())).toBe(true);
      expect(within(screen.getByRole('dialog', { name: POPOVER_LABEL })).getByRole('alert')).not.toBeEmptyDOMElement();

      act(() => {
        store.dispatch(new SerialPortSelected({ portId: SIMULATED_LASER_PORT_ID }));
      });
      fireEvent.click(getPopoverConnectButton());

      expect(screen.queryByRole('alert')).not.toBeInTheDocument();

      await settle();

      expect(selectIsConnectionPopoverOpen(store.getState())).toBe(false);
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

  it('opened with a pointer, focuses the popover itself, so the Port field never opens ringed', async () => {
    renderConnectionPill();

    const pillButton: HTMLElement = screen.getByRole('button', { name: DISCONNECTED_PATTERN });

    fireEvent.pointerDown(pillButton);
    fireEvent.click(pillButton);

    await waitFor(() => {
      expect(screen.getByRole('dialog', { name: POPOVER_LABEL })).toHaveFocus();
    });
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
    const pill: HTMLElement = screen.getByRole('button', { name: DISCONNECTED_PATTERN });
    const onlinePillText: string | null = pill.textContent;

    act(() => {
      window.dispatchEvent(new Event(OFFLINE_EVENT_NAME));
    });

    expect(screen.queryByText(ONLINE_PATTERN)).not.toBeInTheDocument();
    expect(pill.textContent).toBe(onlinePillText);
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
