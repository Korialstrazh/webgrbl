import { act, fireEvent, render, screen } from '@testing-library/react';
import { Provider } from 'react-redux';
import { TopBar } from '.';
import { ESCAPE_KEY } from '../../utils/browser/browser.events.constants';
import { GRBL_CONNECTION_STATUS } from '../../utils/grbl/grbl.constants';
import { ConnectionStatusChanged } from '../../utils/states/grbl.connection.state';
import { MachineStopRequested } from '../../utils/states/machine.status.state';
import { newStore } from '../../utils/states/new.store';
import type { AppStore } from '../../utils/states/new.store';
import { selectIsAnyOverlayOpen } from '../../utils/states/ui.overlay.state';
import { AntdTestProvider } from '../../utils/test.support/antd.test.provider';
import { BedRegionTestHost } from '../../utils/test.support/bed.region.test.host';
import { StopHotkey } from '../StopHotkey';

const COMING_SOON_CONTROL_LABELS: readonly string[] = [
  'Project',
  'Import SVG',
  'Materials',
  'Undo',
  'Redo',
];
const APP_TITLE = 'webgrbl';
const AUTOSAVE_TEXT = 'Autosave: off';
const DISCONNECTED_PATTERN = /Disconnected/;
const FIXED_HEIGHT_CLASS_NAME = 'fixedHeightBar';
const MACHINE_PROFILES_LABEL = 'Machine profiles';

const renderWorkbenchTopBar = (store: AppStore): void => {
  render(
    <Provider store={store}>
      <AntdTestProvider>
        <BedRegionTestHost>
          <TopBar />
          <StopHotkey />
        </BedRegionTestHost>
      </AntdTestProvider>
    </Provider>,
  );
};

describe(TopBar.name, () => {
  it('shows the app name, the autosave readout and the connection pill', () => {
    render(
      <Provider store={newStore()}>
        <TopBar />
      </Provider>,
    );

    expect(screen.getByRole('heading', { name: APP_TITLE })).toBeInTheDocument();
    expect(screen.getByText(AUTOSAVE_TEXT)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: DISCONNECTED_PATTERN })).toBeInTheDocument();
  });

  it.each(COMING_SOON_CONTROL_LABELS)('clicking the coming-soon control %s dispatches nothing', (label: string) => {
    const store: AppStore = newStore();
    const dispatchSpy = vi.spyOn(store, 'dispatch');

    render(
      <Provider store={store}>
        <TopBar />
      </Provider>,
    );
    fireEvent.click(screen.getByRole('button', { name: label, hidden: true }));

    expect(dispatchSpy).not.toHaveBeenCalled();
  });

  it('keeps a fixed height on one row', () => {
    render(
      <Provider store={newStore()}>
        <TopBar />
      </Provider>,
    );

    expect(screen.getByRole('banner').className).toContain(FIXED_HEIGHT_CLASS_NAME);
  });

  it('opens the machine profiles dialog as a registered overlay', () => {
    const store: AppStore = newStore();

    renderWorkbenchTopBar(store);
    fireEvent.click(screen.getByRole('button', { name: MACHINE_PROFILES_LABEL }));

    expect(screen.getByRole('dialog', { name: MACHINE_PROFILES_LABEL })).toBeInTheDocument();
    expect(selectIsAnyOverlayOpen(store.getState())).toBe(true);
  });

  it('closes the machine profiles dialog on Escape without stopping the machine', () => {
    const store: AppStore = newStore();
    const dispatchSpy = vi.spyOn(store, 'dispatch');

    renderWorkbenchTopBar(store);
    act(() => {
      store.dispatch(new ConnectionStatusChanged({ connectionStatus: GRBL_CONNECTION_STATUS.CONNECTED }));
    });
    fireEvent.click(screen.getByRole('button', { name: MACHINE_PROFILES_LABEL }));
    fireEvent.keyDown(screen.getByRole('dialog', { name: MACHINE_PROFILES_LABEL }), { key: ESCAPE_KEY });

    expect(screen.queryByRole('dialog', { name: MACHINE_PROFILES_LABEL })).not.toBeInTheDocument();
    expect(selectIsAnyOverlayOpen(store.getState())).toBe(false);
    expect(dispatchSpy.mock.calls.filter(([action]) => action instanceof MachineStopRequested)).toEqual([]);
  });
});
