/**
 * The toasts on screen: errors, alarms and notices that need the user's attention. Identical open toasts merge
 * into a repeat count, and info toasts dismiss themselves.
 *
 * @author michael.morosov
 *
 * @since 2026-10-30
 *
 * @copyright michael.morosov - All rights reserved.
 * You may not use, distribute or modify this code without explicit permission by michael.morosov.
 */
import { delay, put, select, takeEvery } from 'redux-saga/effects';
import { Action } from './action';
import { actionTypePrefixer } from './action.type.prefixer';
import type { ActionTypeFormatter } from './interfaces/ActionTypeFormatter';
import type { AppToast } from './interfaces/AppToast';
import type { ToastDismissedPayload } from './interfaces/ToastDismissedPayload';
import type { ToastShownPayload } from './interfaces/ToastShownPayload';
import { TOAST_LIFETIME_MS } from './toast.constants';

// #region State
export interface ToastState {
  /** The open toasts, oldest first. */
  toasts: AppToast[];
  /** Id the next new toast gets. */
  nextToastId: number;
}
// #endregion

// #region State name
export const TOAST_STATE_NAME = 'toast';
// #endregion

// #region Action type
const actionType: ActionTypeFormatter = actionTypePrefixer(TOAST_STATE_NAME);
// #endregion

// #region Actions
export class ToastShown extends Action<ToastShownPayload> {
  public static readonly type: string = actionType('toast shown');
}

export class ToastDismissed extends Action<ToastDismissedPayload> {
  public static readonly type: string = actionType('toast dismissed');
}
// #endregion

// #region Initial state
const FIRST_REPEAT_COUNT = 1;

const INITIAL_TOAST_STATE: ToastState = {
  toasts: [],
  nextToastId: 0,
};
// #endregion

// #region Reducer
const areParametersEqual = (
  first: Record<string, string | number>,
  second: Record<string, string | number>,
): boolean => {
  const firstKeys: string[] = Object.keys(first);

  return firstKeys.length === Object.keys(second).length
    && firstKeys.every((key: string) => Object.hasOwn(second, key) && first[key] === second[key]);
};

const isSameToast = (toast: AppToast, payload: ToastShownPayload): boolean =>
  toast.messageKey === payload.messageKey && areParametersEqual(toast.messageParameters, payload.messageParameters);

const getStateWithNewToast = (state: ToastState, payload: ToastShownPayload): ToastState => ({
  toasts: [...state.toasts, { toastId: state.nextToastId, ...payload, repeatCount: FIRST_REPEAT_COUNT }],
  nextToastId: state.nextToastId + 1,
});

const getStateWithToast = (state: ToastState, payload: ToastShownPayload): ToastState =>
  state.toasts.some((toast: AppToast) => isSameToast(toast, payload))
    ? {
      ...state,
      toasts: state.toasts.map((toast: AppToast) =>
        isSameToast(toast, payload) ? { ...toast, repeatCount: toast.repeatCount + 1 } : toast),
    }
    : getStateWithNewToast(state, payload);

export const toastReducer = (
  state: ToastState = INITIAL_TOAST_STATE,
  action: Action<unknown>,
): ToastState => {
  switch (action.type) {
  case ToastShown.type:
    return getStateWithToast(state, (action as ToastShown).payload);
  case ToastDismissed.type:
    return {
      ...state,
      toasts: state.toasts.filter((toast: AppToast) => toast.toastId !== (action as ToastDismissed).payload.toastId),
    };
  default:
    return state;
  }
};
// #endregion

// #region Sagas
function* expireToast(action: ToastShown): Generator {
  const toasts: AppToast[] = (yield select(selectToasts)) as AppToast[];
  const shownToast: AppToast | undefined = toasts.find((toast: AppToast) => isSameToast(toast, action.payload));

  // A toast that merged into an open one already has its timer; only a first occurrence starts one.
  if (shownToast?.repeatCount !== FIRST_REPEAT_COUNT) {
    return;
  }

  yield delay(TOAST_LIFETIME_MS);
  // Dismissing an id that is already gone changes nothing, so no timer needs cancelling.
  yield put(new ToastDismissed({ toastId: shownToast.toastId }));
}

export function* watchInfoToastExpiry(): Generator {
  yield takeEvery(ToastShown.type, expireToast);
}
// #endregion

// #region Selectors
type RootState = { [TOAST_STATE_NAME]: ToastState };

export const selectToasts = (state: RootState): AppToast[] => state[TOAST_STATE_NAME].toasts;
// #endregion
