import { act, fireEvent, render, screen } from '@testing-library/react';
import { useState } from 'react';
import { Provider } from 'react-redux';
import { StopHotkey } from '.';
import { ConsoleLogDialog } from '../ConsolePanel/ConsoleLogDialog';
import { PointerDetailsButton } from '../MachinePanel/LaserCard/PointerDetailsButton';
import { MessageHistoryDialog } from '../MessageHistoryDialog';
import { ObjectWarningChip } from '../ObjectsSection/ObjectWarningChip';
import { ProjectMenu } from '../TopBar/ProjectMenu';
import { ConsoleDock } from '../../routes/AppRoute/ConsoleDock';
import { ESCAPE_KEY } from '../../utils/browser/browser.events.constants';
import { GRBL_CONNECTION_STATUS } from '../../utils/grbl/grbl.constants';
import { ConnectionStatusChanged } from '../../utils/states/grbl.connection.state';
import { MachineStopRequested } from '../../utils/states/machine.status.state';
import { newStore } from '../../utils/states/new.store';
import type { AppStore } from '../../utils/states/new.store';
import { ConsoleOpenChanged, selectIsConsoleOpen } from '../../utils/states/panel.layout.state';
import { selectIsAnyOverlayOpen } from '../../utils/states/ui.overlay.state';
import { AntdTestProvider } from '../../utils/test.support/antd.test.provider';
import { setMatchMediaMatches } from '../../utils/test.support/match.media.mock';

const MESSAGES_TITLE = 'Messages';
const CONSOLE_LOG_TITLE = 'Console log';
const PROJECT_MENU_LABEL = 'Project';
const POINTER_DETAILS_LABEL = 'Laser pointer details';
const OBJECT_NAME = 'logo';
const OBJECT_WARNINGS_PATTERN = /^Problems with logo/;

interface RenderedHotkey {
  store: AppStore;
  stopSpy: () => number;
}

const renderConnectedHotkey = (extraComponent: React.ReactNode, isConsoleOpen: boolean = false): RenderedHotkey => {
  const store: AppStore = newStore();
  const dispatchSpy = vi.spyOn(store, 'dispatch');

  act(() => {
    store.dispatch(new ConnectionStatusChanged({ connectionStatus: GRBL_CONNECTION_STATUS.CONNECTED }));
    store.dispatch(new ConsoleOpenChanged({ isConsoleOpen }));
  });
  render(
    <Provider store={store}>
      <AntdTestProvider>
        <StopHotkey />
        {extraComponent}
      </AntdTestProvider>
    </Provider>,
  );

  const stopSpy = (): number =>
    dispatchSpy.mock.calls.filter(([action]) => action instanceof MachineStopRequested).length;

  return { store, stopSpy };
};

const OpenMessagesDialog = (): React.ReactNode => {
  const [isOpen, setIsOpen] = useState<boolean>(true);

  return <MessageHistoryDialog isOpen={isOpen} onClose={() => setIsOpen(false)} />;
};

const OpenConsoleLogDialog = (): React.ReactNode => {
  const [isOpen, setIsOpen] = useState<boolean>(true);

  return <ConsoleLogDialog isOpen={isOpen} onClose={() => setIsOpen(false)} />;
};

describe(`${StopHotkey.name} over overlays`, () => {
  it('in a narrow window the first Escape closes the console sheet and does not stop', () => {
    setMatchMediaMatches(false);
    const { store, stopSpy } = renderConnectedHotkey(<ConsoleDock />, true);

    expect(selectIsAnyOverlayOpen(store.getState())).toBe(true);

    fireEvent.keyDown(document.body, { key: ESCAPE_KEY });

    expect(stopSpy()).toBe(0);
    expect(selectIsConsoleOpen(store.getState())).toBe(false);
    expect(selectIsAnyOverlayOpen(store.getState())).toBe(false);

    fireEvent.keyDown(document.body, { key: ESCAPE_KEY });

    expect(stopSpy()).toBe(1);
  });

  it('in a wide window the docked console is no overlay, so Escape stops', () => {
    setMatchMediaMatches(true);
    const { store, stopSpy } = renderConnectedHotkey(<ConsoleDock />, true);

    fireEvent.keyDown(document.body, { key: ESCAPE_KEY });

    expect(stopSpy()).toBe(1);
    expect(selectIsConsoleOpen(store.getState())).toBe(true);
  });

  it('in a narrow window Escape over the messages dialog on the sheet closes only the dialog', () => {
    setMatchMediaMatches(false);
    const { store, stopSpy } = renderConnectedHotkey(<><ConsoleDock /><OpenMessagesDialog /></>, true);

    fireEvent.keyDown(screen.getByRole('dialog', { name: MESSAGES_TITLE }), { key: ESCAPE_KEY });

    expect(stopSpy()).toBe(0);
    expect(selectIsConsoleOpen(store.getState())).toBe(true);
    expect(selectIsAnyOverlayOpen(store.getState())).toBe(true);
  });

  it('Escape with the messages dialog open closes it and does not stop', () => {
    const { store, stopSpy } = renderConnectedHotkey(<OpenMessagesDialog />);

    fireEvent.keyDown(screen.getByRole('dialog', { name: MESSAGES_TITLE }), { key: ESCAPE_KEY });

    expect(stopSpy()).toBe(0);
    expect(selectIsAnyOverlayOpen(store.getState())).toBe(false);
  });

  it('Escape with the console log dialog open closes it and does not stop', () => {
    const { store, stopSpy } = renderConnectedHotkey(<OpenConsoleLogDialog />);

    fireEvent.keyDown(screen.getByRole('dialog', { name: CONSOLE_LOG_TITLE }), { key: ESCAPE_KEY });

    expect(stopSpy()).toBe(0);
    expect(selectIsAnyOverlayOpen(store.getState())).toBe(false);
  });

  it('the project menu registers as an open overlay', () => {
    const { store, stopSpy } = renderConnectedHotkey(<ProjectMenu />);

    fireEvent.click(screen.getByRole('button', { name: PROJECT_MENU_LABEL }));

    expect(selectIsAnyOverlayOpen(store.getState())).toBe(true);

    fireEvent.keyDown(document.body, { key: ESCAPE_KEY });

    expect(stopSpy()).toBe(0);
  });

  it('the laser pointer details popover registers as an open overlay', () => {
    const { store, stopSpy } = renderConnectedHotkey(<PointerDetailsButton />);

    fireEvent.click(screen.getByRole('button', { name: POINTER_DETAILS_LABEL }));

    expect(selectIsAnyOverlayOpen(store.getState())).toBe(true);

    fireEvent.keyDown(document.body, { key: ESCAPE_KEY });

    expect(stopSpy()).toBe(0);
  });

  it('the object problems popover registers as an open overlay', () => {
    const { store, stopSpy } = renderConnectedHotkey(
      <ObjectWarningChip objectName={OBJECT_NAME} isOutsideBed warningKinds={[]} />,
    );

    fireEvent.click(screen.getByRole('button', { name: OBJECT_WARNINGS_PATTERN }));

    expect(selectIsAnyOverlayOpen(store.getState())).toBe(true);

    fireEvent.keyDown(document.body, { key: ESCAPE_KEY });

    expect(stopSpy()).toBe(0);
  });
});
