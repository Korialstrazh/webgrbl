import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import {
  GRBL_CONTROLLER_EVENT_KIND,
  GRBL_HOLD_SUBSTATE,
  GRBL_MACHINE_STATE,
  GRBL_REALTIME_COMMAND,
  GRBL_STATUS_POLL_INTERVAL_MS,
  GRBL_STOP_STATUS_POLL_INTERVAL_MS,
} from './grbl.constants';
import { runGrblStopSequence } from './grbl.stop.sequence';
import type { GrblMachineState } from './grbl.constants';
import type { GrblControllerEvent } from './interfaces/GrblControllerEvent';
import type { GrblResolvedStatus } from './interfaces/GrblResolvedStatus';
import type { GrblStopSequenceContext } from './interfaces/GrblStopSequenceContext';

const STEP_CALL_LOG_ENTRY = {
  RESET: 'reset',
} as const;

interface StopSequenceHarness {
  context: GrblStopSequenceContext;
  /** Realtime commands and resets in call order. */
  callLog: string[];
  /** Poll intervals set, in call order. */
  pollIntervals: number[];
  emitStatus: (machineState: GrblMachineState, machineSubstate?: number) => void;
}

const newStatus = (machineState: GrblMachineState, machineSubstate: number | undefined): GrblResolvedStatus => ({
  machineState,
  machineSubstate,
  machinePosition: undefined,
  workPosition: undefined,
  workCoordinateOffset: undefined,
  plannerBlocksAvailable: undefined,
  rxBytesAvailable: undefined,
  feedRate: undefined,
  spindleSpeed: undefined,
  overrides: undefined,
});

const newStopSequenceHarness = (unansweredStatusQueryCount: number): StopSequenceHarness => {
  const listeners: Set<(event: GrblControllerEvent) => void> = new Set();
  const callLog: string[] = [];
  const pollIntervals: number[] = [];
  const context: GrblStopSequenceContext = {
    clearPendingLines: (): void => undefined,
    writeRealtimeCommand: (command: string): void => {
      callLog.push(command);
    },
    getUnansweredStatusQueryCount: (): number => unansweredStatusQueryCount,
    setStatusPollInterval: (intervalMs: number): void => {
      pollIntervals.push(intervalMs);
    },
    addEventListener: (listener: (event: GrblControllerEvent) => void): (() => void) => {
      listeners.add(listener);

      return (): void => {
        listeners.delete(listener);
      };
    },
    setHoldWaitCanceller: (): void => undefined,
    resetMachine: async (): Promise<void> => {
      callLog.push(STEP_CALL_LOG_ENTRY.RESET);
    },
  };
  const emitStatus = (machineState: GrblMachineState, machineSubstate?: number): void => {
    for (const listener of listeners) {
      listener({ kind: GRBL_CONTROLLER_EVENT_KIND.STATUS_REPORT, status: newStatus(machineState, machineSubstate) });
    }
  };

  return { context, callLog, pollIntervals, emitStatus };
};

describe(runGrblStopSequence.name, () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('skips reports to queries written before the stop byte, even when they say Idle', async () => {
    const harness: StopSequenceHarness = newStopSequenceHarness(1);

    const stop: Promise<void> = runGrblStopSequence(harness.context);
    harness.emitStatus(GRBL_MACHINE_STATE.IDLE);
    await vi.advanceTimersByTimeAsync(0);

    expect(harness.callLog).toEqual([GRBL_REALTIME_COMMAND.FEED_HOLD]);

    harness.emitStatus(GRBL_MACHINE_STATE.HOLD, GRBL_HOLD_SUBSTATE.COMPLETE);
    await stop;

    expect(harness.callLog).toEqual([GRBL_REALTIME_COMMAND.FEED_HOLD, STEP_CALL_LOG_ENTRY.RESET]);
    expect(harness.pollIntervals).toEqual([GRBL_STOP_STATUS_POLL_INTERVAL_MS, GRBL_STATUS_POLL_INTERVAL_MS]);
    expect(vi.getTimerCount()).toBe(0);
  });

  it('keeps waiting through Run, Jog and Hold:1 and resets on Alarm', async () => {
    const harness: StopSequenceHarness = newStopSequenceHarness(0);

    const stop: Promise<void> = runGrblStopSequence(harness.context);
    harness.emitStatus(GRBL_MACHINE_STATE.RUN);
    harness.emitStatus(GRBL_MACHINE_STATE.JOG);
    harness.emitStatus(GRBL_MACHINE_STATE.HOLD, GRBL_HOLD_SUBSTATE.DECELERATING);
    await vi.advanceTimersByTimeAsync(0);

    expect(harness.callLog).toEqual([GRBL_REALTIME_COMMAND.FEED_HOLD]);

    harness.emitStatus(GRBL_MACHINE_STATE.ALARM);
    await stop;

    expect(harness.callLog).toEqual([GRBL_REALTIME_COMMAND.FEED_HOLD, STEP_CALL_LOG_ENTRY.RESET]);
  });
});
