import { describe, expect, it } from 'vitest';
import {
  GRBL_COMMAND_HISTORY_LIMIT,
  GRBL_CONSOLE_DIRECTION,
  GRBL_CONSOLE_ENTRY_LIMIT,
} from '../grbl/grbl.constants';
import type { GrblConsoleEntry } from '../grbl/interfaces/GrblConsoleEntry';
import { Action } from './action';
import {
  ConsoleCommandSubmitted,
  ConsoleEntryReceived,
  ConsoleInfoAdded,
  GRBL_CONSOLE_STATE_NAME,
  StatusReportVisibilityToggled,
  grblConsoleReducer,
  selectCommandHistory,
  selectConsoleEntries,
  selectIsStatusReportVisible,
} from './grbl.console.state';
import { GRBL_CONSOLE_VIEW_DIRECTION } from './grbl.console.view.direction';
import type { GrblConsoleState } from './grbl.console.state';

const UNKNOWN_ACTION_TYPE = 'unknown action';
const TEST_TIMESTAMP = 1_000;
const TEST_MESSAGE_KEY = 'CONSOLE_CONNECTION_LOST';
const TEST_RAW_ERROR = 'raw error text';

class UnknownAction extends Action {
  public static readonly type: string = UNKNOWN_ACTION_TYPE;
}

const getEntry = (text: string, isStatusReport = false): GrblConsoleEntry => ({
  direction: GRBL_CONSOLE_DIRECTION.RECEIVED,
  text,
  realtimeCommand: undefined,
  isStatusReport,
  timestamp: TEST_TIMESTAMP,
});

const getInitialState = (): GrblConsoleState => grblConsoleReducer(undefined, new UnknownAction());

const getStateAfterEntries = (state: GrblConsoleState, count: number): GrblConsoleState => {
  let next: GrblConsoleState = state;

  for (let index = 0; index < count; index += 1) {
    next = grblConsoleReducer(next, new ConsoleEntryReceived({ entry: getEntry(`line ${index}`) }));
  }

  return next;
};

describe(grblConsoleReducer.name, () => {
  it('appends engine entries with running ids', () => {
    const state: GrblConsoleState = getStateAfterEntries(getInitialState(), 2);

    expect(state.entries).toEqual([
      { ...getEntry('line 0'), entryId: 0, messageKey: undefined, messageParameters: undefined },
      { ...getEntry('line 1'), entryId: 1, messageKey: undefined, messageParameters: undefined },
    ]);
    expect(state.nextEntryId).toBe(2);
  });

  it('keeps the newest entries and drops the oldest beyond the cap', () => {
    const overflow = 3;
    const state: GrblConsoleState = getStateAfterEntries(getInitialState(), GRBL_CONSOLE_ENTRY_LIMIT + overflow);

    expect(state.entries).toHaveLength(GRBL_CONSOLE_ENTRY_LIMIT);
    expect(state.entries[0]?.text).toBe(`line ${overflow}`);
    expect(state.entries[0]?.entryId).toBe(overflow);
    expect(state.entries.at(-1)?.text).toBe(`line ${GRBL_CONSOLE_ENTRY_LIMIT + overflow - 1}`);
  });

  it('drops status entries while they are hidden and does not use up ids', () => {
    const state: GrblConsoleState = grblConsoleReducer(
      getInitialState(),
      new ConsoleEntryReceived({ entry: getEntry('<Idle>', true) }),
    );

    expect(state.entries).toEqual([]);
    expect(state.nextEntryId).toBe(0);
  });

  it('stores status entries once they are visible', () => {
    const visible: GrblConsoleState = grblConsoleReducer(getInitialState(), new StatusReportVisibilityToggled());
    const state: GrblConsoleState = grblConsoleReducer(
      visible,
      new ConsoleEntryReceived({ entry: getEntry('<Idle>', true) }),
    );

    expect(state.entries.map((entry) => entry.text)).toEqual(['<Idle>']);
  });

  it('toggles the status report visibility back off', () => {
    const toggledTwice: GrblConsoleState = grblConsoleReducer(
      grblConsoleReducer(getInitialState(), new StatusReportVisibilityToggled()),
      new StatusReportVisibilityToggled(),
    );

    expect(toggledTwice.isStatusReportVisible).toBe(false);
  });

  it('adds info and error lines with their message key and parameters', () => {
    const withInfo: GrblConsoleState = grblConsoleReducer(
      getInitialState(),
      new ConsoleInfoAdded({ messageKey: TEST_MESSAGE_KEY, isError: false, timestamp: TEST_TIMESTAMP }),
    );
    const state: GrblConsoleState = grblConsoleReducer(
      withInfo,
      new ConsoleInfoAdded({
        messageKey: TEST_MESSAGE_KEY,
        isError: true,
        timestamp: TEST_TIMESTAMP,
        messageParameters: { error: TEST_RAW_ERROR },
      }),
    );

    expect(state.entries.map((entry) => [entry.entryId, entry.direction, entry.messageKey, entry.messageParameters]))
      .toEqual([
        [0, GRBL_CONSOLE_VIEW_DIRECTION.INFO, TEST_MESSAGE_KEY, undefined],
        [1, GRBL_CONSOLE_VIEW_DIRECTION.ERROR, TEST_MESSAGE_KEY, { error: TEST_RAW_ERROR }],
      ]);
  });

  it('records submitted commands and skips an immediate duplicate', () => {
    const state: GrblConsoleState = ['$H', '$H', 'G0 X1', '$H'].reduce(
      (previous: GrblConsoleState, commandText: string) =>
        grblConsoleReducer(previous, new ConsoleCommandSubmitted({ commandText })),
      getInitialState(),
    );

    expect(state.commandHistory).toEqual(['$H', 'G0 X1', '$H']);
  });

  it('keeps only the newest commands beyond the history cap', () => {
    const overflow = 5;
    let state: GrblConsoleState = getInitialState();

    for (let index = 0; index < GRBL_COMMAND_HISTORY_LIMIT + overflow; index += 1) {
      state = grblConsoleReducer(state, new ConsoleCommandSubmitted({ commandText: `G0 X${index}` }));
    }

    expect(state.commandHistory).toHaveLength(GRBL_COMMAND_HISTORY_LIMIT);
    expect(state.commandHistory[0]).toBe(`G0 X${overflow}`);
    expect(state.commandHistory.at(-1)).toBe(`G0 X${GRBL_COMMAND_HISTORY_LIMIT + overflow - 1}`);
  });

  it('does not mutate the previous state', () => {
    const previous: GrblConsoleState = getStateAfterEntries(getInitialState(), 1);
    const snapshot: GrblConsoleState = structuredClone(previous);

    grblConsoleReducer(previous, new ConsoleEntryReceived({ entry: getEntry('next') }));
    grblConsoleReducer(previous, new ConsoleCommandSubmitted({ commandText: '$H' }));

    expect(previous).toEqual(snapshot);
  });

  it('returns the same state for an unknown action', () => {
    const previous: GrblConsoleState = getInitialState();

    expect(grblConsoleReducer(previous, new UnknownAction())).toBe(previous);
  });
});

describe('grbl console selectors', () => {
  it('read the console fields', () => {
    const state: GrblConsoleState = grblConsoleReducer(
      getStateAfterEntries(getInitialState(), 1),
      new ConsoleCommandSubmitted({ commandText: '$H' }),
    );
    const rootState = { [GRBL_CONSOLE_STATE_NAME]: state };

    expect(selectConsoleEntries(rootState)).toBe(state.entries);
    expect(selectCommandHistory(rootState)).toEqual(['$H']);
    expect(selectIsStatusReportVisible(rootState)).toBe(false);
  });
});
