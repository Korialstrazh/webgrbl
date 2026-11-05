import { act, fireEvent, render, screen } from '@testing-library/react';
import type { ReactNode } from 'react';
import { Provider } from 'react-redux';
import { AppRoute } from '.';
import { BedRegionDrawer } from '../../containers/BedRegionDrawer';
import { BedRegionModal } from '../../containers/BedRegionModal';
import { ESCAPE_KEY } from '../../utils/browser/browser.events.constants';
import { GRBL_CONNECTION_STATUS } from '../../utils/grbl/grbl.constants';
import { ConnectionStatusChanged } from '../../utils/states/grbl.connection.state';
import { MachineStopRequested } from '../../utils/states/machine.status.state';
import { newStore } from '../../utils/states/new.store';
import type { AppStore } from '../../utils/states/new.store';
import { selectIsAnyOverlayOpen } from '../../utils/states/ui.overlay.state';
import { AntdTestProvider } from '../../utils/test.support/antd.test.provider';
import { setMatchMediaMatches } from '../../utils/test.support/match.media.mock';

const STOP_LABEL = 'Stop';
const MODAL_TITLE = 'Test modal';
const DRAWER_TITLE = 'Test drawer';
const MODAL_OVERLAY_ID = 'test-modal';
const DRAWER_OVERLAY_ID = 'test-drawer';
const MODAL_ROOT_SELECTOR = '.ant-modal-root';
const DRAWER_ROOT_SELECTOR = '.ant-drawer';
const MODAL_MASK_SELECTOR = '.ant-modal-mask';
const DRAWER_MASK_SELECTOR = '.ant-drawer-mask';

// The design panel stands in for any region whose feature opens a dialog or drawer.
const designPanelMock = vi.hoisted(() => ({ renderDesignPanel: (): ReactNode => null }));

vi.mock('../../containers/DesignPanel', () => ({
  DesignPanel: (): ReactNode => designPanelMock.renderDesignPanel(),
}));

const newTestModal = (onClose: () => void): ReactNode => (
  <BedRegionModal isOpen overlayIdPrefix={MODAL_OVERLAY_ID} title={MODAL_TITLE} footer={null} onClose={onClose}>
    <p>body</p>
  </BedRegionModal>
);

const newTestDrawer = (onClose: () => void): ReactNode => (
  <BedRegionDrawer isOpen overlayIdPrefix={DRAWER_OVERLAY_ID} title={DRAWER_TITLE} onClose={onClose}>
    <p>body</p>
  </BedRegionDrawer>
);

interface RenderedWorkbench {
  store: AppStore;
  countStopRequests: () => number;
}

/** Renders the workbench and waits for its regions; in a wide window they wait for the stored panel sizes. */
const renderWorkbench = async (overlayComponent: ReactNode): Promise<RenderedWorkbench> => {
  const store: AppStore = newStore();
  const dispatchSpy = vi.spyOn(store, 'dispatch');

  designPanelMock.renderDesignPanel = (): ReactNode => overlayComponent;
  render(
    <Provider store={store}>
      <AntdTestProvider>
        <AppRoute />
      </AntdTestProvider>
    </Provider>,
  );
  act(() => {
    store.dispatch(new ConnectionStatusChanged({ connectionStatus: GRBL_CONNECTION_STATUS.CONNECTED }));
  });

  await screen.findByRole('main');

  const countStopRequests = (): number =>
    dispatchSpy.mock.calls.filter(([action]) => action instanceof MachineStopRequested).length;

  return { store, countStopRequests };
};

const getOverlayRoot = (selector: string): HTMLElement => {
  const overlayRoot: HTMLElement | null = document.querySelector(selector);

  if (!overlayRoot) {
    throw new Error(`No overlay root ${selector}`);
  }

  return overlayRoot;
};

const getNarrowRegionsHost = (): HTMLElement => {
  const narrowRegionsHost: HTMLElement | null = screen.getByRole('main').parentElement?.parentElement ?? null;

  if (!narrowRegionsHost) {
    throw new Error('No narrow regions box');
  }

  return narrowRegionsHost;
};

describe.each([
  {
    overlayName: 'dialog',
    title: MODAL_TITLE,
    rootSelector: MODAL_ROOT_SELECTOR,
    maskSelector: MODAL_MASK_SELECTOR,
    newOverlayComponent: newTestModal,
  },
  {
    overlayName: 'drawer',
    title: DRAWER_TITLE,
    rootSelector: DRAWER_ROOT_SELECTOR,
    maskSelector: DRAWER_MASK_SELECTOR,
    newOverlayComponent: newTestDrawer,
  },
])('AppRoute with a bed region $overlayName open', ({ title, rootSelector, maskSelector, newOverlayComponent }) => {
  it.each([true, false])('keeps STOP outside the overlay and clickable (wide: %s)', async (isWide: boolean) => {
    setMatchMediaMatches(isWide);

    const { countStopRequests } = await renderWorkbench(newOverlayComponent(vi.fn()));
    // In tests antd gives every useId the same id, so the Material select in the header takes over the dialog's name.
    await screen.findByText(title);
    const overlayRoot: HTMLElement = getOverlayRoot(rootSelector);
    const stopButton: HTMLElement = screen.getByRole('button', { name: STOP_LABEL });

    expect(screen.getByRole('dialog')).toContainElement(screen.getByText(title));
    // Wide, they fill the bed; narrow, the box of the shown region, whichever that is.
    const overlayHost: HTMLElement = isWide ? screen.getByRole('main') : getNarrowRegionsHost();

    expect(overlayHost).toContainElement(overlayRoot);
    expect(overlayHost).toContainElement(overlayRoot.querySelector(maskSelector));
    expect(overlayRoot).not.toContainElement(stopButton);
    expect(stopButton).toBeEnabled();

    fireEvent.click(stopButton);

    expect(countStopRequests()).toBe(1);
  });
});

describe('AppRoute with Escape pressed over an open overlay', () => {
  it('a dialog closes and the machine does not stop', async () => {
    const closeSpy = vi.fn();
    const { store, countStopRequests } = await renderWorkbench(newTestModal(closeSpy));

    expect(selectIsAnyOverlayOpen(store.getState())).toBe(true);

    fireEvent.keyDown(screen.getByRole('dialog'), { key: ESCAPE_KEY });

    expect(countStopRequests()).toBe(0);
    expect(closeSpy).toHaveBeenCalledTimes(1);
  });

  it('a drawer closes and the connected machine stops', async () => {
    const closeSpy = vi.fn();
    const { store, countStopRequests } = await renderWorkbench(newTestDrawer(closeSpy));

    expect(selectIsAnyOverlayOpen(store.getState())).toBe(true);

    fireEvent.keyDown(screen.getByRole('dialog'), { key: ESCAPE_KEY });

    expect(countStopRequests()).toBe(1);
    expect(closeSpy).toHaveBeenCalledTimes(1);
  });

  it('a drawer closes without a stop request while disconnected', async () => {
    const closeSpy = vi.fn();
    const { store, countStopRequests } = await renderWorkbench(newTestDrawer(closeSpy));

    act(() => {
      store.dispatch(new ConnectionStatusChanged({ connectionStatus: GRBL_CONNECTION_STATUS.DISCONNECTED }));
    });
    fireEvent.keyDown(screen.getByRole('dialog'), { key: ESCAPE_KEY });

    expect(countStopRequests()).toBe(0);
    expect(closeSpy).toHaveBeenCalledTimes(1);
  });
});
