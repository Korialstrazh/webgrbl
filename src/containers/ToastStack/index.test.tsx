import { vi } from 'vitest';
import { act, fireEvent, render, screen } from '@testing-library/react';
import { Provider } from 'react-redux';
import { ToastStack } from '.';
import { TOAST_STACK_TEST_ID } from './toast.stack.constants';
import { DEFAULT } from '../../utils/localization/default.locales';
import { newStore } from '../../utils/states/new.store';
import type { AppStore } from '../../utils/states/new.store';
import { NO_TOAST_PARAMETERS, TOAST_SEVERITY } from '../../utils/states/toast.constants';
import { ProjectUndoRequested } from '../../utils/states/project.document.state';
import { ToastShown, selectToasts } from '../../utils/states/toast.state';

const ERROR_CODE = 9;
const ERROR_TEXT = 'Error 9: G-code is locked during an alarm or jog.';
const STOPPED_LINE_NUMBER = 5;
const STOPPED_ON_ERROR_TEXT = 'Job stopped at line 5: error 9 - G-code is locked during an alarm or jog.';
const NOT_RESPONDING_TEXT = 'The controller is not responding.';
const CONNECTED_TEXT = 'Connected to Grbl 1.1h';
const DISMISS_LABEL = 'Dismiss';
const DEFAULT_UNDO_LABEL = 'Undo';
const ANTD_BUTTON_CLASS_NAME = 'ant-btn';
const ANTD_SMALL_BUTTON_CLASS_NAME = 'ant-btn-sm';
const TWICE_LABEL = '\u00D72';

const NARROW_CLASS_NAME = 'narrow';

const renderToastStack = (isWide: boolean = true): AppStore => {
  const store: AppStore = newStore();

  render(
    <Provider store={store}>
      <ToastStack isWide={isWide} />
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

  it('builds the dismiss button from a small antd button', () => {
    const store: AppStore = renderToastStack();

    showErrorToast(store);

    expect(screen.getByRole('button', { name: DISMISS_LABEL })).toHaveClass(ANTD_BUTTON_CLASS_NAME);
    expect(screen.getByRole('button', { name: DISMISS_LABEL })).toHaveClass(ANTD_SMALL_BUTTON_CLASS_NAME);
  });

  it('removes a toast when it is dismissed', () => {
    const store: AppStore = renderToastStack();

    showErrorToast(store);
    fireEvent.click(screen.getByRole('button', { name: DISMISS_LABEL }));

    expect(screen.queryByRole('alert')).not.toBeInTheDocument();
  });

  it('keeps a shorter stack in a narrow window', () => {
    renderToastStack(false);

    expect(screen.getByTestId(TOAST_STACK_TEST_ID).className).toContain(NARROW_CLASS_NAME);
  });

  it('uses the full stack width in a wide window', () => {
    renderToastStack(true);

    expect(screen.getByTestId(TOAST_STACK_TEST_ID).className).not.toContain(NARROW_CLASS_NAME);
  });
});

describe(`${ToastStack.name} undo action`, () => {
  const showUndoToast = (store: AppStore): void => {
    act(() => {
      store.dispatch(new ToastShown({
        severity: TOAST_SEVERITY.INFO,
        messageKey: DEFAULT.TOAST_SAMPLE_ADDED,
        messageParameters: NO_TOAST_PARAMETERS,
        isUndoOffered: true,
      }));
    });
  };

  it('undoes the change and closes the toast', () => {
    const store: AppStore = renderToastStack();
    const dispatchSpy = vi.spyOn(store, 'dispatch');

    showUndoToast(store);
    fireEvent.click(screen.getByRole('button', { name: DEFAULT_UNDO_LABEL }));

    expect(dispatchSpy).toHaveBeenCalledWith(expect.any(ProjectUndoRequested));
    expect(selectToasts(store.getState())).toHaveLength(0);
  });

  it('offers no undo on other toasts', () => {
    const store: AppStore = renderToastStack();

    showErrorToast(store);

    expect(screen.queryByRole('button', { name: DEFAULT_UNDO_LABEL })).not.toBeInTheDocument();
  });
});
