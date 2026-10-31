import { act, fireEvent, render, screen } from '@testing-library/react';
import { Provider } from 'react-redux';
import { ToastStack } from '.';
import { DEFAULT } from '../../utils/localization/default.locales';
import { newStore } from '../../utils/states/new.store';
import type { AppStore } from '../../utils/states/new.store';
import { NO_TOAST_PARAMETERS, TOAST_SEVERITY } from '../../utils/states/toast.constants';
import { ToastShown } from '../../utils/states/toast.state';

const ERROR_CODE = 9;
const ERROR_TEXT = 'Error 9: G-code is locked during an alarm or jog.';
const STOPPED_LINE_NUMBER = 5;
const STOPPED_ON_ERROR_TEXT = 'Job stopped at line 5: error 9 - G-code is locked during an alarm or jog.';
const NOT_RESPONDING_TEXT = 'The controller is not responding.';
const CONNECTED_TEXT = 'Connected to Grbl 1.1h';
const DISMISS_LABEL = 'Dismiss';
const TWICE_LABEL = '\u00D72';

const renderToastStack = (): AppStore => {
  const store: AppStore = newStore();

  render(
    <Provider store={store}>
      <ToastStack />
    </Provider>,
  );

  return store;
};

const showErrorToast = (store: AppStore): void => {
  act(() => {
    store.dispatch(new ToastShown({
      severity: TOAST_SEVERITY.ERROR,
      messageKey: DEFAULT.TOAST_GRBL_ERROR,
      messageParameters: { code: ERROR_CODE, description: DEFAULT.GRBL_ERROR_9 },
    }));
  });
};

describe(ToastStack.name, () => {
  it('interpolates the translated error description into the toast text', () => {
    const store: AppStore = renderToastStack();

    showErrorToast(store);

    expect(screen.getByRole('alert')).toHaveTextContent(ERROR_TEXT);
  });

  it('shows the translated error description in the stop-on-error toast', () => {
    const store: AppStore = renderToastStack();

    act(() => {
      store.dispatch(new ToastShown({
        severity: TOAST_SEVERITY.ERROR,
        messageKey: DEFAULT.TOAST_PROGRAM_STOPPED_ON_ERROR,
        messageParameters: { lineNumber: STOPPED_LINE_NUMBER, code: ERROR_CODE, description: DEFAULT.GRBL_ERROR_9 },
      }));
    });

    expect(screen.getByRole('alert')).toHaveTextContent(STOPPED_ON_ERROR_TEXT);
  });

  it('shows warnings as alerts and info as status', () => {
    const store: AppStore = renderToastStack();

    act(() => {
      store.dispatch(new ToastShown({
        severity: TOAST_SEVERITY.WARNING,
        messageKey: DEFAULT.TOAST_NOT_RESPONDING,
        messageParameters: NO_TOAST_PARAMETERS,
      }));
      store.dispatch(new ToastShown({
        severity: TOAST_SEVERITY.INFO,
        messageKey: DEFAULT.TOAST_CONNECTED,
        messageParameters: { firmware: 'Grbl', version: '1.1h' },
      }));
    });

    expect(screen.getByRole('alert')).toHaveTextContent(NOT_RESPONDING_TEXT);
    expect(screen.getByRole('status')).toHaveTextContent(CONNECTED_TEXT);
  });

  it('shows a repeat count when identical toasts merged', () => {
    const store: AppStore = renderToastStack();

    showErrorToast(store);
    showErrorToast(store);

    expect(screen.getAllByRole('alert')).toHaveLength(1);
    expect(screen.getByText(TWICE_LABEL)).toBeInTheDocument();
  });

  it('removes a toast when it is dismissed', () => {
    const store: AppStore = renderToastStack();

    showErrorToast(store);
    fireEvent.click(screen.getByRole('button', { name: DISMISS_LABEL }));

    expect(screen.queryByRole('alert')).not.toBeInTheDocument();
  });
});
