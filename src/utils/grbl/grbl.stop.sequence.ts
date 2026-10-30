import {
  GRBL_CONTROLLER_EVENT_KIND,
  GRBL_HOLD_COMPLETE_MAX_WAIT_MS,
  GRBL_HOLD_SUBSTATE,
  GRBL_MACHINE_STATE,
  GRBL_REALTIME_COMMAND,
  GRBL_STATUS_POLL_INTERVAL_MS,
  GRBL_STOP_STATUS_POLL_INTERVAL_MS,
} from './grbl.constants';
import type { GrblRealtimeCommand } from './grbl.constants';
import type { GrblControllerEvent } from './interfaces/GrblControllerEvent';
import type { GrblResolvedStatus } from './interfaces/GrblResolvedStatus';
import type { GrblStopSequenceContext } from './interfaces/GrblStopSequenceContext';

/** How the stop sequence brings a moving machine to rest before the reset. */
interface GrblMotionStopPlan {
  /** Byte that starts the deceleration; undefined when the machine is already decelerating. */
  realtimeCommand: GrblRealtimeCommand | undefined;
}

const isHoldDecelerating = (status: GrblResolvedStatus): boolean =>
  status.machineState === GRBL_MACHINE_STATE.HOLD && status.machineSubstate === GRBL_HOLD_SUBSTATE.DECELERATING;

const isHoldComplete = (status: GrblResolvedStatus): boolean =>
  status.machineState === GRBL_MACHINE_STATE.HOLD && status.machineSubstate === GRBL_HOLD_SUBSTATE.COMPLETE;

/** True once the machine stands still, so a soft reset keeps the position. */
const isMachineAtRest = (status: GrblResolvedStatus): boolean =>
  status.machineState === GRBL_MACHINE_STATE.IDLE || isHoldComplete(status);

/**
 * A reset while moving loses steps, so a moving machine is first decelerated; undefined means the machine does not
 * move and can be reset at once.
 */
const getMotionStopPlan = (status: GrblResolvedStatus | undefined): GrblMotionStopPlan | undefined => {
  switch (status?.machineState) {
  case GRBL_MACHINE_STATE.JOG:
    return { realtimeCommand: GRBL_REALTIME_COMMAND.JOG_CANCEL };
  case GRBL_MACHINE_STATE.RUN:
    return { realtimeCommand: GRBL_REALTIME_COMMAND.FEED_HOLD };
  default:
    return status && isHoldDecelerating(status) ? { realtimeCommand: undefined } : undefined;
  }
};

/** Resolves once a status report shows the machine at rest, after the maximum wait, or when cancelled. */
const waitForMachineAtRest = (context: GrblStopSequenceContext): Promise<void> =>
  new Promise((resolve: () => void): void => {
    const endWait = (): void => {
      clearTimeout(maxWaitTimerId);
      removeStatusListener();
      context.setHoldWaitCanceller(undefined);
      resolve();
    };
    const maxWaitTimerId: ReturnType<typeof setTimeout> = setTimeout(endWait, GRBL_HOLD_COMPLETE_MAX_WAIT_MS);
    const removeStatusListener: () => void = context.addEventListener((event: GrblControllerEvent): void => {
      if (event.kind === GRBL_CONTROLLER_EVENT_KIND.STATUS_REPORT && isMachineAtRest(event.status)) {
        endWait();
      }
    });

    context.setHoldWaitCanceller(endWait);
  });

/**
 * Stops the machine as fast as possible without losing its position: drops unsent lines, decelerates a moving
 * machine with a jog cancel or feed hold, waits for it to stand still (polling faster meanwhile, at most 2000 ms),
 * then soft-resets. Resolves once the reset byte is written.
 *
 * @author michael.morosov
 *
 * @since 2026-10-30
 *
 * @copyright michael.morosov - All rights reserved.
 * You may not use, distribute or modify this code without explicit permission by michael.morosov.
 */
export const runGrblStopSequence = async (context: GrblStopSequenceContext): Promise<void> => {
  context.clearPendingLines();

  const motionStopPlan: GrblMotionStopPlan | undefined = getMotionStopPlan(context.getLatestStatus());

  if (motionStopPlan) {
    if (motionStopPlan.realtimeCommand) {
      context.writeRealtimeCommand(motionStopPlan.realtimeCommand);
    }

    context.setStatusPollInterval(GRBL_STOP_STATUS_POLL_INTERVAL_MS);
    await waitForMachineAtRest(context);
  }

  await context.resetMachine();
  context.setStatusPollInterval(GRBL_STATUS_POLL_INTERVAL_MS);
};
