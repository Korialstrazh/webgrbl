/**
 * Runs the frame on the connected laser with the locks and the stop of a job; only the program differs.
 *
 * @author michael.morosov
 *
 * @since 2026-11-04
 *
 * @copyright michael.morosov - All rights reserved.
 * You may not use, distribute or modify this code without explicit permission by michael.morosov.
 */
import type { Task } from 'redux-saga';
import { call, cancel, fork, join, put, select, take } from 'redux-saga/effects';
import { getFrameProgramLines } from '../frame/get.frame.program.lines';
import { getFrameSValue } from '../frame/get.frame.s.value';
import type { FrameRectangle } from '../frame/interfaces/FrameRectangle';
import { GRBL_MACHINE_STATE } from '../grbl/grbl.constants';
import type { GrblController } from '../grbl/grbl.controller';
import type { GrblResolvedStatus } from '../grbl/interfaces/GrblResolvedStatus';
import type { MachineProfile } from '../profiles/interfaces/MachineProfile';
import type { Action } from './action';
import { selectFrameRectangle, selectFrameStartBlockedReasonKey } from './frame.start.blocked.reason.selector';
import { newRawErrorConsoleInfo } from './grbl.raw.error.console.info';
import { JOB_RUN_KIND } from './job.run.kind.constants';
import { followJobProgram, waitForJobInterruption } from './job.run.saga';
import { FrameRunAlarmed, JobRunStarted, JobRunStatusChanged } from './job.run.state';
import { JOB_RUN_STATUS } from './job.run.status.constants';
import type { JobRunStatus } from './job.run.status.constants';
import { selectActiveMachineProfile, selectFrameGridCellMm } from './machine.profile.state';
import {
  MachineAlarmReported,
  MachineControllerResetDetected,
  MachineResetRequested,
  MachineStatusReceived,
  MachineStopRequested,
  selectMachineStatus,
} from './machine.status.state';
import type { AppRootState } from './new.store';

/** Undefined when something the program needs is missing, so that nothing is sent. */
const getFrameProgramLinesOfState = (state: AppRootState): string[] | undefined => {
  const rectangle: FrameRectangle | undefined = selectFrameRectangle(state);
  const profile: MachineProfile | undefined = selectActiveMachineProfile(state);
  const status: GrblResolvedStatus | undefined = selectMachineStatus(state);

  if (!rectangle || !profile || !status?.workPosition) {
    return undefined;
  }

  return getFrameProgramLines({
    rectangle,
    gridCellMm: selectFrameGridCellMm(state),
    sValue: getFrameSValue(profile.maxPowerWatts, profile.sValueMax),
    profile,
    startPoint: status.workPosition,
  });
};

const isMachineAlarmAction = (action: Action<unknown>): boolean =>
  action.type === MachineStatusReceived.type
    ? (action as MachineStatusReceived).payload.status.machineState === GRBL_MACHINE_STATE.ALARM
    : action.type === MachineAlarmReported.type;

/**
 * Resolves true if an alarm comes first and false if the user or the controller interrupts first: a reset cut short by
 * its time limit raises ALARM:3 itself, which is no limit the card may report. The ALARM line counts because the
 * stream ends on it, up to one poll before a status report shows the Alarm state.
 */
function* waitForFrameEndCause(): Generator {
  while (true) {
    const action: Action<unknown> = (yield take([
      MachineAlarmReported.type,
      MachineStatusReceived.type,
      MachineStopRequested.type,
      MachineResetRequested.type,
      MachineControllerResetDetected.type,
    ])) as Action<unknown>;

    if (isMachineAlarmAction(action)) {
      return true;
    }

    if (action.type !== MachineStatusReceived.type) {
      return false;
    }
  }
}

function* followFrameProgram(
  controller: GrblController,
  programLines: string[],
  endCauseTask: Task,
  interruptionTask: Task,
): Generator {
  const programEndStatus: JobRunStatus =
    (yield call(followJobProgram, controller, programLines, interruptionTask)) as JobRunStatus;

  if (endCauseTask.isRunning()) {
    return programEndStatus;
  }

  // The machine goes Idle after the reset of a stop, and the program can end during one: neither is a finished frame.
  if (endCauseTask.result<boolean>()) {
    yield put(new FrameRunAlarmed());
  } else {
    yield join(interruptionTask);
  }

  return JOB_RUN_STATUS.INTERRUPTED;
}

export function* runGrblFrame(controller: GrblController): Generator {
  const blockedReasonKey: string | undefined = (yield select(selectFrameStartBlockedReasonKey)) as string | undefined;
  const programLines: string[] | undefined = (yield select(getFrameProgramLinesOfState)) as string[] | undefined;

  if (blockedReasonKey || !programLines) {
    return;
  }

  const endCauseTask: Task = (yield fork(waitForFrameEndCause)) as Task;
  const interruptionTask: Task = (yield fork(waitForJobInterruption)) as Task;

  yield put(new JobRunStarted({ startedAtMs: Date.now(), kind: JOB_RUN_KIND.FRAME }));

  try {
    const endStatus: JobRunStatus =
      (yield call(followFrameProgram, controller, programLines, endCauseTask, interruptionTask)) as JobRunStatus;

    yield put(new JobRunStatusChanged({ status: endStatus }));
  } catch (error: unknown) {
    yield put(newRawErrorConsoleInfo(error));
    yield put(new JobRunStatusChanged({ status: JOB_RUN_STATUS.INTERRUPTED }));
  } finally {
    yield cancel(endCauseTask);
    yield cancel(interruptionTask);
  }
}
