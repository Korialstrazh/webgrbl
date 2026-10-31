import { act, fireEvent, render, screen } from '@testing-library/react';
import { Drawer, Modal } from 'antd';
import { StrictMode, useState } from 'react';
import { Provider } from 'react-redux';
import { StopHotkey } from '.';
import { ConnectionPill } from '../ConnectionPill';
import { ConsolePanel } from '../ConsolePanel';
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
const DISCONNECTED_PATTERN = /Disconnected|Connected/;
const POPOVER_LABEL = 'Laser connection';
const PORT_LABEL = 'Port';
const MODAL_TITLE = 'Test modal';
const MODAL_OVERLAY_ID = 'test-modal';
const DRAWER_TITLE = 'Test drawer';
const DRAWER_OVERLAY_ID = 'test-drawer';

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
