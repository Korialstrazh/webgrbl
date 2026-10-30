import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import {
  GRBL_CONSOLE_DIRECTION,
  GRBL_CONTROLLER_EVENT_KIND,
  GRBL_DEFAULT_RX_BUFFER_BYTES,
  GRBL_HOLD_COMPLETE_MAX_WAIT_MS,
  GRBL_MACHINE_STATE,
  GRBL_REALTIME_COMMAND,
  GRBL_RESET_BANNER_TIMEOUT_MS,
  GRBL_STATUS_POLL_INTERVAL_MS,
  GRBL_UNLOCK_COMMAND,
} from './grbl.constants';
import { GrblController } from './grbl.controller';
import { GRBL_SIMULATOR_BANNER, GRBL_SIMULATOR_FAULT_KIND } from './simulator/grbl.simulator.constants';
import { ANSWER_SETTLE_MS } from './test.support/grbl.answer.settle';
import { getConsoleEntries } from './test.support/grbl.console.entries';
import { newGrblControllerHarness } from './test.support/grbl.controller.harness';
import type { GrblControllerEventKind, GrblRealtimeCommand } from './grbl.constants';
import type { GrblConsoleEntry } from './interfaces/GrblConsoleEntry';
import type { GrblControllerEvent } from './interfaces/GrblControllerEvent';
import type { GrblResolvedStatus } from './interfaces/GrblResolvedStatus';
import type { GrblControllerHarness } from './test.support/GrblControllerHarness';

/** 300 mm at 600 mm/min takes 30 s, far longer than any test runs. */
const LONG_MOVE = 'G1X300F600';
const LONG_MOVE_END_X = 300;
const JOG_MOVE = '$J=G91X50F1000';
/** Time for the move to start and a status poll to report it. */
const MOVE_RUNNING_MS = 500;
/** Time for the move to start, well before the next status poll. */
const MOVE_JUST_STARTED_MS = 5;
/** The simulator needs 200 ms to decelerate; a 50 ms poll sees Hold:0 within the next 50 ms. */
const FAST_HOLD_DETECTION_MS = 300;
/** Status queries a 50 ms poll sends during the 200 ms deceleration at least; a 250 ms poll sends one at most. */
const HOLD_WAIT_MIN_STATUS_QUERY_COUNT = 4;
const POLL_COUNT = 4;
/** Long enough for any stop sequence to finish and the poll after it to answer. */
const STOP_SETTLE_MS = GRBL_HOLD_COMPLETE_MAX_WAIT_MS + GRBL_STATUS_POLL_INTERVAL_MS + ANSWER_SETTLE_MS;
const SHORT_MOVE = 'G1X1F600';
const QUEUED_MOVE_COUNT = 20;
/** Bytes the line break adds to every sent line. */
const LINE_BREAK_BYTE_COUNT = 1;
const OK_TEXT = 'ok';
const STREAMED_MOVES: readonly string[] = [LONG_MOVE, 'G1X2F600', 'G1X3F600', 'G1X4F600', 'G1X5F600'];
/** The handshake sends $I and $$, so the simulator counts the first console line as line 3. */
const HANDSHAKE_LINE_COUNT = 2;
const FAILING_LINE_ERROR_CODE = 20;

const newConnectedHarness = async (): Promise<GrblControllerHarness> => {
  const harness: GrblControllerHarness = newGrblControllerHarness();
  const connection: Promise<unknown> = harness.controller.connect();
  await vi.advanceTimersByTimeAsync(ANSWER_SETTLE_MS);
  await connection;
  harness.events.length = 0;

  return harness;
};

/** Realtime commands written, without the status queries of the poll. */
const getSentRealtimeCommands = (events: GrblControllerEvent[]): GrblRealtimeCommand[] => {
  const commands: GrblRealtimeCommand[] = [];

  for (const entry of getConsoleEntries(events)) {
    if (entry.realtimeCommand && entry.realtimeCommand !== GRBL_REALTIME_COMMAND.STATUS_QUERY) {
      commands.push(entry.realtimeCommand);
    }
  }

  return commands;
};

const getStatusQueryCount = (events: GrblControllerEvent[]): number =>
  getConsoleEntries(events).filter(
    (entry: GrblConsoleEntry) => entry.realtimeCommand === GRBL_REALTIME_COMMAND.STATUS_QUERY,
  ).length;

const getEventsOfKind = (events: GrblControllerEvent[], kind: GrblControllerEventKind): GrblControllerEvent[] =>
  events.filter((event: GrblControllerEvent) => event.kind === kind);

const getAlarmEvents = (events: GrblControllerEvent[]): GrblControllerEvent[] =>
  getEventsOfKind(events, GRBL_CONTROLLER_EVENT_KIND.GRBL_ALARM);

const getErrorEvents = (events: GrblControllerEvent[]): GrblControllerEvent[] =>
  getEventsOfKind(events, GRBL_CONTROLLER_EVENT_KIND.GRBL_ERROR);

/** Texts of all console entries except the status poll. */
const getConsoleTexts = (events: GrblControllerEvent[]): string[] =>
  getConsoleEntries(events)
    .filter((entry: GrblConsoleEntry) => !entry.isStatusReport)
    .map((entry: GrblConsoleEntry) => entry.text);

const getLatestStatus = (harness: GrblControllerHarness): GrblResolvedStatus => {
  const status: GrblResolvedStatus | undefined = harness.controller.getLatestStatus();

  if (!status) {
    throw new Error('No status report received');
  }

  return status;
};

const getMachineX = (status: GrblResolvedStatus): number => status.machinePosition?.x ?? Number.NaN;

/** The latest status may still say Run, so disconnect() stops the machine first; its stop needs fake time to finish. */
const disconnectAfterStop = async (harness: GrblControllerHarness): Promise<void> => {
  const disconnect: Promise<void> = harness.controller.disconnect();
  await vi.advanceTimersByTimeAsync(STOP_SETTLE_MS);
  await disconnect;
};

const newPromiseTracker = (promise: Promise<void>): { isResolved: () => boolean } => {
  let isResolved = false;
  void promise.then((): void => {
    isResolved = true;
  });

  return { isResolved: (): boolean => isResolved };
};

describe(GrblController.name, () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('stop during a long move holds first, then resets, and the simulator raises no alarm', async () => {
    const harness: GrblControllerHarness = await newConnectedHarness();
    harness.controller.sendConsoleCommand(LONG_MOVE);
    await vi.advanceTimersByTimeAsync(MOVE_RUNNING_MS);

    expect(getLatestStatus(harness).machineState).toBe(GRBL_MACHINE_STATE.RUN);

    const stopTracker = newPromiseTracker(harness.controller.stopMachine());
    await vi.advanceTimersByTimeAsync(FAST_HOLD_DETECTION_MS);

    expect(stopTracker.isResolved()).toBe(true);

    await vi.advanceTimersByTimeAsync(STOP_SETTLE_MS);
    const finalStatus: GrblResolvedStatus = getLatestStatus(harness);

    expect(getSentRealtimeCommands(harness.events)).toEqual([
      GRBL_REALTIME_COMMAND.FEED_HOLD,
      GRBL_REALTIME_COMMAND.SOFT_RESET,
    ]);
    expect(getAlarmEvents(harness.events)).toEqual([]);
    expect(finalStatus.machineState).toBe(GRBL_MACHINE_STATE.IDLE);
    expect(getMachineX(finalStatus)).toBeGreaterThan(0);
    expect(getMachineX(finalStatus)).toBeLessThan(LONG_MOVE_END_X);

    await harness.controller.disconnect();
    expect(vi.getTimerCount()).toBe(0);
  });

  it('stop polls status every 50 ms while waiting for the hold and every 250 ms after the reset', async () => {
    const harness: GrblControllerHarness = await newConnectedHarness();
    harness.controller.sendConsoleCommand(LONG_MOVE);
    await vi.advanceTimersByTimeAsync(MOVE_RUNNING_MS);
    harness.events.length = 0;

    const stop: Promise<void> = harness.controller.stopMachine();
    await vi.advanceTimersByTimeAsync(FAST_HOLD_DETECTION_MS);
    await stop;
    const holdWaitStatusQueryCount: number = getStatusQueryCount(harness.events);
    harness.events.length = 0;
    await vi.advanceTimersByTimeAsync(GRBL_STATUS_POLL_INTERVAL_MS * POLL_COUNT);

    expect(holdWaitStatusQueryCount).toBeGreaterThanOrEqual(HOLD_WAIT_MIN_STATUS_QUERY_COUNT);
    expect(getStatusQueryCount(harness.events)).toBe(POLL_COUNT);

    await harness.controller.disconnect();
  });

  it('stop during a jog sends jog cancel instead of feed hold', async () => {
    const harness: GrblControllerHarness = await newConnectedHarness();
    harness.controller.sendConsoleCommand(JOG_MOVE);
    await vi.advanceTimersByTimeAsync(MOVE_RUNNING_MS);

    expect(getLatestStatus(harness).machineState).toBe(GRBL_MACHINE_STATE.JOG);

    const stop: Promise<void> = harness.controller.stopMachine();
    await vi.advanceTimersByTimeAsync(STOP_SETTLE_MS);
    await stop;

    expect(getSentRealtimeCommands(harness.events)).toEqual([
      GRBL_REALTIME_COMMAND.JOG_CANCEL,
      GRBL_REALTIME_COMMAND.SOFT_RESET,
    ]);
    expect(getAlarmEvents(harness.events)).toEqual([]);
    expect(getLatestStatus(harness).machineState).toBe(GRBL_MACHINE_STATE.IDLE);

    await harness.controller.disconnect();
  });

  it('stop resets anyway after 2000 ms when hold never completes', async () => {
    const harness: GrblControllerHarness = await newConnectedHarness();
    harness.controller.sendConsoleCommand(LONG_MOVE);
    await vi.advanceTimersByTimeAsync(MOVE_RUNNING_MS);
    harness.transport.getSimulator().injectFault({ kind: GRBL_SIMULATOR_FAULT_KIND.STOP_RESPONDING });

    const stopTracker = newPromiseTracker(harness.controller.stopMachine());
    await vi.advanceTimersByTimeAsync(GRBL_HOLD_COMPLETE_MAX_WAIT_MS - 1);

    expect(getSentRealtimeCommands(harness.events)).toEqual([GRBL_REALTIME_COMMAND.FEED_HOLD]);
    expect(stopTracker.isResolved()).toBe(false);

    await vi.advanceTimersByTimeAsync(1);

    expect(getSentRealtimeCommands(harness.events)).toEqual([
      GRBL_REALTIME_COMMAND.FEED_HOLD,
      GRBL_REALTIME_COMMAND.SOFT_RESET,
    ]);
    expect(stopTracker.isResolved()).toBe(true);

    await disconnectAfterStop(harness);
    expect(vi.getTimerCount()).toBe(0);
  });

  it('stop while idle still holds first, then resets without an alarm', async () => {
    const harness: GrblControllerHarness = await newConnectedHarness();
    await vi.advanceTimersByTimeAsync(GRBL_STATUS_POLL_INTERVAL_MS + ANSWER_SETTLE_MS);

    expect(getLatestStatus(harness).machineState).toBe(GRBL_MACHINE_STATE.IDLE);

    const stop: Promise<void> = harness.controller.stopMachine();
    await vi.advanceTimersByTimeAsync(STOP_SETTLE_MS);
    await stop;

    expect(getSentRealtimeCommands(harness.events)).toEqual([
      GRBL_REALTIME_COMMAND.FEED_HOLD,
      GRBL_REALTIME_COMMAND.SOFT_RESET,
    ]);
    expect(getAlarmEvents(harness.events)).toEqual([]);
    expect(getLatestStatus(harness).machineState).toBe(GRBL_MACHINE_STATE.IDLE);

    await harness.controller.disconnect();
  });

  it('stop right after a move starts, before any poll saw it, holds first and raises no alarm', async () => {
    const harness: GrblControllerHarness = await newConnectedHarness();
    await vi.advanceTimersByTimeAsync(GRBL_STATUS_POLL_INTERVAL_MS + ANSWER_SETTLE_MS);
    harness.controller.sendConsoleCommand(LONG_MOVE);
    await vi.advanceTimersByTimeAsync(MOVE_JUST_STARTED_MS);

    expect(getLatestStatus(harness).machineState).toBe(GRBL_MACHINE_STATE.IDLE);

    const stop: Promise<void> = harness.controller.stopMachine();
    await vi.advanceTimersByTimeAsync(STOP_SETTLE_MS);
    await stop;

    expect(getSentRealtimeCommands(harness.events)).toEqual([
      GRBL_REALTIME_COMMAND.FEED_HOLD,
      GRBL_REALTIME_COMMAND.SOFT_RESET,
    ]);
    expect(getAlarmEvents(harness.events)).toEqual([]);
    expect(getLatestStatus(harness).machineState).toBe(GRBL_MACHINE_STATE.IDLE);

    await harness.controller.disconnect();
  });

  it('stop during a stream of several lines emits no grbl-error', async () => {
    const harness: GrblControllerHarness = await newConnectedHarness();

    for (const move of STREAMED_MOVES) {
      harness.controller.sendConsoleCommand(move);
    }

    await vi.advanceTimersByTimeAsync(MOVE_RUNNING_MS);

    const stop: Promise<void> = harness.controller.stopMachine();
    await vi.advanceTimersByTimeAsync(STOP_SETTLE_MS);
    await stop;

    expect(getErrorEvents(harness.events)).toEqual([]);
    expect(getAlarmEvents(harness.events)).toEqual([]);

    await harness.controller.disconnect();
  });

  it('a second stop during a running stop returns the same promise and sends one reset', async () => {
    const harness: GrblControllerHarness = await newConnectedHarness();
    harness.controller.sendConsoleCommand(LONG_MOVE);
    await vi.advanceTimersByTimeAsync(MOVE_RUNNING_MS);

    const firstStop: Promise<void> = harness.controller.stopMachine();
    const secondStop: Promise<void> = harness.controller.stopMachine();
    await vi.advanceTimersByTimeAsync(STOP_SETTLE_MS);
    await firstStop;

    expect(secondStop).toBe(firstStop);
    expect(getSentRealtimeCommands(harness.events)).toEqual([
      GRBL_REALTIME_COMMAND.FEED_HOLD,
      GRBL_REALTIME_COMMAND.SOFT_RESET,
    ]);

    await harness.controller.disconnect();
  });

  it('reset clears pending console lines', async () => {
    const harness: GrblControllerHarness = await newConnectedHarness();
    const linesFittingRxBuffer: number = Math.floor(
      GRBL_DEFAULT_RX_BUFFER_BYTES / (SHORT_MOVE.length + LINE_BREAK_BYTE_COUNT),
    );

    for (let lineIndex = 0; lineIndex < QUEUED_MOVE_COUNT; lineIndex++) {
      harness.controller.sendConsoleCommand(SHORT_MOVE);
    }

    await harness.controller.resetMachine();
    await vi.advanceTimersByTimeAsync(STOP_SETTLE_MS);
    const sentTexts: string[] = getConsoleEntries(harness.events)
      .filter((entry: GrblConsoleEntry) => entry.direction === GRBL_CONSOLE_DIRECTION.SENT)
      .map((entry: GrblConsoleEntry) => entry.text);

    expect(sentTexts).toEqual(Array<string>(linesFittingRxBuffer).fill(SHORT_MOVE));

    await harness.controller.disconnect();
  });

  it('unlock sent right after a reset waits for the banner and gets its own ok', async () => {
    const harness: GrblControllerHarness = await newConnectedHarness();
    harness.controller.sendConsoleCommand(LONG_MOVE);
    harness.controller.sendConsoleCommand(SHORT_MOVE);

    await harness.controller.resetMachine();
    harness.controller.unlockMachine();
    await vi.advanceTimersByTimeAsync(ANSWER_SETTLE_MS);
    const entryTexts: string[] = getConsoleTexts(harness.events);
    const unlockIndex: number = entryTexts.indexOf(GRBL_UNLOCK_COMMAND);

    expect(unlockIndex).toBeGreaterThan(entryTexts.indexOf(GRBL_SIMULATOR_BANNER));
    expect(entryTexts.slice(unlockIndex)).toContain(OK_TEXT);

    await harness.controller.disconnect();
  });

  it('answers to lines the reset wiped emit no grbl-error', async () => {
    const harness: GrblControllerHarness = await newConnectedHarness();
    harness.transport.getSimulator().injectFault({
      kind: GRBL_SIMULATOR_FAULT_KIND.ERROR_ON_LINE,
      lineNumber: HANDSHAKE_LINE_COUNT + STREAMED_MOVES.length,
      errorCode: FAILING_LINE_ERROR_CODE,
    });

    for (const move of STREAMED_MOVES) {
      harness.controller.sendConsoleCommand(move);
    }

    await harness.controller.resetMachine();
    await vi.advanceTimersByTimeAsync(ANSWER_SETTLE_MS);

    expect(getConsoleTexts(harness.events)).toContain(`error:${FAILING_LINE_ERROR_CODE}`);
    expect(getErrorEvents(harness.events)).toEqual([]);

    await harness.controller.disconnect();
  });

  it('two quick resets hold the queue until the second banner and keep later answers paired', async () => {
    const harness: GrblControllerHarness = await newConnectedHarness();
    harness.controller.sendConsoleCommand(LONG_MOVE);

    await harness.controller.resetMachine();
    await harness.controller.resetMachine();
    harness.controller.unlockMachine();
    await vi.advanceTimersByTimeAsync(ANSWER_SETTLE_MS);
    harness.controller.sendConsoleCommand(SHORT_MOVE);
    await vi.advanceTimersByTimeAsync(ANSWER_SETTLE_MS);
    const entryTexts: string[] = getConsoleTexts(harness.events);
    const unlockIndex: number = entryTexts.indexOf(GRBL_UNLOCK_COMMAND);

    expect(unlockIndex).toBeGreaterThan(entryTexts.lastIndexOf(GRBL_SIMULATOR_BANNER));
    expect(entryTexts.slice(unlockIndex)).toContain(OK_TEXT);
    expect(entryTexts.slice(-2)).toEqual([SHORT_MOVE, OK_TEXT]);
    expect(getErrorEvents(harness.events)).toEqual([]);

    await harness.controller.disconnect();
  });

  it('reset without a banner releases the queue after 10000 ms and reports not-responding', async () => {
    const harness: GrblControllerHarness = await newConnectedHarness();
    harness.transport.getSimulator().injectFault({ kind: GRBL_SIMULATOR_FAULT_KIND.STOP_RESPONDING });

    await harness.controller.resetMachine();
    harness.controller.unlockMachine();
    await vi.advanceTimersByTimeAsync(GRBL_RESET_BANNER_TIMEOUT_MS - 1);

    expect(getConsoleTexts(harness.events)).not.toContain(GRBL_UNLOCK_COMMAND);
    expect(getEventsOfKind(harness.events, GRBL_CONTROLLER_EVENT_KIND.NOT_RESPONDING)).toEqual([]);

    await vi.advanceTimersByTimeAsync(1);

    expect(getConsoleTexts(harness.events)).toContain(GRBL_UNLOCK_COMMAND);
    expect(getEventsOfKind(harness.events, GRBL_CONTROLLER_EVENT_KIND.NOT_RESPONDING)).toEqual([
      { kind: GRBL_CONTROLLER_EVENT_KIND.NOT_RESPONDING },
    ]);

    await harness.controller.disconnect();
    expect(vi.getTimerCount()).toBe(0);
  });

  it('feed hold and cycle resume are written as realtime entries and pause and continue the move', async () => {
    const harness: GrblControllerHarness = await newConnectedHarness();
    harness.controller.sendConsoleCommand(LONG_MOVE);
    await vi.advanceTimersByTimeAsync(MOVE_RUNNING_MS);

    await harness.controller.sendFeedHold();
    await vi.advanceTimersByTimeAsync(MOVE_RUNNING_MS);
    const heldStatus: GrblResolvedStatus = getLatestStatus(harness);
    await harness.controller.sendCycleResume();
    await vi.advanceTimersByTimeAsync(MOVE_RUNNING_MS);

    expect(heldStatus.machineState).toBe(GRBL_MACHINE_STATE.HOLD);
    expect(getLatestStatus(harness).machineState).toBe(GRBL_MACHINE_STATE.RUN);
    expect(getSentRealtimeCommands(harness.events)).toEqual([
      GRBL_REALTIME_COMMAND.FEED_HOLD,
      GRBL_REALTIME_COMMAND.CYCLE_RESUME,
    ]);

    await disconnectAfterStop(harness);
  });

  it('machine commands while disconnected write nothing', async () => {
    const harness: GrblControllerHarness = newGrblControllerHarness();
    const writeSpy = vi.spyOn(harness.transport, 'write');

    await harness.controller.stopMachine();
    await harness.controller.resetMachine();
    await harness.controller.sendFeedHold();
    await harness.controller.sendCycleResume();
    harness.controller.unlockMachine();

    expect(writeSpy).not.toHaveBeenCalled();
    expect(harness.events).toEqual([]);
  });

  it('connection loss during the hold wait ends the stop without a reset and leaves no timer behind', async () => {
    const harness: GrblControllerHarness = await newConnectedHarness();
    harness.controller.sendConsoleCommand(LONG_MOVE);
    await vi.advanceTimersByTimeAsync(MOVE_RUNNING_MS);
    harness.transport.getSimulator().injectFault({ kind: GRBL_SIMULATOR_FAULT_KIND.STOP_RESPONDING });
    const stop: Promise<void> = harness.controller.stopMachine();

    harness.transport.simulateConnectionLoss();
    await stop;

    expect(getSentRealtimeCommands(harness.events)).toEqual([GRBL_REALTIME_COMMAND.FEED_HOLD]);
    expect(vi.getTimerCount()).toBe(0);
  });
});
