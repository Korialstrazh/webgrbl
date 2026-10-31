/**
 * Tests for useOverlayRegistration: the registry follows the open flag and unmount.
 *
 * @author michael.morosov
 *
 * @since 2026-10-31
 *
 * @copyright michael.morosov - All rights reserved.
 * You may not use, distribute or modify this code without explicit permission by michael.morosov.
 */
import { render } from '@testing-library/react';
import type { ReactNode } from 'react';
import { Provider } from 'react-redux';
import { describe, expect, it } from 'vitest';
import { newStore } from '../states/new.store';
import type { AppStore } from '../states/new.store';
import { selectIsAnyOverlayOpen } from '../states/ui.overlay.state';
import { useOverlayRegistration } from './use.overlay.registration';

const OVERLAY_ID = 'test-overlay';

interface RegisteredOverlayProps {
  isOpen: boolean;
}

const RegisteredOverlay = ({ isOpen }: RegisteredOverlayProps): ReactNode => {
  useOverlayRegistration(OVERLAY_ID, isOpen);

  return null;
};

const renderRegisteredOverlay = (store: AppStore, isOpen: boolean) => render(
  <Provider store={store}>
    <RegisteredOverlay isOpen={isOpen} />
  </Provider>,
);

describe(useOverlayRegistration.name, () => {
  it('marks an overlay open while mounted open and closed after unmount', () => {
    const store: AppStore = newStore();
    const { unmount } = renderRegisteredOverlay(store, true);

    expect(selectIsAnyOverlayOpen(store.getState())).toBe(true);

    unmount();

    expect(selectIsAnyOverlayOpen(store.getState())).toBe(false);
  });

  it('does not register an overlay that is closed', () => {
    const store: AppStore = newStore();
    renderRegisteredOverlay(store, false);

    expect(selectIsAnyOverlayOpen(store.getState())).toBe(false);
  });

  it('closes the overlay when the open flag turns false', () => {
    const store: AppStore = newStore();
    const { rerender } = renderRegisteredOverlay(store, true);

    rerender(
      <Provider store={store}>
        <RegisteredOverlay isOpen={false} />
      </Provider>,
    );

    expect(selectIsAnyOverlayOpen(store.getState())).toBe(false);
  });
});
