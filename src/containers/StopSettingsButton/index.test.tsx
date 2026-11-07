import { act, fireEvent, render, screen } from '@testing-library/react';
import { Provider } from 'react-redux';
import { describe, expect, it } from 'vitest';
import { StopSettingsButton } from '.';
import { selectIsEscStoppingWithOverlayOpen } from '../../utils/states/app.preferences.state';
import { newStore } from '../../utils/states/new.store';
import type { AppStore } from '../../utils/states/new.store';
import { OVERLAY_KIND } from '../../utils/states/overlay.kind.constants';
import { OverlayOpened, selectIsAnyOverlayOpen } from '../../utils/states/ui.overlay.state';
import { AntdTestProvider } from '../../utils/test.support/antd.test.provider';

const SETTINGS_LABEL = 'Stop settings';
const PREFERENCE_LABEL = 'Esc stops over panels too';
const DIALOG_OVERLAY_ID = 'test-dialog';
const PREFERENCE_HINT = 'One Esc closes the panel and stops.';

describe(StopSettingsButton.name, () => {
  it('opens a popover whose checkbox is off by default and turns the preference on', () => {
    const store: AppStore = newStore();
    render(
      <Provider store={store}>
        <AntdTestProvider>
          <StopSettingsButton />
        </AntdTestProvider>
      </Provider>,
    );

    fireEvent.click(screen.getByRole('button', { name: SETTINGS_LABEL }));

    expect(selectIsAnyOverlayOpen(store.getState())).toBe(true);
    expect(screen.getByRole('checkbox', { name: PREFERENCE_LABEL })).not.toBeChecked();

    fireEvent.click(screen.getByRole('checkbox', { name: PREFERENCE_LABEL }));

    expect(selectIsEscStoppingWithOverlayOpen(store.getState())).toBe(true);
    expect(screen.getByRole('checkbox', { name: PREFERENCE_LABEL })).toBeChecked();
    expect(screen.getByText(PREFERENCE_HINT)).toBeInTheDocument();
  });

  it('closes when a dialog opens', () => {
    const store: AppStore = newStore();
    render(
      <Provider store={store}>
        <AntdTestProvider>
          <StopSettingsButton />
        </AntdTestProvider>
      </Provider>,
    );

    fireEvent.click(screen.getByRole('button', { name: SETTINGS_LABEL }));
    act(() => {
      store.dispatch(new OverlayOpened({ overlayId: DIALOG_OVERLAY_ID, overlayKind: OVERLAY_KIND.DIALOG }));
    });

    expect(store.getState().uiOverlay.openOverlayIds).toEqual([DIALOG_OVERLAY_ID]);
  });
});
