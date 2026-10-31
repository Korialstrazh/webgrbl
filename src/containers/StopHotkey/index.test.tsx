import { act, fireEvent, render, screen } from '@testing-library/react';
import { StrictMode } from 'react';
import { Provider } from 'react-redux';
import { StopHotkey } from '.';
import { ConnectionPill } from '../ConnectionPill';
import { ConsolePanel } from '../ConsolePanel';
import { ESCAPE_KEY } from '../../utils/browser/browser.events.constants';
import { Dialog } from '../../views/Dialog';
import { GRBL_CONNECTION_STATUS } from '../../utils/grbl/grbl.constants';
import { useOverlayRegistration } from '../../utils/hooks/use.overlay.registration';
import { ConnectionStatusChanged } from '../../utils/states/grbl.connection.state';
import { MachineStopRequested } from '../../utils/states/machine.status.state';
import { newStore } from '../../utils/states/new.store';
import type { AppStore } from '../../utils/states/new.store';
import { selectIsAnyOverlayOpen } from '../../utils/states/ui.overlay.state';

const CONSOLE_INPUT_LABEL = 'Console command';
const DISCONNECTED_PATTERN = /Disconnected|Connected/;
const POPOVER_LABEL = 'Laser connection';
const DIALOG_TITLE = 'Test dialog';
const DIALOG_OVERLAY_ID = 'test-dialog';

const TestDialog = (): React.ReactNode => {
  useOverlayRegistration(DIALOG_OVERLAY_ID, true);

  return (
    <Dialog isOpen title={DIALOG_TITLE} onClose={vi.fn()}>
      <p>body</p>
    </Dialog>
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
      <StopHotkey />
      {extraComponent}
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

  it('Escape with a Dialog open does not stop', () => {
    const { stopSpy } = renderHotkey(true, <TestDialog />);

    fireEvent.keyDown(screen.getByRole('dialog'), { key: ESCAPE_KEY });

    expect(stopSpy()).toBe(0);
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
