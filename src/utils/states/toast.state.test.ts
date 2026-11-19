/**
 * Tests for the toast state: merging identical toasts, dismissing, and the expiry of info toasts.
 *
 * @author michael.morosov
 *
 * @since 2026-10-30
 *
 * @copyright 2026 michael.morosov
 * Licensed under the Apache License, Version 2.0. See the LICENSE file.
 */
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { Action } from './action';
import type { AppToast } from './interfaces/AppToast';
import { newStore } from './new.store';
import type { AppStore } from './new.store';
import { TOAST_LIFETIME_MS, TOAST_SEVERITY } from './toast.constants';
import {
  ToastDismissed,
  ToastShown,
  selectToasts,
  toastReducer,
  watchInfoToastExpiry,
} from './toast.state';
import type { ToastState } from './toast.state';

const UNKNOWN_ACTION_TYPE = 'unknown action';
const JUST_BEFORE_EXPIRY_MS = TOAST_LIFETIME_MS - 1;
const MESSAGE_KEY = 'TOAST_GRBL_ERROR';
const OTHER_MESSAGE_KEY = 'TOAST_CONNECTED';
const FIRST_PARAMETERS = { code: 20, description: 'first' };
const SECOND_PARAMETERS = { code: 21, description: 'second' };
const NO_PARAMETERS = {};
const EXPECTED_REPEAT_COUNT = 2;
const SINGLE_TOAST_COUNT = 1;
const TWO_TOASTS_COUNT = 2;
const NO_TOASTS_COUNT = 0;
const FIRST_TOAST_ID = 0;
const SECOND_TOAST_ID = 1;
const UNKNOWN_TOAST_ID = 99;

class UnknownAction extends Action {
  public static readonly type: string = UNKNOWN_ACTION_TYPE;
}

const getInitialState = (): ToastState => toastReducer(undefined, new UnknownAction());

const getToastIds = (toasts: AppToast[]): number[] => toasts.map((toast: AppToast) => toast.toastId);

describe(toastReducer.name, () => {
  it('starts without toasts', () => {
    expect(getInitialState().toasts).toEqual([]);
  });

  it('adds a toast with a repeat count of 1', () => {
    const state: ToastState = toastReducer(
      getInitialState(),
      new ToastShown({ severity: TOAST_SEVERITY.ERROR, messageKey: MESSAGE_KEY, messageParameters: FIRST_PARAMETERS }),
    );

    expect(state.toasts).toEqual([{
      toastId: FIRST_TOAST_ID,
      severity: TOAST_SEVERITY.ERROR,
      messageKey: MESSAGE_KEY,
      messageParameters: FIRST_PARAMETERS,
      repeatCount: 1,
    }]);
  });

  it('merges an identical toast into the repeat count', () => {
    const shown = new ToastShown({
      severity: TOAST_SEVERITY.ERROR,
      messageKey: MESSAGE_KEY,
      messageParameters: FIRST_PARAMETERS,
    });
    const identical = new ToastShown({
      severity: TOAST_SEVERITY.ERROR,
      messageKey: MESSAGE_KEY,
      messageParameters: { ...FIRST_PARAMETERS },
    });
    const state: ToastState = toastReducer(toastReducer(getInitialState(), shown), identical);

    expect(state.toasts).toHaveLength(SINGLE_TOAST_COUNT);
    expect(state.toasts[0]?.repeatCount).toBe(EXPECTED_REPEAT_COUNT);
  });

  it('adds a new toast when a parameter differs', () => {
    const first = new ToastShown({
      severity: TOAST_SEVERITY.ERROR,
      messageKey: MESSAGE_KEY,
      messageParameters: FIRST_PARAMETERS,
    });
    const second = new ToastShown({
      severity: TOAST_SEVERITY.ERROR,
      messageKey: MESSAGE_KEY,
      messageParameters: SECOND_PARAMETERS,
    });
    const state: ToastState = toastReducer(toastReducer(getInitialState(), first), second);

    expect(getToastIds(state.toasts)).toEqual([FIRST_TOAST_ID, SECOND_TOAST_ID]);
  });

  it('adds a new toast when the key differs', () => {
    const first = new ToastShown({
      severity: TOAST_SEVERITY.INFO,
      messageKey: MESSAGE_KEY,
      messageParameters: NO_PARAMETERS,
    });
    const second = new ToastShown({
      severity: TOAST_SEVERITY.INFO,
      messageKey: OTHER_MESSAGE_KEY,
      messageParameters: NO_PARAMETERS,
    });

    expect(toastReducer(toastReducer(getInitialState(), first), second).toasts).toHaveLength(TWO_TOASTS_COUNT);
  });

  it('removes a dismissed toast and ignores an unknown id', () => {
    const shown: ToastState = toastReducer(
      getInitialState(),
      new ToastShown({ severity: TOAST_SEVERITY.WARNING, messageKey: MESSAGE_KEY, messageParameters: NO_PARAMETERS }),
    );

    expect(toastReducer(shown, new ToastDismissed({ toastId: UNKNOWN_TOAST_ID })).toasts)
      .toHaveLength(SINGLE_TOAST_COUNT);
    expect(toastReducer(shown, new ToastDismissed({ toastId: FIRST_TOAST_ID })).toasts)
      .toHaveLength(NO_TOASTS_COUNT);
  });
});

describe(watchInfoToastExpiry.name, () => {
  let store: AppStore;

  beforeEach(() => {
    vi.useFakeTimers();
    store = newStore();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('dismisses an info toast after its lifetime', async () => {
    store.dispatch(new ToastShown({
      severity: TOAST_SEVERITY.INFO,
      messageKey: OTHER_MESSAGE_KEY,
      messageParameters: NO_PARAMETERS,
    }));

    await vi.advanceTimersByTimeAsync(JUST_BEFORE_EXPIRY_MS);
    expect(selectToasts(store.getState())).toHaveLength(SINGLE_TOAST_COUNT);

    await vi.advanceTimersByTimeAsync(1);
    expect(selectToasts(store.getState())).toHaveLength(NO_TOASTS_COUNT);
  });

  it.each([TOAST_SEVERITY.WARNING, TOAST_SEVERITY.ERROR])('dismisses a %s toast after it too', async (severity) => {
    store.dispatch(new ToastShown({ severity, messageKey: MESSAGE_KEY, messageParameters: NO_PARAMETERS }));

    await vi.advanceTimersByTimeAsync(JUST_BEFORE_EXPIRY_MS);
    expect(selectToasts(store.getState())).toHaveLength(SINGLE_TOAST_COUNT);

    await vi.advanceTimersByTimeAsync(1);
    expect(selectToasts(store.getState())).toHaveLength(NO_TOASTS_COUNT);
  });

  it('does nothing harmful when an info toast was dismissed before it expired', async () => {
    store.dispatch(new ToastShown({
      severity: TOAST_SEVERITY.INFO,
      messageKey: OTHER_MESSAGE_KEY,
      messageParameters: NO_PARAMETERS,
    }));
    store.dispatch(new ToastDismissed({ toastId: FIRST_TOAST_ID }));
    store.dispatch(new ToastShown({
      severity: TOAST_SEVERITY.ERROR,
      messageKey: MESSAGE_KEY,
      messageParameters: NO_PARAMETERS,
    }));

    await vi.advanceTimersByTimeAsync(JUST_BEFORE_EXPIRY_MS);

    expect(getToastIds(selectToasts(store.getState()))).toEqual([SECOND_TOAST_ID]);
  });
});
