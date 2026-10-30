/**
 * What the browser this app runs in can do: whether it is online and whether it offers the Web Serial API that
 * talks to the laser controller. Kept in Redux so the UI can explain why connecting is impossible.
 *
 * @author michael.morosov
 *
 * @since 2026-10-30
 *
 * @copyright michael.morosov - All rights reserved.
 * You may not use, distribute or modify this code without explicit permission by michael.morosov.
 */
import { eventChannel } from 'redux-saga';
import type { EventChannel } from 'redux-saga';
import { call, put, take } from 'redux-saga/effects';
import { Action } from './action';
import { actionTypePrefixer } from './action.type.prefixer';
import type { ActionTypeFormatter } from './interfaces/ActionTypeFormatter';

// #region State
export interface BrowserEnvironmentState {
  /** True while the browser reports a network connection; the app keeps working offline either way. */
  isOnline: boolean;
  /** True when navigator.serial exists, which only Chromium-based desktop browsers offer. */
  isWebSerialSupported: boolean;
}
// #endregion

// #region State name
export const BROWSER_ENVIRONMENT_STATE_NAME = 'browserEnvironment';
// #endregion

// #region Action type
const actionType: ActionTypeFormatter = actionTypePrefixer(BROWSER_ENVIRONMENT_STATE_NAME);
// #endregion

// #region Actions
interface OnlineStatusPayload {
  /** The connection state the browser just reported. */
  isOnline: boolean;
}

export class OnlineStatusChangeReceived extends Action<OnlineStatusPayload> {
  public static readonly type: string = actionType('online status change received');
}
// #endregion

// #region Initial state
const isWebSerialAvailable = (): boolean => 'serial' in navigator;

const getInitialBrowserEnvironmentState = (): BrowserEnvironmentState => ({
  isOnline: navigator.onLine,
  isWebSerialSupported: isWebSerialAvailable(),
});
// #endregion

// #region Reducer
export const browserEnvironmentReducer = (
  state: BrowserEnvironmentState = getInitialBrowserEnvironmentState(),
  action: Action<unknown>,
): BrowserEnvironmentState => {
  switch (action.type) {
  case OnlineStatusChangeReceived.type:
    return { ...state, isOnline: (action as OnlineStatusChangeReceived).payload.isOnline };
  default:
    return state;
  }
};
// #endregion

// #region Sagas
const ONLINE_EVENT_NAME = 'online';
const OFFLINE_EVENT_NAME = 'offline';

const newOnlineStatusChannel = (): EventChannel<boolean> => eventChannel((emit: (isOnline: boolean) => void) => {
  const emitOnline = (): void => emit(true);
  const emitOffline = (): void => emit(false);

  window.addEventListener(ONLINE_EVENT_NAME, emitOnline);
  window.addEventListener(OFFLINE_EVENT_NAME, emitOffline);

  return (): void => {
    window.removeEventListener(ONLINE_EVENT_NAME, emitOnline);
    window.removeEventListener(OFFLINE_EVENT_NAME, emitOffline);
  };
});

export function* watchOnlineStatus(): Generator {
  const onlineStatusChannel: EventChannel<boolean> = (yield call(newOnlineStatusChannel)) as EventChannel<boolean>;

  while (true) {
    const isOnline: boolean = (yield take(onlineStatusChannel)) as boolean;

    yield put(new OnlineStatusChangeReceived({ isOnline }));
  }
}
// #endregion

// #region Selectors
type RootState = { [BROWSER_ENVIRONMENT_STATE_NAME]: BrowserEnvironmentState };

export const selectIsOnline = (state: RootState): boolean => state[BROWSER_ENVIRONMENT_STATE_NAME].isOnline;

export const selectIsWebSerialSupported = (state: RootState): boolean =>
  state[BROWSER_ENVIRONMENT_STATE_NAME].isWebSerialSupported;
// #endregion
