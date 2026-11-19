/**
 * The console: what was sent to and received from the laser, lines the app adds itself, and the commands the user
 * typed before.
 *
 * @author michael.morosov
 *
 * @since 2026-10-30
 *
 * @copyright 2026 michael.morosov
 * Licensed under the Apache License, Version 2.0. See the LICENSE file.
 */
import {
  GRBL_COMMAND_HISTORY_LIMIT,
  GRBL_CONSOLE_ENTRY_LIMIT,
  GRBL_EMPTY_TEXT,
} from '../grbl/grbl.constants';
import type { GrblConsoleEntry } from '../grbl/interfaces/GrblConsoleEntry';
import { Action } from './action';
import { actionTypePrefixer } from './action.type.prefixer';
import { GRBL_CONSOLE_VIEW_DIRECTION } from './grbl.console.view.direction';
import type { ActionTypeFormatter } from './interfaces/ActionTypeFormatter';
import type { GrblConsoleViewEntry } from './interfaces/GrblConsoleViewEntry';

// #region State
export interface GrblConsoleState {
  /** The newest console entries, oldest first, at most the console limit. */
  entries: GrblConsoleViewEntry[];
  /** True when status queries and status replies are shown; they are dropped on arrival otherwise. */
  isStatusReportVisible: boolean;
  /** Commands the user submitted, oldest first, at most the history limit. */
  commandHistory: string[];
  /** Id the next entry gets. */
  nextEntryId: number;
}
// #endregion

// #region State name
export const GRBL_CONSOLE_STATE_NAME = 'grblConsole';
// #endregion

// #region Action type
const actionType: ActionTypeFormatter = actionTypePrefixer(GRBL_CONSOLE_STATE_NAME);
// #endregion

// #region Actions
interface ConsoleEntryReceivedPayload {
  /** The entry the controller engine reported. */
  entry: GrblConsoleEntry;
}

interface ConsoleCommandSubmittedPayload {
  /** The command the user submitted. */
  commandText: string;
}

interface ConsoleInfoAddedPayload {
  /** Localisation key of the line. */
  messageKey: string;
  /** True when the line reports an error rather than information. */
  isError: boolean;
  /** When the line was added, in milliseconds since the epoch; given by the caller to keep the reducer pure. */
  timestamp: number;
  /** Values for the placeholders of the message, for example a raw error text. */
  messageParameters?: Record<string, string | number>;
}

export class ConsoleEntryReceived extends Action<ConsoleEntryReceivedPayload> {
  public static readonly type: string = actionType('console entry received');
}

export class ConsoleCommandSubmitted extends Action<ConsoleCommandSubmittedPayload> {
  public static readonly type: string = actionType('console command submitted');
}

export class StatusReportVisibilityToggled extends Action {
  public static readonly type: string = actionType('status report visibility toggled');
}

export class ConsoleInfoAdded extends Action<ConsoleInfoAddedPayload> {
  public static readonly type: string = actionType('console info added');
}
// #endregion

// #region Initial state
const INITIAL_GRBL_CONSOLE_STATE: GrblConsoleState = {
  entries: [],
  isStatusReportVisible: false,
  commandHistory: [],
  nextEntryId: 0,
};
// #endregion

// #region Reducer
const getStateWithEntry = (state: GrblConsoleState, entry: GrblConsoleViewEntry): GrblConsoleState => ({
  ...state,
  entries: [...state.entries, entry].slice(-GRBL_CONSOLE_ENTRY_LIMIT),
  nextEntryId: state.nextEntryId + 1,
});

const getStateWithEngineEntry = (state: GrblConsoleState, entry: GrblConsoleEntry): GrblConsoleState =>
  entry.isStatusReport && !state.isStatusReportVisible
    ? state
    : getStateWithEntry(state, {
      ...entry,
      entryId: state.nextEntryId,
      messageKey: undefined,
      messageParameters: undefined,
    });

const getStateWithInfo = (state: GrblConsoleState, payload: ConsoleInfoAddedPayload): GrblConsoleState =>
  getStateWithEntry(state, {
    direction: payload.isError ? GRBL_CONSOLE_VIEW_DIRECTION.ERROR : GRBL_CONSOLE_VIEW_DIRECTION.INFO,
    text: GRBL_EMPTY_TEXT,
    realtimeCommand: undefined,
    isStatusReport: false,
    timestamp: payload.timestamp,
    entryId: state.nextEntryId,
    messageKey: payload.messageKey,
    messageParameters: payload.messageParameters,
  });

const getStateWithCommand = (state: GrblConsoleState, commandText: string): GrblConsoleState =>
  state.commandHistory[state.commandHistory.length - 1] === commandText
    ? state
    : { ...state, commandHistory: [...state.commandHistory, commandText].slice(-GRBL_COMMAND_HISTORY_LIMIT) };

export const grblConsoleReducer = (
  state: GrblConsoleState = INITIAL_GRBL_CONSOLE_STATE,
  action: Action<unknown>,
): GrblConsoleState => {
  switch (action.type) {
  case ConsoleEntryReceived.type:
    return getStateWithEngineEntry(state, (action as ConsoleEntryReceived).payload.entry);
  case ConsoleCommandSubmitted.type:
    return getStateWithCommand(state, (action as ConsoleCommandSubmitted).payload.commandText);
  case StatusReportVisibilityToggled.type:
    return { ...state, isStatusReportVisible: !state.isStatusReportVisible };
  case ConsoleInfoAdded.type:
    return getStateWithInfo(state, (action as ConsoleInfoAdded).payload);
  default:
    return state;
  }
};
// #endregion

// #region Selectors
type RootState = { [GRBL_CONSOLE_STATE_NAME]: GrblConsoleState };

export const selectConsoleEntries = (state: RootState): GrblConsoleViewEntry[] =>
  state[GRBL_CONSOLE_STATE_NAME].entries;

export const selectIsStatusReportVisible = (state: RootState): boolean =>
  state[GRBL_CONSOLE_STATE_NAME].isStatusReportVisible;

export const selectCommandHistory = (state: RootState): string[] => state[GRBL_CONSOLE_STATE_NAME].commandHistory;
// #endregion
