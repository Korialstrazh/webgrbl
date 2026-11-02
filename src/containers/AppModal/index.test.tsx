import { fireEvent, render, screen } from '@testing-library/react';
import { Provider } from 'react-redux';
import { AppModal } from '.';
import { ESCAPE_KEY } from '../../utils/browser/browser.events.constants';
import { newStore } from '../../utils/states/new.store';
import type { AppStore } from '../../utils/states/new.store';
import { selectIsAnyOverlayOpen } from '../../utils/states/ui.overlay.state';
import { AntdTestProvider } from '../../utils/test.support/antd.test.provider';
import { getAppModalWidth } from './get.app.modal.width';

const MODAL_TITLE = 'Test dialog';
const MODAL_OVERLAY_ID = 'test-dialog';
const MODAL_MAX_WIDTH = '56rem';
const MODAL_ROOT_SELECTOR = '.ant-modal-root';
const MODAL_MASK_SELECTOR = '.ant-modal-mask';
const REGION_TEST_ID = 'region';

const renderAppModal = (store: AppStore, isOpen: boolean, onClose: () => void = vi.fn()): void => {
  render(
    <Provider store={store}>
      <AntdTestProvider>
        {/* A plain element: it stands in for a workbench region the dialog must not be confined to. */}
        <div data-testid={REGION_TEST_ID}>
          <AppModal
            isOpen={isOpen}
            overlayIdPrefix={MODAL_OVERLAY_ID}
            maxWidth={MODAL_MAX_WIDTH}
            title={MODAL_TITLE}
            footer={null}
            onClose={onClose}
          >
            <p>body</p>
          </AppModal>
        </div>
      </AntdTestProvider>
    </Provider>,
  );
};

const getModalRoot = (): HTMLElement => {
  const modalRoot: HTMLElement | null = document.querySelector(MODAL_ROOT_SELECTOR);

  if (!modalRoot) {
    throw new Error('No modal root');
  }

  return modalRoot;
};

describe(getAppModalWidth.name, () => {
  it('caps the width at the window width less both gutters', () => {
    expect(getAppModalWidth(MODAL_MAX_WIDTH)).toBe('min(56rem, calc(100vw - 2rem))');
  });
});

describe(AppModal.name, () => {
  it('renders into the page body with a mask over the whole window, not inside the region that opened it', async () => {
    renderAppModal(newStore(), true);
    await screen.findByRole('dialog', { name: MODAL_TITLE });
    const modalRoot: HTMLElement = getModalRoot();

    expect(screen.getByTestId(REGION_TEST_ID)).not.toContainElement(modalRoot);
    expect(document.body).toContainElement(modalRoot);
    expect(modalRoot.querySelector(MODAL_MASK_SELECTOR)).toBeInTheDocument();
  });

  it('registers as an open overlay only while shown', () => {
    const openStore: AppStore = newStore();
    const closedStore: AppStore = newStore();

    renderAppModal(openStore, true);
    renderAppModal(closedStore, false);

    expect(selectIsAnyOverlayOpen(openStore.getState())).toBe(true);
    expect(selectIsAnyOverlayOpen(closedStore.getState())).toBe(false);
  });

  it('asks to close on Escape', async () => {
    const closeSpy = vi.fn();

    renderAppModal(newStore(), true, closeSpy);
    fireEvent.keyDown(await screen.findByRole('dialog', { name: MODAL_TITLE }), { key: ESCAPE_KEY });

    expect(closeSpy).toHaveBeenCalledTimes(1);
  });
});
