/**
 * The message history: every toast that was shown, repeats included, with its time, so a message that closed itself
 * after five seconds can still be read. It counts the messages that arrived since the history was last opened, and
 * keeps the newest MAX_MESSAGE_HISTORY_ENTRIES only.
 *
 * @author michael.morosov
 *
 * @since 2026-11-09
 *
 * @copyright michael.morosov - All rights reserved.
 * You may not use, distribute or modify this code without explicit permission by michael.morosov.
 */
import { put, takeEvery } from 'redux-saga/effects';
import { Action } from './action';
import { actionTypePrefixer } from './action.type.prefixer';
import type { ActionTypeFormatter } from './interfaces/ActionTypeFormatter';
import type { MessageHistoryEntry } from './interfaces/MessageHistoryEntry';
import type { MessageRecordedPayload } from './interfaces/MessageRecordedPayload';
import { ToastShown } from './toast.state';

// #region State
export interface MessageHistoryState {
  /** The recorded messages, oldest first. */
  entries: MessageHistoryEntry[];
  /** Id the next recorded message gets. */
  nextEntryId: number;
  /** How many messages arrived since the history was last read. */
  unreadCount: number;
}
// #endregion

// #region State name
export const MESSAGE_HISTORY_STATE_NAME = 'messageHistory';
// #endregion

// #region Action type
const actionType: ActionTypeFormatter = actionTypePrefixer(MESSAGE_HISTORY_STATE_NAME);
// #endregion

// #region Actions
export class MessageRecorded extends Action<MessageRecordedPayload> {
  public static readonly type: string = actionType('message recorded');
}

export class MessageHistoryRead extends Action {
  public static readonly type: string = actionType('message history read');
}

export class MessageHistoryCleared extends Action {
  public static readonly type: string = actionType('message history cleared');
}
// #endregion

// #region Initial state
/** Enough for a long session; the oldest messages go first beyond it. */
export const MAX_MESSAGE_HISTORY_ENTRIES = 200;

const INITIAL_MESSAGE_HISTORY_STATE: MessageHistoryState = {
  entries: [],
  nextEntryId: 0,
  unreadCount: 0,
};
// #endregion

// #region Reducer
const getStateWithMessage = (state: MessageHistoryState, payload: MessageRecordedPayload): MessageHistoryState => ({
  entries: [...state.entries, { entryId: state.nextEntryId, ...payload }].slice(-MAX_MESSAGE_HISTORY_ENTRIES),
  nextEntryId: state.nextEntryId + 1,
  unreadCount: Math.min(state.unreadCount + 1, MAX_MESSAGE_HISTORY_ENTRIES),
});

export const messageHistoryReducer = (
  state: MessageHistoryState = INITIAL_MESSAGE_HISTORY_STATE,
  action: Action<unknown>,
): MessageHistoryState => {
  switch (action.type) {
  case MessageRecorded.type:
    return getStateWithMessage(state, (action as MessageRecorded).payload);
  case MessageHistoryRead.type:
    return { ...state, unreadCount: 0 };
  case MessageHistoryCleared.type:
    return { ...state, entries: [], unreadCount: 0 };
  default:
    return state;
  }
};
// #endregion

// #region Sagas
/** The time is taken here, not in the reducer, so the reducer stays pure. */
function* recordShownToast(action: ToastShown): Generator {
  const { severity, messageKey, messageParameters } = action.payload;

  yield put(new MessageRecorded({ severity, messageKey, messageParameters, shownAtMs: Date.now() }));
}

export function* watchShownToasts(): Generator {
  yield takeEvery(ToastShown.type, recordShownToast);
}
// #endregion

// #region Selectors
type RootState = { [MESSAGE_HISTORY_STATE_NAME]: MessageHistoryState };

export const selectMessageHistoryEntries = (state: RootState): MessageHistoryEntry[] =>
  state[MESSAGE_HISTORY_STATE_NAME].entries;

export const selectUnreadMessageCount = (state: RootState): number => state[MESSAGE_HISTORY_STATE_NAME].unreadCount;
// #endregion
