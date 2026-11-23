import { act, fireEvent, render, screen } from '@testing-library/react';
import { createRef } from 'react';
import type { RefObject } from 'react';
import { Provider } from 'react-redux';
import type { Mock, MockInstance } from 'vitest';
import { ConnectionPopover } from '.';
import { GRBL_BAUD_RATES, NO_SERIAL_PORT_ID, SIMULATED_LASER_PORT_ID } from '../../utils/grbl/grbl.constants';
import { ANSWER_SETTLE_MS } from '../../utils/grbl/test.support/grbl.answer.settle';
import {
  AvailableSerialPortsReceived,
  SerialPortSelected,
  selectBaudRate,
  selectSelectedPortId,
} from '../../utils/states/grbl.connection.state';
import { newStore } from '../../utils/states/new.store';
import type { AppStore } from '../../utils/states/new.store';
import { AntdTestProvider } from '../../utils/test.support/antd.test.provider';

const CONNECT_LABEL = 'Connect';
const DISCONNECT_LABEL = 'Disconnect';
const DISCONNECTED_TITLE = 'Connect laser';
const CONNECTED_TITLE = 'Connected \u00B7 Simulated laser (no hardware)';
const CHOOSE_PORT_LABEL = 'Choose a USB port';
const ANTD_TEXT_BUTTON_CLASS = 'ant-btn-text';
const PORT_LABEL = 'Port';
const BAUD_LABEL = 'Baud rate';
const ADVANCED_LABEL = 'Advanced';
const SIMULATED_LASER_LABEL = 'Simulated laser (no hardware)';
const NO_PORT_CHOSEN_LABEL = 'No port chosen';
const WEB_SERIAL_UNAVAILABLE_PATTERN = /Web Serial unavailable/;
const ANCHOR_LABEL = 'Laser connection';
const USB_PORT_ID = 'serial-1';
const USB_PORT_LABEL = 'USB 1a86:7523';
const USB_VENDOR_ID = 0x1a86;
const USB_PRODUCT_ID = 0x7523;
const UNKNOWN_PORT_ID = 'serial-2';
const UNKNOWN_PORT_LABEL = 'Serial port';
const CHOSEN_BAUD_RATE = 230400;
const ANCHOR_TEXT = 'Open connection';
// antd renders each dropdown option with this class and the option label as its title.
const SELECT_OPTION_SELECTOR = '.ant-select-item-option';
const TITLE_ATTRIBUTE = 'title';

const newAnchorRef = (): RefObject<HTMLButtonElement | null> => createRef<HTMLButtonElement>();

const openSelect = (label: string): void => {
  fireEvent.mouseDown(screen.getByRole('combobox', { name: label }));
};

const getSelectOptionLabels = (): string[] =>
  Array.from(document.querySelectorAll(SELECT_OPTION_SELECTOR), (option: Element) =>
    option.getAttribute(TITLE_ATTRIBUTE) ?? '');

const pickSelectOption = (optionLabel: string): void => {
  const option: Element | null = document.querySelector(`${SELECT_OPTION_SELECTOR}[title="${optionLabel}"]`);

  if (!option) {
    throw new Error(`Option ${optionLabel} is not open`);
  }

  fireEvent.click(option);
};

/** Renders the open popover; most tests choose the simulated laser first, since no port is chosen for the user. */
const renderConnectionPopover = (
  isSimulatedLaserChosen: boolean = true,
  onOpenChange: (isOpen: boolean) => void = vi.fn(),
): AppStore => {
  const store: AppStore = newStore();

  if (isSimulatedLaserChosen) {
    store.dispatch(new SerialPortSelected({ portId: SIMULATED_LASER_PORT_ID }));
  }

  render(
    <Provider store={store}>
      <AntdTestProvider>
        <ConnectionPopover isOpen onOpenChange={onOpenChange} anchorRef={newAnchorRef()}>
          <button type="button">{ANCHOR_TEXT}</button>
        </ConnectionPopover>
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

describe(ConnectionPopover.name, () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('connecting to the simulated laser turns the button into Disconnect', async () => {
    renderConnectionPopover();

    fireEvent.click(screen.getByRole('button', { name: CONNECT_LABEL }));
    await settle();

    expect(screen.getByRole('button', { name: DISCONNECT_LABEL })).toBeEnabled();
  });

  it('names the connected port in its title and styles Disconnect as a danger action', async () => {
    renderConnectionPopover();

    expect(screen.getByText(DISCONNECTED_TITLE)).toBeInTheDocument();

    fireEvent.click(screen.getByRole('button', { name: CONNECT_LABEL }));
    await settle();

    expect(screen.getByText(CONNECTED_TITLE)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: DISCONNECT_LABEL })).toHaveClass('ant-btn-dangerous');
  });

  it('closes after Disconnect, as the pill then shows the result', async () => {
    const onOpenChange = vi.fn();

    renderConnectionPopover(true, onOpenChange);
    fireEvent.click(screen.getByRole('button', { name: CONNECT_LABEL }));
    await settle();
    onOpenChange.mockClear();

    fireEvent.click(screen.getByRole('button', { name: DISCONNECT_LABEL }));

    expect(onOpenChange).toHaveBeenCalledWith(false);
  });

  it('draws Add port as a quiet text button, so the filled Connect stays the main action', () => {
    renderConnectionPopover();

    expect(screen.getByRole('button', { name: CHOOSE_PORT_LABEL })).toHaveClass(ANTD_TEXT_BUTTON_CLASS);
  });

  it('Choose port is disabled without Web Serial but the simulated laser still connects', async () => {
    renderConnectionPopover();

    const choosePortButton: HTMLElement = screen.getByRole('button', { name: CHOOSE_PORT_LABEL });

    expect(choosePortButton).toBeDisabled();
    expect(screen.getByText(WEB_SERIAL_UNAVAILABLE_PATTERN)).toBeInTheDocument();

    fireEvent.click(screen.getByRole('button', { name: CONNECT_LABEL }));
    await settle();

    expect(screen.getByRole('button', { name: DISCONNECT_LABEL })).toBeInTheDocument();
  });

  it('chooses no port for the user and keeps Connect disabled until a port is chosen', () => {
    const store: AppStore = renderConnectionPopover(false);

    expect(selectSelectedPortId(store.getState())).toBe(NO_SERIAL_PORT_ID);
    expect(screen.getByText(NO_PORT_CHOSEN_LABEL)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: CONNECT_LABEL })).toBeDisabled();

    openSelect(PORT_LABEL);
    pickSelectOption(SIMULATED_LASER_LABEL);

    expect(screen.getByRole('button', { name: CONNECT_LABEL })).toBeEnabled();
  });

  it('asks to open when its anchor is clicked', () => {
    const onOpenChange: Mock<(isOpen: boolean) => void> = vi.fn<(isOpen: boolean) => void>();

    render(
      <Provider store={newStore()}>
        <ConnectionPopover isOpen={false} onOpenChange={onOpenChange} anchorRef={newAnchorRef()}>
          <button type="button">{ANCHOR_TEXT}</button>
        </ConnectionPopover>
      </Provider>,
    );
    fireEvent.click(screen.getByRole('button', { name: ANCHOR_TEXT }));

    expect(onOpenChange).toHaveBeenCalledWith(true);
  });

  it.each([
    ['without a ring after a pointer opened it', true, false],
    ['with a ring after the keyboard opened it', false, true],
  ])('returns focus to the anchor %s', async (_caseName: string, isPointerOpened: boolean, isRingExpected: boolean) => {
    const anchorRef: RefObject<HTMLButtonElement | null> = newAnchorRef();
    const onOpenChange: Mock<(isOpen: boolean) => void> = vi.fn<(isOpen: boolean) => void>();

    render(
      <Provider store={newStore()}>
        <AntdTestProvider>
          <ConnectionPopover isOpen onOpenChange={onOpenChange} anchorRef={anchorRef}>
            <button ref={anchorRef} type="button">{ANCHOR_TEXT}</button>
          </ConnectionPopover>
        </AntdTestProvider>
      </Provider>,
    );
    const anchorButton: HTMLElement = screen.getByRole('button', { name: ANCHOR_TEXT });
    const focusSpy: MockInstance<(options?: FocusOptions) => void> = vi.spyOn(anchorButton, 'focus');

    fireEvent[isPointerOpened ? 'pointerDown' : 'keyDown'](anchorButton);
    await settle();
    const portSelect: HTMLElement = screen.getByRole('combobox', { name: PORT_LABEL });
    portSelect.focus();
    fireEvent.keyDown(portSelect, { key: 'Escape' });
    fireEvent.keyUp(portSelect, { key: 'Escape' });

    expect(onOpenChange).toHaveBeenCalledWith(false);
    expect(focusSpy).toHaveBeenCalledWith({ focusVisible: isRingExpected });
  });

  it('is not rendered while closed', () => {
    render(
      <Provider store={newStore()}>
        <ConnectionPopover isOpen={false} onOpenChange={vi.fn()} anchorRef={newAnchorRef()}>
          <button type="button">{ANCHOR_TEXT}</button>
        </ConnectionPopover>
      </Provider>,
    );

    expect(screen.queryByRole('dialog', { name: ANCHOR_LABEL })).not.toBeInTheDocument();
  });

  it('lists the simulated laser and granted ports with their USB ids', () => {
    const store: AppStore = renderConnectionPopover(false);

    act(() => {
      store.dispatch(new AvailableSerialPortsReceived({
        ports: [
          { portId: USB_PORT_ID, usbVendorId: USB_VENDOR_ID, usbProductId: USB_PRODUCT_ID },
          { portId: UNKNOWN_PORT_ID, usbVendorId: undefined, usbProductId: undefined },
        ],
      }));
    });
    openSelect(PORT_LABEL);

    expect(getSelectOptionLabels()).toEqual([SIMULATED_LASER_LABEL, USB_PORT_LABEL, UNKNOWN_PORT_LABEL]);

    pickSelectOption(USB_PORT_LABEL);

    expect(selectSelectedPortId(store.getState())).toBe(USB_PORT_ID);
  });

  it('keeps the baud rate folded under a closed Advanced section until it is opened', () => {
    renderConnectionPopover();

    expect(screen.queryByRole('combobox', { name: BAUD_LABEL })).not.toBeInTheDocument();
    expect(screen.getByRole('button', { name: ADVANCED_LABEL })).toHaveAttribute('aria-expanded', 'false');

    fireEvent.click(screen.getByRole('button', { name: ADVANCED_LABEL }));

    expect(screen.getByRole('combobox', { name: BAUD_LABEL })).toBeInTheDocument();
  });

  it('offers every baud rate and stores the chosen one', () => {
    const store: AppStore = renderConnectionPopover();

    fireEvent.click(screen.getByRole('button', { name: ADVANCED_LABEL }));
    openSelect(BAUD_LABEL);

    expect(getSelectOptionLabels()).toEqual(GRBL_BAUD_RATES.map(String));

    pickSelectOption(String(CHOSEN_BAUD_RATE));

    expect(selectBaudRate(store.getState())).toBe(CHOSEN_BAUD_RATE);
  });

  it('locks the port and baud selects while connected', async () => {
    renderConnectionPopover();

    fireEvent.click(screen.getByRole('button', { name: CONNECT_LABEL }));
    await settle();
    fireEvent.click(screen.getByRole('button', { name: ADVANCED_LABEL }));

    expect(screen.getByRole('combobox', { name: PORT_LABEL })).toBeDisabled();
    expect(screen.getByRole('combobox', { name: BAUD_LABEL })).toBeDisabled();
  });
});
