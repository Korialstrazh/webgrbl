/**
 * Tests for the message history bell: its unread badge, and the dialog that lists, reads and clears the messages.
 *
 * @author michael.morosov
 *
 * @since 2026-11-09
 *
 * @copyright michael.morosov - All rights reserved.
 * You may not use, distribute or modify this code without explicit permission by michael.morosov.
 */
import { act, fireEvent, render, screen, within } from '@testing-library/react';
import { Provider } from 'react-redux';
import { describe, expect, it } from 'vitest';
import { MessageHistoryButton } from '.';
import { selectMessageHistoryEntries } from '../../utils/states/message.history.state';
import { newStore } from '../../utils/states/new.store';
import type { AppStore } from '../../utils/states/new.store';
import { TOAST_SEVERITY } from '../../utils/states/toast.constants';
import { ToastShown } from '../../utils/states/toast.state';
import { AntdTestProvider } from '../../utils/test.support/antd.test.provider';

const OPEN_LABEL = 'Messages';
const OPEN_UNREAD_LABEL = 'Messages: 2 new';
const CLEAR_LABEL_PATTERN = /Clear all/;
const ERROR_TEXT = 'Error 9: G-code is locked during an alarm or jog.';
const SAMPLE_TEXT = 'Test sample added';

const renderButton = (store: AppStore): void => {
  render(
    <Provider store={store}>
      <AntdTestProvider>
        <MessageHistoryButton />
      </AntdTestProvider>
    </Provider>,
  );
};

const showToasts = (store: AppStore): void => {
  act(() => {
    store.dispatch(new ToastShown({
      severity: TOAST_SEVERITY.INFO,
      messageKey: 'TOAST_SAMPLE_ADDED',
      messageParameters: {},
    }));
    store.dispatch(new ToastShown({
      severity: TOAST_SEVERITY.ERROR,
      messageKey: 'TOAST_GRBL_ERROR',
      messageParameters: { code: 9, description: 'GRBL_ERROR_9' },
    }));
  });
};

describe(MessageHistoryButton.name, () => {
  it('counts the unread messages on the bell', () => {
    const store: AppStore = newStore();

    renderButton(store);

    expect(screen.getByRole('button', { name: OPEN_LABEL })).toBeInTheDocument();

    showToasts(store);

    expect(screen.getByRole('button', { name: OPEN_UNREAD_LABEL })).toBeInTheDocument();
  });

  it('lists every message newest first with its full text and marks them read', () => {
    const store: AppStore = newStore();

    renderButton(store);
    showToasts(store);
    fireEvent.click(screen.getByRole('button', { name: OPEN_UNREAD_LABEL }));

    const messages: HTMLElement[] = within(screen.getByRole('list', { name: OPEN_LABEL })).getAllByRole('listitem');

    expect(messages).toHaveLength(2);
    expect(messages[0]).toHaveTextContent(ERROR_TEXT);
    expect(messages[1]).toHaveTextContent(SAMPLE_TEXT);
    expect(messages[0]?.querySelector('time')).not.toBeNull();
    expect(screen.getByRole('button', { name: OPEN_LABEL })).toBeInTheDocument();
  });

  it('clears the list', () => {
    const store: AppStore = newStore();

    renderButton(store);
    showToasts(store);
    fireEvent.click(screen.getByRole('button', { name: OPEN_UNREAD_LABEL }));
    fireEvent.click(screen.getByRole('button', { name: CLEAR_LABEL_PATTERN }));

    expect(selectMessageHistoryEntries(store.getState())).toEqual([]);
    expect(screen.getByRole('button', { name: CLEAR_LABEL_PATTERN })).toBeDisabled();
  });
});
