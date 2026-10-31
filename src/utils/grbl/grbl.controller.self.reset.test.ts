import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import {
  GRBL_CONTROLLER_EVENT_KIND,
  GRBL_LINE_ORIGIN,
  GRBL_NOT_RESPONDING_SILENCE_MS,
} from './grbl.constants';
import { GrblController } from './grbl.controller';
import { GRBL_SIMULATOR_FAULT_KIND } from './simulator/grbl.simulator.constants';
import { ANSWER_SETTLE_MS } from './test.support/grbl.answer.settle';
import { newGrblControllerHarness } from './test.support/grbl.controller.harness';
import { disconnectGrblHarness } from './test.support/grbl.harness.disconnect';
import type { GrblControllerEventKind } from './grbl.constants';
import type { GrblControllerEvent } from './interfaces/GrblControllerEvent';
import type { GrblProgramResult } from './interfaces/GrblProgramResult';
import type { GrblControllerHarness } from './test.support/GrblControllerHarness';

/** 300 mm at 600 mm/min takes 30 s, far longer than any test runs. */
const LONG_MOVE = 'G1X300F600';
/** Enough long moves to fill the 15-block planner and leave lines waiting, unanswered, in the receive buffer. */
const LONG_MOVE_COUNT = 20;
const MOVE_RUNNING_MS = 500;
/** The simulator needs 200 ms to decelerate to Hold:0. */
const HOLD_COMPLETE_MS = 300;
/** No feed word, so GRBL answers error:22. */
const FEEDLESS_MOVE = 'G1X10';
const UNDEFINED_FEED_ERROR_CODE = 22;

const newConnectedHarness = async (): Promise<GrblControllerHarness> => {
  const harness: GrblControllerHarness = newGrblControllerHarness();
  const connection: Promise<unknown> = harness.controller.connect();
  await vi.advanceTimersByTimeAsync(ANSWER_SETTLE_MS);
  await connection;
  harness.events.length = 0;

  return harness;
};

const getEventsOfKind = (events: GrblControllerEvent[], kind: GrblControllerEventKind): GrblControllerEvent[] =>
  events.filter((event: GrblControllerEvent) => event.kind === kind);

/**
 * Lines wait unanswered in the receive buffer, and the machine stands still in Hold:0, so the reset raises no alarm
 * and only the banner tells the controller that those lines are gone.
 */
const holdWithLinesInFlight = async (harness: GrblControllerHarness): Promise<void> => {
  await vi.advanceTimersByTimeAsync(MOVE_RUNNING_MS);
  await harness.controller.sendFeedHold();
  await vi.advanceTimersByTimeAsync(HOLD_COMPLETE_MS);
};

const newPromiseTracker = (promise: Promise<unknown>): { isSettled: () => boolean } => {
  let isSettled = false;
  void promise.finally((): void => {
    isSettled = true;
  });

  return { isSettled: (): boolean => isSettled };
};

describe(GrblController.name, () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('a controller reset with console lines in flight drops them, so later answers pair with later lines', async () => {
    const harness: GrblControllerHarness = await newConnectedHarness();

    for (let moveIndex = 0; moveIndex < LONG_MOVE_COUNT; moveIndex++) {
      harness.controller.sendConsoleCommand(LONG_MOVE);
    }

    await holdWithLinesInFlight(harness);
    harness.transport.getSimulator().injectFault({ kind: GRBL_SIMULATOR_FAULT_KIND.SELF_RESET });
    await vi.advanceTimersByTimeAsync(ANSWER_SETTLE_MS);
    harness.controller.sendConsoleCommand(FEEDLESS_MOVE);
    await vi.advanceTimersByTimeAsync(ANSWER_SETTLE_MS);

    expect(getEventsOfKind(harness.events, GRBL_CONTROLLER_EVENT_KIND.CONTROLLER_RESET)).toHaveLength(1);
    expect(getEventsOfKind(harness.events, GRBL_CONTROLLER_EVENT_KIND.GRBL_ALARM)).toEqual([]);
    expect(getEventsOfKind(harness.events, GRBL_CONTROLLER_EVENT_KIND.GRBL_ERROR)).toEqual([{
      kind: GRBL_CONTROLLER_EVENT_KIND.GRBL_ERROR,
      code: UNDEFINED_FEED_ERROR_CODE,
      lineText: FEEDLESS_MOVE,
      origin: GRBL_LINE_ORIGIN.CONSOLE,
    }]);

    await vi.advanceTimersByTimeAsync(GRBL_NOT_RESPONDING_SILENCE_MS);

    expect(getEventsOfKind(harness.events, GRBL_CONTROLLER_EVENT_KIND.NOT_RESPONDING)).toEqual([]);

    await disconnectGrblHarness(harness);
  });

  it('a controller reset during a program resolves it with isCompleted false and emits controller-reset', async () => {
    const harness: GrblControllerHarness = await newConnectedHarness();
    const stream: Promise<GrblProgramResult> = harness.controller.streamProgram(
      Array<string>(LONG_MOVE_COUNT).fill(LONG_MOVE),
      { isStopOnErrorEnabled: true },
    );
    const streamTracker = newPromiseTracker(stream);

    await holdWithLinesInFlight(harness);
    harness.transport.getSimulator().injectFault({ kind: GRBL_SIMULATOR_FAULT_KIND.SELF_RESET });
    await vi.advanceTimersByTimeAsync(ANSWER_SETTLE_MS);

    expect(streamTracker.isSettled()).toBe(true);
    await expect(stream).resolves.toEqual({ isCompleted: false, lineErrors: [] });
    expect(getEventsOfKind(harness.events, GRBL_CONTROLLER_EVENT_KIND.CONTROLLER_RESET)).toEqual([
      { kind: GRBL_CONTROLLER_EVENT_KIND.CONTROLLER_RESET },
    ]);

    const nextStream: Promise<GrblProgramResult> = harness.controller.streamProgram([FEEDLESS_MOVE], {
      isStopOnErrorEnabled: false,
    });
    await vi.advanceTimersByTimeAsync(ANSWER_SETTLE_MS);

    await expect(nextStream).resolves.toEqual({
      isCompleted: true,
      lineErrors: [{ lineNumber: 1, lineText: FEEDLESS_MOVE, errorCode: UNDEFINED_FEED_ERROR_CODE }],
    });

    await disconnectGrblHarness(harness);
  });

  it('the banner of a reset the app caused is no controller reset', async () => {
    const harness: GrblControllerHarness = await newConnectedHarness();

    await harness.controller.resetMachine();
    await vi.advanceTimersByTimeAsync(ANSWER_SETTLE_MS);

    expect(getEventsOfKind(harness.events, GRBL_CONTROLLER_EVENT_KIND.CONTROLLER_RESET)).toEqual([]);

    await disconnectGrblHarness(harness);
  });
});
