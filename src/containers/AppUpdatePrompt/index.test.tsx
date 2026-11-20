import { fireEvent, render, screen } from '@testing-library/react';
import { Provider } from 'react-redux';
import { newStore } from '../../utils/states/new.store';
import { TopBar } from '../TopBar';
import { AppUpdatePrompt } from '.';

const OFFLINE_READY_TEXT = 'webgrbl is ready to work offline.';
const DISMISS_LABEL = 'Dismiss';
const DISCONNECTED_PATTERN = /^Connection: Not connected/;
const CHIP_CLASS_NAME = 'appUpdatePrompt';
const MESSAGE_CLASS_NAME = 'message';

const serviceWorkerState = vi.hoisted(() => ({ isOfflineReady: true, setIsOfflineReady: vi.fn() }));

vi.mock('virtual:pwa-register/react', () => ({
  useRegisterSW: () => ({
    needRefresh: [false, () => undefined],
    offlineReady: [serviceWorkerState.isOfflineReady, serviceWorkerState.setIsOfflineReady],
    updateServiceWorker: async () => undefined,
  }),
}));

const renderTopBar = (): void => {
  render(
    <Provider store={newStore()}>
      <TopBar />
    </Provider>,
  );
};

describe(AppUpdatePrompt.name, () => {
  it('shows the notice as a compact chip next to the connection pill, with the full text as its title', () => {
    renderTopBar();

    const noticeChip: HTMLElement = screen.getByRole('alert');

    expect(noticeChip.className).toContain(CHIP_CLASS_NAME);
    expect(noticeChip).toHaveAttribute('title', OFFLINE_READY_TEXT);
    // The chip sits in its own slot, so the connection pill is a neighbour of that slot.
    const trailingGroup: HTMLElement | null | undefined = noticeChip.parentElement?.parentElement;

    expect(trailingGroup).toContainElement(screen.getByRole('button', { name: DISCONNECTED_PATTERN }));
    expect(screen.getByText(OFFLINE_READY_TEXT).className).toContain(MESSAGE_CLASS_NAME);
  });

  it('dismisses the notice from its small button', () => {
    renderTopBar();
    fireEvent.click(screen.getByRole('button', { name: DISMISS_LABEL }));

    expect(serviceWorkerState.setIsOfflineReady).toHaveBeenCalledWith(false);
  });
});
