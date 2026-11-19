import {
  GRBL_CONTROLLER_EVENT_KIND,
  GRBL_HOLD_COMPLETE_MAX_WAIT_MS,
  GRBL_HOLD_SUBSTATE,
  GRBL_MACHINE_STATE,
  GRBL_REALTIME_COMMAND,
  GRBL_STATUS_POLL_INTERVAL_MS,
  GRBL_STOP_STATUS_POLL_INTERVAL_MS,
} from './grbl.constants';
import type { GrblControllerEvent } from './interfaces/GrblControllerEvent';
import type { GrblResolvedStatus } from './interfaces/GrblResolvedStatus';
import type { GrblStopSequenceContext } from './interfaces/GrblStopSequenceContext';

const isHoldDecelerating = (status: GrblResolvedStatus): boolean =>
  status.machineState === GRBL_MACHINE_STATE.HOLD && status.machineSubstate === GRBL_HOLD_SUBSTATE.DECELERATING;

/** True while a soft reset would cut off motion, lose steps and raise ALARM:3. */
const isMachineMoving = (status: GrblResolvedStatus): boolean =>
  status.machineState === GRBL_MACHINE_STATE.RUN ||
  status.machineState === GRBL_MACHINE_STATE.JOG ||
  isHoldDecelerating(status);

/**
 * Resolves on the first status report answering a query written after the stop byte that shows the machine not
 * moving, after the maximum wait, or when cancelled. Reports to earlier queries describe the machine before the stop
 * byte took effect, so they are skipped.
 */
const waitForMachineAtRest = (context: GrblStopSequenceContext, earlierReportCount: number): Promise<void> =>
  new Promise((resolve: () => void): void => {
    let remainingEarlierReportCount: number = earlierReportCount;
    const endWait = (): void => {
      clearTimeout(maxWaitTimerId);
      removeStatusListener();
      context.setHoldWaitCanceller(undefined);
      resolve();
    };
    const handleControllerEvent = (event: GrblControllerEvent): void => {
      if (event.kind !== GRBL_CONTROLLER_EVENT_KIND.STATUS_REPORT) {
        return;
      }

      if (remainingEarlierReportCount) {
        remainingEarlierReportCount--;
      } else if (!isMachineMoving(event.status)) {
        endWait();
      }
    };
    const maxWaitTimerId: ReturnType<typeof setTimeout> = setTimeout(endWait, GRBL_HOLD_COMPLETE_MAX_WAIT_MS);
    const removeStatusListener: () => void = context.addEventListener(handleControllerEvent);

    context.setHoldWaitCanceller(endWait);
  });

/**
 * Stops the machine as fast as possible without losing its position. The latest status may be up to one poll
 * interval old, so it is not trusted to say the machine stands still, nor what it does: unsent lines are dropped and a
 * feed hold is always written. In GRBL 1.1 a feed hold holds a run, cancels a jog, gives Hold:0 at once when idle and
 * is ignored in Alarm, so it is right whatever the machine really does; jog cancel (0x85) chosen from a stale Jog
 * status would leave a G1 move that started meanwhile running. The sequence then waits until a fresh status report
 * shows the machine not moving, polling faster meanwhile, at most 2000 ms. Then it soft-resets and resolves once the
 * reset byte is written.
 *
 * @author michael.morosov
 *
 * @since 2026-10-30
 *
 * @copyright 2026 michael.morosov
 * Licensed under the Apache License, Version 2.0. See the LICENSE file.
 */
export const runGrblStopSequence = async (context: GrblStopSequenceContext): Promise<void> => {
  context.clearPendingLines();
  context.writeRealtimeCommand(GRBL_REALTIME_COMMAND.FEED_HOLD);

  const earlierReportCount: number = context.getUnansweredStatusQueryCount();

  context.setStatusPollInterval(GRBL_STOP_STATUS_POLL_INTERVAL_MS);
  await waitForMachineAtRest(context, earlierReportCount);
  await context.resetMachine();
  context.setStatusPollInterval(GRBL_STATUS_POLL_INTERVAL_MS);
};
