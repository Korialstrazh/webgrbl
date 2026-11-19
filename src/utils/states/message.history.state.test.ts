/**
 * Tests for the message history: every shown toast is recorded with its time, counted as unread until read, and
 * cleared on request.
 *
 * @author michael.morosov
 *
 * @since 2026-11-09
 *
 * @copyright 2026 michael.morosov
 * Licensed under the Apache License, Version 2.0. See the LICENSE file.
 */
import { describe, expect, it, vi } from 'vitest';
import type { MessageHistoryEntry } from './interfaces/MessageHistoryEntry';
import {
  MAX_MESSAGE_HISTORY_ENTRIES,
  MessageHistoryCleared,
  MessageHistoryRead,
  selectMessageHistoryEntries,
  selectUnreadMessageCount,
} from './message.history.state';
import { newStore } from './new.store';
import type { AppStore } from './new.store';
import { NO_TOAST_PARAMETERS, TOAST_SEVERITY } from './toast.constants';
import { ToastShown } from './toast.state';

const SHOWN_AT_MS = 1_700_000_000_000;
const MESSAGE_KEY = 'TOAST_SAMPLE_ADDED';
const ERROR_KEY = 'TOAST_GRBL_ERROR';
const ERROR_PARAMETERS: Record<string, string | number> = { code: 9 };

const showToast = (store: AppStore, messageKey: string = MESSAGE_KEY): void => {
  store.dispatch(new ToastShown({
    severity: TOAST_SEVERITY.INFO,
    messageKey,
    messageParameters: NO_TOAST_PARAMETERS,
  }));
};

describe('message history', () => {
  it('records every shown toast, repeats included, with its severity, text values and time', () => {
    vi.spyOn(Date, 'now').mockReturnValue(SHOWN_AT_MS);

    const store: AppStore = newStore();

    showToast(store);
    showToast(store);
    store.dispatch(new ToastShown({
      severity: TOAST_SEVERITY.ERROR,
      messageKey: ERROR_KEY,
      messageParameters: ERROR_PARAMETERS,
    }));

    const entries: MessageHistoryEntry[] = selectMessageHistoryEntries(store.getState());

    const messageKeys: string[] = entries.map((entry: MessageHistoryEntry) => entry.messageKey);

    expect(messageKeys).toEqual([MESSAGE_KEY, MESSAGE_KEY, ERROR_KEY]);
    expect(entries[2]).toMatchObject({
      severity: TOAST_SEVERITY.ERROR,
      messageParameters: ERROR_PARAMETERS,
      shownAtMs: SHOWN_AT_MS,
    });
    expect(selectUnreadMessageCount(store.getState())).toBe(3);

    vi.restoreAllMocks();
  });

  it('keeps the messages but resets the unread count when read', () => {
    const store: AppStore = newStore();

    showToast(store);
    store.dispatch(new MessageHistoryRead());

    expect(selectUnreadMessageCount(store.getState())).toBe(0);
    expect(selectMessageHistoryEntries(store.getState())).toHaveLength(1);
  });

  it('empties the list and the unread count when cleared', () => {
    const store: AppStore = newStore();

    showToast(store);
    store.dispatch(new MessageHistoryCleared());

    expect(selectMessageHistoryEntries(store.getState())).toEqual([]);
    expect(selectUnreadMessageCount(store.getState())).toBe(0);
  });

  it('keeps only the newest messages beyond the limit', () => {
    const store: AppStore = newStore();

    for (let index = 0; index <= MAX_MESSAGE_HISTORY_ENTRIES; index++) {
      showToast(store, String(index));
    }

    const entries: MessageHistoryEntry[] = selectMessageHistoryEntries(store.getState());

    expect(entries).toHaveLength(MAX_MESSAGE_HISTORY_ENTRIES);
    expect(entries[0]?.messageKey).toBe('1');
  });
});
