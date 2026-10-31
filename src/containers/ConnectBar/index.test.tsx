import { act, fireEvent, render, screen } from '@testing-library/react';
import { Provider } from 'react-redux';
import { ConnectBar } from '.';
import { GRBL_BAUD_RATES } from '../../utils/grbl/grbl.constants';
import { ANSWER_SETTLE_MS } from '../../utils/grbl/test.support/grbl.answer.settle';
import { AvailableSerialPortsReceived, selectBaudRate, selectSelectedPortId } from '../../utils/states/grbl.connection.state';
import { newStore } from '../../utils/states/new.store';
import type { AppStore } from '../../utils/states/new.store';

const CONNECT_LABEL = 'Connect';
const DISCONNECT_LABEL = 'Disconnect';
const CHOOSE_PORT_LABEL = 'Choose port...';
const PORT_LABEL = 'Port';
const BAUD_LABEL = 'Baud rate';
const FIRMWARE_TEXT = 'Grbl 1.1h';
const SIMULATED_LASER_LABEL = 'Simulated laser';
const WEB_SERIAL_UNAVAILABLE_PATTERN = /Web Serial unavailable/;
const TITLE_ATTRIBUTE = 'title';
const BAUD_OPTION_PATTERN = /^\d+$/;
const USB_PORT_ID = 'serial-1';
const USB_PORT_LABEL = 'USB 1a86:7523';
const USB_VENDOR_ID = 0x1a86;
const USB_PRODUCT_ID = 0x7523;
const UNKNOWN_PORT_ID = 'serial-2';
const UNKNOWN_PORT_LABEL = 'Serial port';
const CHOSEN_BAUD_RATE = 230400;

const renderConnectBar = (): AppStore => {
  const store: AppStore = newStore();

  render(
    <Provider store={store}>
      <ConnectBar />
    </Provider>,
  );

  return store;
};

const settle = async (): Promise<void> => {
  await act(async () => {
    await vi.advanceTimersByTimeAsync(ANSWER_SETTLE_MS);
  });
};

describe(ConnectBar.name, () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('connecting to the simulated laser shows the firmware version', async () => {
    renderConnectBar();

    fireEvent.click(screen.getByRole('button', { name: CONNECT_LABEL }));
    await settle();

    expect(screen.getByRole('button', { name: DISCONNECT_LABEL })).toBeEnabled();
    expect(screen.getByText(FIRMWARE_TEXT)).toBeInTheDocument();
  });

  it('Choose port is disabled without Web Serial but the simulated laser still connects', async () => {
    renderConnectBar();

    const choosePortButton: HTMLElement = screen.getByRole('button', { name: CHOOSE_PORT_LABEL });

    expect(choosePortButton).toBeDisabled();
    expect(choosePortButton.getAttribute(TITLE_ATTRIBUTE)).toMatch(WEB_SERIAL_UNAVAILABLE_PATTERN);

    fireEvent.click(screen.getByRole('button', { name: CONNECT_LABEL }));
    await settle();

    expect(screen.getByRole('button', { name: DISCONNECT_LABEL })).toBeInTheDocument();
  });

  it('lists the simulated laser and granted ports with their USB ids', () => {
    const store: AppStore = renderConnectBar();

    act(() => {
      store.dispatch(new AvailableSerialPortsReceived({
        ports: [
          { portId: USB_PORT_ID, usbVendorId: USB_VENDOR_ID, usbProductId: USB_PRODUCT_ID },
          { portId: UNKNOWN_PORT_ID, usbVendorId: undefined, usbProductId: undefined },
        ],
      }));
    });
    fireEvent.change(screen.getByLabelText(PORT_LABEL), { target: { value: USB_PORT_ID } });

    expect(screen.getByRole('option', { name: SIMULATED_LASER_LABEL })).toBeInTheDocument();
    expect(screen.getByRole('option', { name: USB_PORT_LABEL })).toBeInTheDocument();
    expect(screen.getByRole('option', { name: UNKNOWN_PORT_LABEL })).toBeInTheDocument();
    expect(selectSelectedPortId(store.getState())).toBe(USB_PORT_ID);
  });

  it('offers every baud rate and stores the chosen one', () => {
    const store: AppStore = renderConnectBar();

    fireEvent.change(screen.getByLabelText(BAUD_LABEL), { target: { value: String(CHOSEN_BAUD_RATE) } });

    expect(screen.getAllByRole('option', { name: BAUD_OPTION_PATTERN })).toHaveLength(GRBL_BAUD_RATES.length);
    expect(selectBaudRate(store.getState())).toBe(CHOSEN_BAUD_RATE);
  });
});
