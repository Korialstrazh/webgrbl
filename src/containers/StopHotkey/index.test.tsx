import { act, fireEvent, render, screen, waitFor } from '@testing-library/react';
import { Drawer, Modal, Popover, Select } from 'antd';
import { StrictMode, useState } from 'react';
import { Provider } from 'react-redux';
import { StopHotkey } from '.';
import { ConnectionPill } from '../ConnectionPill';
import { ConsolePanel } from '../ConsolePanel';
import { ANTD_POPOVER_TRIGGER_CLICK } from '../../utils/antd.constants';
import { ESCAPE_KEY } from '../../utils/browser/browser.events.constants';
import { GRBL_CONNECTION_STATUS } from '../../utils/grbl/grbl.constants';
import { useOverlayRegistration } from '../../utils/hooks/use.overlay.registration';
import { ConnectionStatusChanged } from '../../utils/states/grbl.connection.state';
import { MachineStopRequested } from '../../utils/states/machine.status.state';
import { newStore } from '../../utils/states/new.store';
import type { AppStore } from '../../utils/states/new.store';
import { selectIsAnyOverlayOpen } from '../../utils/states/ui.overlay.state';
import { AntdTestProvider } from '../../utils/test.support/antd.test.provider';

const CONSOLE_INPUT_LABEL = 'Console command';
const DISCONNECTED_PATTERN = /^Connection: /;
const POPOVER_LABEL = 'Laser connection';
const PORT_LABEL = 'Port';
const MODAL_TITLE = 'Test modal';
const MODAL_OVERLAY_ID = 'test-modal';
const DRAWER_TITLE = 'Test drawer';
const DRAWER_OVERLAY_ID = 'test-drawer';

const SELECT_LABEL = 'Test select';
// antd Select reads the legacy key code, which real browsers always send along with the key.
const ESCAPE_KEY_CODE = 27;
const ESCAPE_KEY_WITH_CODE = { key: ESCAPE_KEY, keyCode: ESCAPE_KEY_CODE, which: ESCAPE_KEY_CODE };
const SELECT_ID = 'test-select';
const SELECT_ANCHOR_TEXT = 'Open select popover';
const SELECT_POPOVER_OVERLAY_ID = 'test-select-popover';
const SELECT_OPTIONS = [{ value: 'first', label: 'First' }, { value: 'second', label: 'Second' }];

const TestSelectPopover = (): React.ReactNode => {
  const [isOpen, setIsOpen] = useState<boolean>(true);

  useOverlayRegistration(SELECT_POPOVER_OVERLAY_ID, isOpen);

  return (
    <Popover
      open={isOpen}
      onOpenChange={setIsOpen}
      trigger={ANTD_POPOVER_TRIGGER_CLICK}
      content={(
        <>
          <label htmlFor={SELECT_ID}>{SELECT_LABEL}</label>
          <Select id={SELECT_ID} options={SELECT_OPTIONS} defaultValue="first" />
        </>
      )}
    >
      <button type="button">{SELECT_ANCHOR_TEXT}</button>
    </Popover>
  );
};

const TestModal = (): React.ReactNode => {
  const [isOpen, setIsOpen] = useState<boolean>(true);

  useOverlayRegistration(MODAL_OVERLAY_ID, isOpen);

  return (
    <Modal open={isOpen} title={MODAL_TITLE} onCancel={() => setIsOpen(false)} footer={null}>
      <p>body</p>
    </Modal>
  );
};

const TestDrawer = (): React.ReactNode => {
  const [isOpen, setIsOpen] = useState<boolean>(true);

  useOverlayRegistration(DRAWER_OVERLAY_ID, isOpen);

  return (
    <Drawer open={isOpen} title={DRAWER_TITLE} onClose={() => setIsOpen(false)}>
      <p>body</p>
    </Drawer>
  );
};

interface RenderedHotkey {
  store: AppStore;
  stopSpy: () => number;
}

const renderHotkey = (isConnected: boolean, extraComponent: React.ReactNode = null): RenderedHotkey => {
  const store: AppStore = newStore();
  const dispatchSpy = vi.spyOn(store, 'dispatch');

  render(
    <Provider store={store}>
      <AntdTestProvider>
        <StopHotkey />
        {extraComponent}
      </AntdTestProvider>
    </Provider>,
  );

  if (isConnected) {
    act(() => {
      store.dispatch(new ConnectionStatusChanged({ connectionStatus: GRBL_CONNECTION_STATUS.CONNECTED }));
    });
  }

  const stopSpy = (): number =>
    dispatchSpy.mock.calls.filter(([action]) => action instanceof MachineStopRequested).length;

  return { store, stopSpy };
};

describe(StopHotkey.name, () => {
  it('under StrictMode stops once per Escape press and not after unmount', () => {
    const store: AppStore = newStore();
    const dispatchSpy = vi.spyOn(store, 'dispatch');
    const countStopRequests = (): number =>
      dispatchSpy.mock.calls.filter(([action]) => action instanceof MachineStopRequested).length;
    const { unmount } = render(
      <StrictMode>
        <Provider store={store}>
          <StopHotkey />
        </Provider>
      </StrictMode>,
    );

    act(() => {
      store.dispatch(new ConnectionStatusChanged({ connectionStatus: GRBL_CONNECTION_STATUS.CONNECTED }));
    });
    fireEvent.keyDown(document.body, { key: ESCAPE_KEY });

    expect(countStopRequests()).toBe(1);

    unmount();
    fireEvent.keyDown(document.body, { key: ESCAPE_KEY });

    expect(countStopRequests()).toBe(1);
  });

  it('Escape stops when connected and nothing is open', () => {
    const { stopSpy } = renderHotkey(true);

    fireEvent.keyDown(document.body, { key: ESCAPE_KEY });

    expect(stopSpy()).toBe(1);
  });

  it('Escape stops while typing in the console input', () => {
    const { stopSpy } = renderHotkey(true, <ConsolePanel />);

    fireEvent.keyDown(screen.getByLabelText(CONSOLE_INPUT_LABEL), { key: ESCAPE_KEY });

    expect(stopSpy()).toBe(1);
  });

  it('Escape with the connection popover open closes it and does not stop', () => {
    const { store, stopSpy } = renderHotkey(true, <ConnectionPill />);

    fireEvent.click(screen.getByRole('button', { name: DISCONNECTED_PATTERN }));
    expect(selectIsAnyOverlayOpen(store.getState())).toBe(true);

    fireEvent.keyDown(screen.getByRole('dialog', { name: POPOVER_LABEL }), { key: ESCAPE_KEY });

    expect(stopSpy()).toBe(0);
    expect(screen.queryByRole('dialog', { name: POPOVER_LABEL })).not.toBeInTheDocument();
  });

  it('Escape on a control inside the open connection popover closes it and does not stop', () => {
    const { store, stopSpy } = renderHotkey(true, <ConnectionPill />);

    fireEvent.click(screen.getByRole('button', { name: DISCONNECTED_PATTERN }));
    fireEvent.keyDown(screen.getByLabelText(PORT_LABEL), { key: ESCAPE_KEY });

    expect(stopSpy()).toBe(0);
    expect(screen.queryByRole('dialog', { name: POPOVER_LABEL })).not.toBeInTheDocument();
    expect(selectIsAnyOverlayOpen(store.getState())).toBe(false);
  });

  it('the next Escape after the popover closed stops', () => {
    const { stopSpy } = renderHotkey(true, <ConnectionPill />);

    fireEvent.click(screen.getByRole('button', { name: DISCONNECTED_PATTERN }));
    fireEvent.keyDown(screen.getByLabelText(PORT_LABEL), { key: ESCAPE_KEY });
    fireEvent.keyDown(document.body, { key: ESCAPE_KEY });

    expect(stopSpy()).toBe(1);
  });

  // The connection popover locks its selects while connected, so a stand-in popover holds the select here.
  it('Escape with a select dropdown open inside a popover closes only the dropdown and does not stop', async () => {
    const { store, stopSpy } = renderHotkey(true, <TestSelectPopover />);

    fireEvent.mouseDown(screen.getByRole('combobox', { name: SELECT_LABEL }));

    expect(screen.getByRole('combobox', { name: SELECT_LABEL })).toHaveAttribute('aria-expanded', 'true');

    fireEvent.keyDown(screen.getByRole('combobox', { name: SELECT_LABEL }), ESCAPE_KEY_WITH_CODE);

    expect(stopSpy()).toBe(0);
    await waitFor(() => {
      expect(screen.getByRole('combobox', { name: SELECT_LABEL })).toHaveAttribute('aria-expanded', 'false');
    });
    expect(selectIsAnyOverlayOpen(store.getState())).toBe(true);

    // antd's ids are all 'test-id' under NODE_ENV=test, so its Escape stack loses the popover when the dropdown
    // closes and a second Escape cannot close it here (it does in the browser); the anchor click closes it instead.
    fireEvent.click(screen.getByRole('button', { name: SELECT_ANCHOR_TEXT }));

    expect(selectIsAnyOverlayOpen(store.getState())).toBe(false);

    fireEvent.keyDown(document.body, { key: ESCAPE_KEY });

    expect(stopSpy()).toBe(1);
  });

  it('Escape with an antd Modal open closes it and does not stop', () => {
    const { store, stopSpy } = renderHotkey(true, <TestModal />);

    fireEvent.keyDown(screen.getByRole('dialog', { name: MODAL_TITLE }), { key: ESCAPE_KEY });

    expect(stopSpy()).toBe(0);
    expect(selectIsAnyOverlayOpen(store.getState())).toBe(false);
  });

  it('Escape with an antd Drawer open closes it and does not stop', () => {
    const { store, stopSpy } = renderHotkey(true, <TestDrawer />);

    fireEvent.keyDown(screen.getByRole('dialog', { name: DRAWER_TITLE }), { key: ESCAPE_KEY });

    expect(stopSpy()).toBe(0);
    expect(selectIsAnyOverlayOpen(store.getState())).toBe(false);
  });

  it('held Escape (repeat) stops only once', () => {
    const { stopSpy } = renderHotkey(true);

    fireEvent.keyDown(document.body, { key: ESCAPE_KEY });
    fireEvent.keyDown(document.body, { key: ESCAPE_KEY, repeat: true });
    fireEvent.keyDown(document.body, { key: ESCAPE_KEY, repeat: true });

    expect(stopSpy()).toBe(1);
  });

  it('Escape during IME composition does nothing', () => {
    const { stopSpy } = renderHotkey(true);

    fireEvent.keyDown(document.body, { key: ESCAPE_KEY, isComposing: true });

    expect(stopSpy()).toBe(0);
  });

  it('Escape while disconnected does nothing', () => {
    const { stopSpy } = renderHotkey(false);

    fireEvent.keyDown(document.body, { key: ESCAPE_KEY });

    expect(stopSpy()).toBe(0);
  });
});
