import { act, render, screen, within } from '@testing-library/react';
import { Provider } from 'react-redux';
import { BedPanel } from '.';
import { DEFAULT } from '../../utils/localization/default.locales';
import { newStore } from '../../utils/states/new.store';
import type { AppStore } from '../../utils/states/new.store';
import { NO_TOAST_PARAMETERS, TOAST_SEVERITY } from '../../utils/states/toast.constants';
import { ToastShown } from '../../utils/states/toast.state';

const NOT_RESPONDING_TEXT = 'The controller is not responding.';

describe(BedPanel.name, () => {
  it('shows toasts inside the bed region', () => {
    const store: AppStore = newStore();

    render(
      <Provider store={store}>
        <BedPanel />
      </Provider>,
    );
    act(() => {
      store.dispatch(new ToastShown({
        severity: TOAST_SEVERITY.WARNING,
        messageKey: DEFAULT.TOAST_NOT_RESPONDING,
        messageParameters: NO_TOAST_PARAMETERS,
      }));
    });

    expect(within(screen.getByRole('main')).getByText(NOT_RESPONDING_TEXT)).toBeInTheDocument();
  });
});
