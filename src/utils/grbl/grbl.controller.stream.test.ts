import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import {
  GRBL_CONSOLE_DIRECTION,
  GRBL_CONTROLLER_EVENT_KIND,
  GRBL_FEED_HOLD_BYTE,
  GRBL_HOLD_COMPLETE_MAX_WAIT_MS,
  GRBL_LINE_ORIGIN,
  GRBL_MACHINE_STATE,
  GRBL_NOT_RESPONDING_SILENCE_MS,
  GRBL_RESET_BANNER_TIMEOUT_MS,
  GRBL_SOFT_RESET_BYTE,
  GRBL_STATUS_POLL_INTERVAL_MS,
} from './grbl.constants';
import { GrblCheckModeRefusedError } from './grbl.check.mode.refused.error';
import { GrblCommandWipedError } from './grbl.command.wiped.error';
import { GrblConnectionClosedError } from './grbl.connection.closed.error';
import { GrblController } from './grbl.controller';
import { GrblControllerBusyError } from './grbl.controller.busy.error';
import { GRBL_SIMULATOR_BANNER, GRBL_SIMULATOR_FAULT_KIND } from './simulator/grbl.simulator.constants';
import { ANSWER_SETTLE_MS } from './test.support/grbl.answer.settle';
import { getConsoleEntries } from './test.support/grbl.console.entries';
import { newGrblControllerHarness } from './test.support/grbl.controller.harness';
import { disconnectGrblHarness } from './test.support/grbl.harness.disconnect';
import type { GrblControllerEventKind } from './grbl.constants';
import type { GrblConsoleEntry } from './interfaces/GrblConsoleEntry';
import type { GrblControllerEvent } from './interfaces/GrblControllerEvent';
import type { GrblProgramLineError } from './interfaces/GrblProgramLineError';
import type { GrblProgramResult } from './interfaces/GrblProgramResult';
import type { GrblControllerHarness } from './test.support/GrblControllerHarness';

/** The handshake sends $I and $$, so the simulator counts the first line after it as line 3. */
const HANDSHAKE_LINE_COUNT = 2;
const STREAMED_PROGRAM_LINE_COUNT = 200;
/** Far longer than the 200-line program needs, even with the console command in between. */
const PROGRAM_SETTLE_MS = 60_000;
/** Long enough for any stop sequence to finish and the poll after it to answer. */
const STOP_SETTLE_MS = GRBL_HOLD_COMPLETE_MAX_WAIT_MS + GRBL_STATUS_POLL_INTERVAL_MS + ANSWER_SETTLE_MS;
const CONSOLE_COMMAND = '$G';
const CONSOLE_COMMAND_DELAY_MS = 50;
const EEPROM_WRITE_LINE = '$32=1';
const OK_TEXT = 'ok';
const ERROR_LINE_NUMBER = 5;
const SECOND_ERROR_LINE_NUMBER = 8;
const FAULT_ERROR_CODE = 33;
const ERROR_PROGRAM_LINE_COUNT = 12;
const CHECKED_UNITS_LINE = 'G21';
const CHECKED_PROBE_LINE = 'G38.2Z-1';
const CHECKED_MOVE_LINE = 'G1X1F100';
const CHECKED_PROGRAM: string[] = [CHECKED_UNITS_LINE, '; c', CHECKED_PROBE_LINE, CHECKED_MOVE_LINE];
const CHECKED_FAILING_LINE_NUMBER = 3;
const UNSUPPORTED_COMMAND_ERROR_CODE = 20;
const CHECK_MODE_COMMAND = '$C';
const NOT_IDLE_ERROR_CODE = 8;
/** Long enough for $C to be accepted and the first checked lines to be answered, far too short for all 200. */
const CHECK_INTERRUPT_DELAY_MS = 3;
/** 300 mm at 600 mm/min takes 30 s, far longer than any test runs. */
const LONG_MOVE = 'G1X300F600';
/** Enough long moves to fill the 15-block planner and leave lines waiting in the receive buffer. */
const LONG_MOVE_COUNT = 30;
const MOVE_RUNNING_MS = 500;
const ALARM_CODE = 1;
const TRANSPORT_CLOSE_LOG_ENTRY = 'close';
const FEED_HOLD_TEXT = '!';
const SOFT_RESET_TEXT = '0x18';
/** A status report showing the hold complete, so a reset loses no steps and raises no alarm. */
const HOLD_COMPLETE_PREFIX = '<Hold:0';

const newConnectedHarness = async (): Promise<GrblControllerHarness> => {
  const harness: GrblControllerHarness = newGrblControllerHarness();
  const connection: Promise<unknown> = harness.controller.connect();
  await vi.advanceTimersByTimeAsync(ANSWER_SETTLE_MS);
  await connection;
  harness.events.length = 0;

  return harness;
};

/** Short moves alternating between X0 and X1 at a high feed, so each block finishes quickly. */
const newShortMoveProgram = (lineCount: number): string[] => {
  const programLines: string[] = [];

  for (let lineIndex = 0; lineIndex < lineCount; lineIndex++) {
    programLines.push(`G1X${lineIndex % 2}F30000`);
  }

  return programLines;
};

/** Lines that only set modes, so the machine stays idle and accepts a setting write right after them. */
const newModalProgram = (lineCount: number): string[] => {
  const programLines: string[] = [];

  for (let lineIndex = 0; lineIndex < lineCount; lineIndex++) {
    programLines.push(lineIndex % 2 ? 'G90' : 'G21');
  }

  return programLines;
};

const getProgramLineText = (programLines: string[], lineNumber: number): string => programLines[lineNumber - 1] ?? '';

const newLongMoveProgram = (): string[] => Array<string>(LONG_MOVE_COUNT).fill(LONG_MOVE);

const getEventsOfKind = (events: GrblControllerEvent[], kind: GrblControllerEventKind): GrblControllerEvent[] =>
  events.filter((event: GrblControllerEvent) => event.kind === kind);

/** Texts of the received console entries, without status reports. */
const getReceivedTexts = (events: GrblControllerEvent[]): string[] =>
  getConsoleEntries(events)
    .filter((entry: GrblConsoleEntry) => entry.direction === GRBL_CONSOLE_DIRECTION.RECEIVED && !entry.isStatusReport)
    .map((entry: GrblConsoleEntry) => entry.text);

const getSentTexts = (events: GrblControllerEvent[]): string[] =>
  getConsoleEntries(events)
    .filter((entry: GrblConsoleEntry) => entry.direction === GRBL_CONSOLE_DIRECTION.SENT)
    .map((entry: GrblConsoleEntry) => entry.text);

/** Lines written to the send queue after the first received entry with the given text; realtime bytes are not lines. */
const getSentTextsAfterReceived = (events: GrblControllerEvent[], receivedText: string): string[] => {
  const entries: GrblConsoleEntry[] = getConsoleEntries(events);
  const receivedIndex: number = entries.findIndex(
    (entry: GrblConsoleEntry) => entry.direction === GRBL_CONSOLE_DIRECTION.RECEIVED && entry.text === receivedText,
  );

  return entries
    .slice(receivedIndex + 1)
    .filter((entry: GrblConsoleEntry) => entry.direction === GRBL_CONSOLE_DIRECTION.SENT)
    .map((entry: GrblConsoleEntry) => entry.text);
};

const getLastReceivedTimestamp = (events: GrblControllerEvent[]): number => {
  const receivedEntries: GrblConsoleEntry[] = getConsoleEntries(events).filter(
    (entry: GrblConsoleEntry) => entry.direction === GRBL_CONSOLE_DIRECTION.RECEIVED,
  );

  return receivedEntries[receivedEntries.length - 1]?.timestamp ?? Number.NaN;
};

describe(GrblController.name, () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('reports the progress of a program from its start to its last answered line', async () => {
    const harness: GrblControllerHarness = await newConnectedHarness();
    const programLineCount = 3;
    const program: Promise<GrblProgramResult> =
      harness.controller.streamProgram(newModalProgram(programLineCount), { isStopOnErrorEnabled: true });

    await vi.advanceTimersByTimeAsync(ANSWER_SETTLE_MS);
    await program;

    const answeredLineCounts: number[] = [];

    for (const event of harness.events) {
      if (event.kind === GRBL_CONTROLLER_EVENT_KIND.PROGRAM_PROGRESS) {
        expect(event.totalLineCount).toBe(programLineCount);
        answeredLineCounts.push(event.answeredLineCount);
      }
    }

    expect(answeredLineCounts).toEqual([0, 1, 2, 3]);

    await disconnectGrblHarness(harness);
  });

  it('reports no program progress for a check', async () => {
    const harness: GrblControllerHarness = await newConnectedHarness();
    const check: Promise<GrblProgramLineError[]> = harness.controller.checkProgram(newModalProgram(2));

    await vi.advanceTimersByTimeAsync(PROGRAM_SETTLE_MS);
    await check;

    expect(getEventsOfKind(harness.events, GRBL_CONTROLLER_EVENT_KIND.PROGRAM_PROGRESS)).toEqual([]);

    await disconnectGrblHarness(harness);
  });

  it('streams a 200-line program to completion without overflowing the simulator buffer', async () => {
    const harness: GrblControllerHarness = await newConnectedHarness();

    const stream: Promise<GrblProgramResult> = harness.controller.streamProgram(
      newShortMoveProgram(STREAMED_PROGRAM_LINE_COUNT),
      { isStopOnErrorEnabled: true },
    );
    await vi.advanceTimersByTimeAsync(PROGRAM_SETTLE_MS);

    await expect(stream).resolves.toEqual({ isCompleted: true, lineErrors: [] });
    expect(harness.transport.getSimulator().hasRxBufferOverflowed()).toBe(false);
    expect(harness.transport.getSimulator().getReceivedLineCount()).toBe(
      HANDSHAKE_LINE_COUNT + STREAMED_PROGRAM_LINE_COUNT,
    );

    await disconnectGrblHarness(harness);
    expect(vi.getTimerCount()).toBe(0);
  });

  it('console command typed mid-program shares the buffer budget and the simulator never overflows', async () => {
    const harness: GrblControllerHarness = await newConnectedHarness();

    const stream: Promise<GrblProgramResult> = harness.controller.streamProgram(
      newShortMoveProgram(STREAMED_PROGRAM_LINE_COUNT),
      { isStopOnErrorEnabled: true },
    );
    await vi.advanceTimersByTimeAsync(CONSOLE_COMMAND_DELAY_MS);
    harness.controller.sendConsoleCommand(CONSOLE_COMMAND);
    await vi.advanceTimersByTimeAsync(PROGRAM_SETTLE_MS);

    await expect(stream).resolves.toEqual({ isCompleted: true, lineErrors: [] });
    expect(harness.transport.getSimulator().hasRxBufferOverflowed()).toBe(false);
    expect(harness.transport.getSimulator().getReceivedLineCount()).toBe(
      HANDSHAKE_LINE_COUNT + STREAMED_PROGRAM_LINE_COUNT + 1,
    );

    await disconnectGrblHarness(harness);
  });

  it('eeprom write in a program waits for an empty buffer', async () => {
    const harness: GrblControllerHarness = await newConnectedHarness();
    const earlierLines: string[] = newModalProgram(ERROR_PROGRAM_LINE_COUNT);
    const textDecoder: TextDecoder = new TextDecoder();
    let acknowledgedLineCount = 0;
    let acknowledgedCountAtEepromWrite: number | undefined;
    const originalWrite: (bytes: Uint8Array) => Promise<void> = harness.transport.write.bind(harness.transport);
    vi.spyOn(harness.transport, 'write').mockImplementation((bytes: Uint8Array): Promise<void> => {
      if (textDecoder.decode(bytes).trim() === EEPROM_WRITE_LINE) {
        acknowledgedCountAtEepromWrite = acknowledgedLineCount;
      }

      return originalWrite(bytes);
    });
    harness.controller.addEventListener((event: GrblControllerEvent): void => {
      if (event.kind === GRBL_CONTROLLER_EVENT_KIND.CONSOLE_ENTRY && event.entry.text === OK_TEXT) {
        acknowledgedLineCount++;
      }
    });

    const stream: Promise<GrblProgramResult> = harness.controller.streamProgram(
      [...earlierLines, EEPROM_WRITE_LINE, ...earlierLines],
      { isStopOnErrorEnabled: true },
    );
    await vi.advanceTimersByTimeAsync(PROGRAM_SETTLE_MS);

    await expect(stream).resolves.toEqual({ isCompleted: true, lineErrors: [] });
    expect(acknowledgedCountAtEepromWrite).toBe(earlierLines.length);

    await disconnectGrblHarness(harness);
  });

  it('stops on error line 5 and reports line number, text and code', async () => {
    const harness: GrblControllerHarness = await newConnectedHarness();
    // Long enough that unsent lines are still waiting when the error arrives.
    const programLines: string[] = newShortMoveProgram(STREAMED_PROGRAM_LINE_COUNT);
    const expectedLineError: GrblProgramLineError = {
      lineNumber: ERROR_LINE_NUMBER,
      lineText: getProgramLineText(programLines, ERROR_LINE_NUMBER),
      errorCode: FAULT_ERROR_CODE,
    };
    harness.transport.getSimulator().injectFault({
      kind: GRBL_SIMULATOR_FAULT_KIND.ERROR_ON_LINE,
      lineNumber: HANDSHAKE_LINE_COUNT + ERROR_LINE_NUMBER,
      errorCode: FAULT_ERROR_CODE,
    });

    const stream: Promise<GrblProgramResult> = harness.controller.streamProgram(programLines, {
      isStopOnErrorEnabled: true,
    });
    await vi.advanceTimersByTimeAsync(STOP_SETTLE_MS);

    await expect(stream).resolves.toEqual({ isCompleted: false, lineErrors: [expectedLineError] });
    expect(getEventsOfKind(harness.events, GRBL_CONTROLLER_EVENT_KIND.PROGRAM_STOPPED_ON_ERROR)).toEqual([
      { kind: GRBL_CONTROLLER_EVENT_KIND.PROGRAM_STOPPED_ON_ERROR, ...expectedLineError },
    ]);
    expect(getEventsOfKind(harness.events, GRBL_CONTROLLER_EVENT_KIND.GRBL_ERROR)).toEqual([]);
    expect(getReceivedTexts(harness.events)).toContain(GRBL_SIMULATOR_BANNER);
    expect(getSentTextsAfterReceived(harness.events, `error:${FAULT_ERROR_CODE}`)).toEqual([]);

    await vi.advanceTimersByTimeAsync(STOP_SETTLE_MS);

    expect(harness.transport.getSimulator().getReceivedLineCount()).toBe(0);

    await disconnectGrblHarness(harness);
    expect(vi.getTimerCount()).toBe(0);
  });

  it('with stop-on-error off, collects all errors and completes', async () => {
    const harness: GrblControllerHarness = await newConnectedHarness();
    const programLines: string[] = ['', ...newShortMoveProgram(ERROR_PROGRAM_LINE_COUNT - 1)];

    for (const lineNumber of [ERROR_LINE_NUMBER, SECOND_ERROR_LINE_NUMBER]) {
      // The blank first line is not sent, so the simulator counts one line fewer.
      harness.transport.getSimulator().injectFault({
        kind: GRBL_SIMULATOR_FAULT_KIND.ERROR_ON_LINE,
        lineNumber: HANDSHAKE_LINE_COUNT + lineNumber - 1,
        errorCode: FAULT_ERROR_CODE,
      });
    }

    const stream: Promise<GrblProgramResult> = harness.controller.streamProgram(programLines, {
      isStopOnErrorEnabled: false,
    });
    await vi.advanceTimersByTimeAsync(PROGRAM_SETTLE_MS);

    await expect(stream).resolves.toEqual({
      isCompleted: true,
      lineErrors: [
        {
          lineNumber: ERROR_LINE_NUMBER,
          lineText: getProgramLineText(programLines, ERROR_LINE_NUMBER),
          errorCode: FAULT_ERROR_CODE,
        },
        {
          lineNumber: SECOND_ERROR_LINE_NUMBER,
          lineText: getProgramLineText(programLines, SECOND_ERROR_LINE_NUMBER),
          errorCode: FAULT_ERROR_CODE,
        },
      ],
    });
    expect(getEventsOfKind(harness.events, GRBL_CONTROLLER_EVENT_KIND.GRBL_ERROR)).toEqual([
      {
        kind: GRBL_CONTROLLER_EVENT_KIND.GRBL_ERROR,
        code: FAULT_ERROR_CODE,
        lineText: getProgramLineText(programLines, ERROR_LINE_NUMBER),
        origin: GRBL_LINE_ORIGIN.PROGRAM,
      },
      {
        kind: GRBL_CONTROLLER_EVENT_KIND.GRBL_ERROR,
        code: FAULT_ERROR_CODE,
        lineText: getProgramLineText(programLines, SECOND_ERROR_LINE_NUMBER),
        origin: GRBL_LINE_ORIGIN.PROGRAM,
      },
    ]);
    expect(getEventsOfKind(harness.events, GRBL_CONTROLLER_EVENT_KIND.PROGRAM_STOPPED_ON_ERROR)).toEqual([]);

    await disconnectGrblHarness(harness);
  });

  it('checkProgram returns the errors of bad lines with original line numbers and leaves check mode', async () => {
    const harness: GrblControllerHarness = await newConnectedHarness();

    const check: Promise<GrblProgramLineError[]> = harness.controller.checkProgram(CHECKED_PROGRAM);
    await vi.advanceTimersByTimeAsync(ANSWER_SETTLE_MS);

    await expect(check).resolves.toEqual([
      {
        lineNumber: CHECKED_FAILING_LINE_NUMBER,
        lineText: getProgramLineText(CHECKED_PROGRAM, CHECKED_FAILING_LINE_NUMBER),
        errorCode: UNSUPPORTED_COMMAND_ERROR_CODE,
      },
    ]);
    expect(getEventsOfKind(harness.events, GRBL_CONTROLLER_EVENT_KIND.GRBL_ERROR)).toEqual([]);
    expect(getReceivedTexts(harness.events)).toContain(`error:${UNSUPPORTED_COMMAND_ERROR_CODE}`);
    expect(getReceivedTexts(harness.events).slice(-1)).toEqual([GRBL_SIMULATOR_BANNER]);

    harness.controller.sendConsoleCommand(CONSOLE_COMMAND);
    await vi.advanceTimersByTimeAsync(GRBL_STATUS_POLL_INTERVAL_MS + ANSWER_SETTLE_MS);

    expect(harness.controller.getLatestStatus()?.machineState).toBe(GRBL_MACHINE_STATE.IDLE);
    expect(getReceivedTexts(harness.events)).toContain(OK_TEXT);

    await disconnectGrblHarness(harness);
    expect(vi.getTimerCount()).toBe(0);
  });

  it('checkProgram sends $C, then the program, then $C, without moving the machine', async () => {
    const harness: GrblControllerHarness = await newConnectedHarness();

    const check: Promise<GrblProgramLineError[]> = harness.controller.checkProgram(CHECKED_PROGRAM);
    await vi.advanceTimersByTimeAsync(ANSWER_SETTLE_MS);
    await check;
    expect(getSentTexts(harness.events)).toEqual([
      CHECK_MODE_COMMAND,
      CHECKED_UNITS_LINE,
      CHECKED_PROBE_LINE,
      CHECKED_MOVE_LINE,
      CHECK_MODE_COMMAND,
    ]);

    await vi.advanceTimersByTimeAsync(GRBL_STATUS_POLL_INTERVAL_MS + ANSWER_SETTLE_MS);

    expect(harness.controller.getLatestStatus()?.machinePosition?.x).toBe(0);

    await disconnectGrblHarness(harness);
  });

  it('checkProgram while the machine runs rejects with GrblCheckModeRefusedError, no program line sent', async () => {
    const harness: GrblControllerHarness = await newConnectedHarness();
    harness.controller.sendConsoleCommand(LONG_MOVE);
    await vi.advanceTimersByTimeAsync(MOVE_RUNNING_MS);

    const check: Promise<GrblProgramLineError[]> = harness.controller.checkProgram(CHECKED_PROGRAM);
    const checkExpectation: Promise<void> = expect(check).rejects.toEqual(
      new GrblCheckModeRefusedError(NOT_IDLE_ERROR_CODE),
    );
    await vi.advanceTimersByTimeAsync(ANSWER_SETTLE_MS);
    await checkExpectation;

    expect(getSentTexts(harness.events)).toEqual([LONG_MOVE, CHECK_MODE_COMMAND]);
    expect(getEventsOfKind(harness.events, GRBL_CONTROLLER_EVENT_KIND.GRBL_ERROR)).toEqual([]);

    await disconnectGrblHarness(harness);
  });

  it('a reset during a check rejects it with GrblCommandWipedError and leaves no line queued', async () => {
    const harness: GrblControllerHarness = await newConnectedHarness();
    const check: Promise<GrblProgramLineError[]> = harness.controller.checkProgram(
      newShortMoveProgram(STREAMED_PROGRAM_LINE_COUNT),
    );
    const checkExpectation: Promise<void> = expect(check).rejects.toBeInstanceOf(GrblCommandWipedError);
    await vi.advanceTimersByTimeAsync(CHECK_INTERRUPT_DELAY_MS);

    expect(getSentTexts(harness.events).length).toBeGreaterThan(1);

    await harness.controller.resetMachine();
    await checkExpectation;
    await vi.advanceTimersByTimeAsync(GRBL_STATUS_POLL_INTERVAL_MS + ANSWER_SETTLE_MS);

    expect(harness.transport.getSimulator().getReceivedLineCount()).toBe(0);
    expect(harness.controller.getLatestStatus()?.machineState).toBe(GRBL_MACHINE_STATE.IDLE);

    await disconnectGrblHarness(harness);
  });

  it('a second program while one runs rejects with GrblControllerBusyError', async () => {
    const harness: GrblControllerHarness = await newConnectedHarness();
    const stream: Promise<GrblProgramResult> = harness.controller.streamProgram(
      newShortMoveProgram(STREAMED_PROGRAM_LINE_COUNT),
      { isStopOnErrorEnabled: true },
    );

    await expect(
      harness.controller.streamProgram(newShortMoveProgram(1), { isStopOnErrorEnabled: true }),
    ).rejects.toBeInstanceOf(GrblControllerBusyError);
    await expect(harness.controller.checkProgram(CHECKED_PROGRAM)).rejects.toBeInstanceOf(GrblControllerBusyError);

    await vi.advanceTimersByTimeAsync(PROGRAM_SETTLE_MS);
    await expect(stream).resolves.toEqual({ isCompleted: true, lineErrors: [] });

    await disconnectGrblHarness(harness);
  });

  it('streaming while disconnected rejects with GrblConnectionClosedError', async () => {
    const harness: GrblControllerHarness = newGrblControllerHarness();

    await expect(
      harness.controller.streamProgram(newShortMoveProgram(1), { isStopOnErrorEnabled: true }),
    ).rejects.toBeInstanceOf(GrblConnectionClosedError);
  });

  it('a program of only blank and comment lines completes at once without sending anything', async () => {
    const harness: GrblControllerHarness = await newConnectedHarness();

    await expect(
      harness.controller.streamProgram(['', '; only a comment', '(another)'], { isStopOnErrorEnabled: true }),
    ).resolves.toEqual({ isCompleted: true, lineErrors: [] });
    expect(harness.transport.getSimulator().getReceivedLineCount()).toBe(HANDSHAKE_LINE_COUNT);

    await disconnectGrblHarness(harness);
  });

  it('a user stop during a program resolves it with isCompleted false', async () => {
    const harness: GrblControllerHarness = await newConnectedHarness();
    const stream: Promise<GrblProgramResult> = harness.controller.streamProgram(newLongMoveProgram(), {
      isStopOnErrorEnabled: true,
    });
    await vi.advanceTimersByTimeAsync(MOVE_RUNNING_MS);

    const stop: Promise<void> = harness.controller.stopMachine();
    await vi.advanceTimersByTimeAsync(STOP_SETTLE_MS);
    await stop;

    await expect(stream).resolves.toEqual({ isCompleted: false, lineErrors: [] });
    expect(getEventsOfKind(harness.events, GRBL_CONTROLLER_EVENT_KIND.GRBL_ALARM)).toEqual([]);

    await disconnectGrblHarness(harness);
  });

  it('an alarm during a program clears the queue and resolves it with isCompleted false', async () => {
    const harness: GrblControllerHarness = await newConnectedHarness();
    const stream: Promise<GrblProgramResult> = harness.controller.streamProgram(newLongMoveProgram(), {
      isStopOnErrorEnabled: true,
    });
    await vi.advanceTimersByTimeAsync(MOVE_RUNNING_MS);

    harness.transport.getSimulator().injectFault({ kind: GRBL_SIMULATOR_FAULT_KIND.ALARM, alarmCode: ALARM_CODE });
    await vi.advanceTimersByTimeAsync(ANSWER_SETTLE_MS);

    await expect(stream).resolves.toEqual({ isCompleted: false, lineErrors: [] });

    harness.controller.unlockMachine();
    await vi.advanceTimersByTimeAsync(GRBL_STATUS_POLL_INTERVAL_MS + ANSWER_SETTLE_MS);

    expect(getReceivedTexts(harness.events).slice(-1)).toEqual([OK_TEXT]);
    expect(harness.transport.getSimulator().getReceivedLineCount()).toBe(1);

    await disconnectGrblHarness(harness);
  });

  it('emits not-responding after 10000 ms of silence with lines in flight', async () => {
    const harness: GrblControllerHarness = await newConnectedHarness();
    await vi.advanceTimersByTimeAsync(GRBL_STATUS_POLL_INTERVAL_MS + ANSWER_SETTLE_MS);
    harness.transport.getSimulator().injectFault({ kind: GRBL_SIMULATOR_FAULT_KIND.STOP_RESPONDING });
    const stream: Promise<GrblProgramResult> = harness.controller.streamProgram(newShortMoveProgram(1), {
      isStopOnErrorEnabled: true,
    });
    const silenceEndMs: number = getLastReceivedTimestamp(harness.events) + GRBL_NOT_RESPONDING_SILENCE_MS;
    await vi.advanceTimersByTimeAsync(silenceEndMs - Date.now() - 1);

    expect(getEventsOfKind(harness.events, GRBL_CONTROLLER_EVENT_KIND.NOT_RESPONDING)).toEqual([]);

    await vi.advanceTimersByTimeAsync(1);

    expect(getEventsOfKind(harness.events, GRBL_CONTROLLER_EVENT_KIND.NOT_RESPONDING)).toEqual([
      { kind: GRBL_CONTROLLER_EVENT_KIND.NOT_RESPONDING },
    ]);

    await vi.advanceTimersByTimeAsync(GRBL_NOT_RESPONDING_SILENCE_MS * 2);

    expect(getEventsOfKind(harness.events, GRBL_CONTROLLER_EVENT_KIND.NOT_RESPONDING)).toHaveLength(1);

    await disconnectGrblHarness(harness);
    await expect(stream).resolves.toEqual({ isCompleted: false, lineErrors: [] });
    expect(vi.getTimerCount()).toBe(0);
  });

  it('a banner timeout in the same silence does not report not-responding a second time', async () => {
    const harness: GrblControllerHarness = await newConnectedHarness();
    harness.transport.getSimulator().injectFault({ kind: GRBL_SIMULATOR_FAULT_KIND.STOP_RESPONDING });
    const stream: Promise<GrblProgramResult> = harness.controller.streamProgram(newShortMoveProgram(1), {
      isStopOnErrorEnabled: true,
    });
    await vi.advanceTimersByTimeAsync(GRBL_NOT_RESPONDING_SILENCE_MS);

    expect(getEventsOfKind(harness.events, GRBL_CONTROLLER_EVENT_KIND.NOT_RESPONDING)).toHaveLength(1);

    await harness.controller.resetMachine();
    await vi.advanceTimersByTimeAsync(GRBL_RESET_BANNER_TIMEOUT_MS);

    expect(getEventsOfKind(harness.events, GRBL_CONTROLLER_EVENT_KIND.NOT_RESPONDING)).toHaveLength(1);
    await expect(stream).resolves.toEqual({ isCompleted: false, lineErrors: [] });

    await disconnectGrblHarness(harness);
    expect(vi.getTimerCount()).toBe(0);
  });

  it('emits no not-responding while the latest status is Hold', async () => {
    const harness: GrblControllerHarness = await newConnectedHarness();
    void harness.controller.streamProgram(newLongMoveProgram(), { isStopOnErrorEnabled: true });
    await vi.advanceTimersByTimeAsync(MOVE_RUNNING_MS);
    await harness.controller.sendFeedHold();
    await vi.advanceTimersByTimeAsync(MOVE_RUNNING_MS);

    expect(harness.controller.getLatestStatus()?.machineState).toBe(GRBL_MACHINE_STATE.HOLD);

    harness.transport.getSimulator().injectFault({ kind: GRBL_SIMULATOR_FAULT_KIND.STOP_RESPONDING });
    await vi.advanceTimersByTimeAsync(GRBL_NOT_RESPONDING_SILENCE_MS * 2);

    expect(getEventsOfKind(harness.events, GRBL_CONTROLLER_EVENT_KIND.NOT_RESPONDING)).toEqual([]);

    await disconnectGrblHarness(harness);
  });

  it('connection loss during a program emits connection-lost and resolves isCompleted false', async () => {
    const harness: GrblControllerHarness = await newConnectedHarness();
    const stream: Promise<GrblProgramResult> = harness.controller.streamProgram(newLongMoveProgram(), {
      isStopOnErrorEnabled: true,
    });
    await vi.advanceTimersByTimeAsync(MOVE_RUNNING_MS);

    harness.transport.simulateConnectionLoss();

    await expect(stream).resolves.toEqual({ isCompleted: false, lineErrors: [] });
    expect(getEventsOfKind(harness.events, GRBL_CONTROLLER_EVENT_KIND.CONNECTION_LOST)).toEqual([
      { kind: GRBL_CONTROLLER_EVENT_KIND.CONNECTION_LOST },
    ]);
    expect(vi.getTimerCount()).toBe(0);
  });

  it('connection loss during a check rejects it with GrblConnectionClosedError', async () => {
    const harness: GrblControllerHarness = await newConnectedHarness();
    const check: Promise<GrblProgramLineError[]> = harness.controller.checkProgram(newLongMoveProgram());
    await vi.advanceTimersByTimeAsync(1);

    harness.transport.simulateConnectionLoss();

    await expect(check).rejects.toBeInstanceOf(GrblConnectionClosedError);
    await vi.advanceTimersByTimeAsync(ANSWER_SETTLE_MS);
    expect(vi.getTimerCount()).toBe(0);
  });

  it('disconnect right after a program starts, before a poll saw it run, holds and resets before closing', async () => {
    const harness: GrblControllerHarness = await newConnectedHarness();
    await vi.advanceTimersByTimeAsync(GRBL_STATUS_POLL_INTERVAL_MS + ANSWER_SETTLE_MS);
    const controllerLog: string[] = [];
    const originalClose: () => Promise<void> = harness.transport.close.bind(harness.transport);
    vi.spyOn(harness.transport, 'close').mockImplementation((): Promise<void> => {
      controllerLog.push(TRANSPORT_CLOSE_LOG_ENTRY);

      return originalClose();
    });
    harness.controller.addEventListener((event: GrblControllerEvent): void => {
      if (event.kind === GRBL_CONTROLLER_EVENT_KIND.CONSOLE_ENTRY) {
        controllerLog.push(event.entry.text);
      }
    });

    const stream: Promise<GrblProgramResult> = harness.controller.streamProgram(newLongMoveProgram(), {
      isStopOnErrorEnabled: true,
    });

    expect(harness.controller.getLatestStatus()?.machineState).toBe(GRBL_MACHINE_STATE.IDLE);

    const disconnect: Promise<void> = harness.controller.disconnect();
    await vi.advanceTimersByTimeAsync(STOP_SETTLE_MS);
    await disconnect;
    const feedHoldIndex: number = controllerLog.indexOf(FEED_HOLD_TEXT);
    const softResetIndex: number = controllerLog.indexOf(SOFT_RESET_TEXT);
    const holdCompleteIndex: number = controllerLog.findIndex(
      (text: string) => text.startsWith(HOLD_COMPLETE_PREFIX),
    );

    expect(feedHoldIndex).toBeGreaterThanOrEqual(0);
    expect(holdCompleteIndex).toBeGreaterThan(feedHoldIndex);
    expect(softResetIndex).toBeGreaterThan(holdCompleteIndex);
    expect(controllerLog.indexOf(TRANSPORT_CLOSE_LOG_ENTRY)).toBeGreaterThan(softResetIndex);
    expect(getEventsOfKind(harness.events, GRBL_CONTROLLER_EVENT_KIND.GRBL_ALARM)).toEqual([]);
    await expect(stream).resolves.toEqual({ isCompleted: false, lineErrors: [] });
    expect(vi.getTimerCount()).toBe(0);
  });

  it('disconnect while running stops the machine before closing', async () => {
    const harness: GrblControllerHarness = await newConnectedHarness();
    const transportLog: (number | string)[] = [];
    const originalWrite: (bytes: Uint8Array) => Promise<void> = harness.transport.write.bind(harness.transport);
    const originalClose: () => Promise<void> = harness.transport.close.bind(harness.transport);
    vi.spyOn(harness.transport, 'write').mockImplementation((bytes: Uint8Array): Promise<void> => {
      transportLog.push(...bytes);

      return originalWrite(bytes);
    });
    vi.spyOn(harness.transport, 'close').mockImplementation((): Promise<void> => {
      transportLog.push(TRANSPORT_CLOSE_LOG_ENTRY);

      return originalClose();
    });
    const stream: Promise<GrblProgramResult> = harness.controller.streamProgram(newLongMoveProgram(), {
      isStopOnErrorEnabled: true,
    });
    await vi.advanceTimersByTimeAsync(MOVE_RUNNING_MS);

    expect(harness.controller.getLatestStatus()?.machineState).toBe(GRBL_MACHINE_STATE.RUN);

    const disconnect: Promise<void> = harness.controller.disconnect();
    await vi.advanceTimersByTimeAsync(STOP_SETTLE_MS);
    await disconnect;
    const feedHoldIndex: number = transportLog.indexOf(GRBL_FEED_HOLD_BYTE);
    const softResetIndex: number = transportLog.indexOf(GRBL_SOFT_RESET_BYTE);

    expect(feedHoldIndex).toBeGreaterThanOrEqual(0);
    expect(softResetIndex).toBeGreaterThan(feedHoldIndex);
    expect(transportLog.indexOf(TRANSPORT_CLOSE_LOG_ENTRY)).toBeGreaterThan(softResetIndex);
    expect(getEventsOfKind(harness.events, GRBL_CONTROLLER_EVENT_KIND.GRBL_ALARM)).toEqual([]);
    await expect(stream).resolves.toEqual({ isCompleted: false, lineErrors: [] });
    expect(vi.getTimerCount()).toBe(0);
  });
});
