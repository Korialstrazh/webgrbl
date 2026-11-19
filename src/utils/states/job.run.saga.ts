/**
 * Runs a job on the connected laser: sends the same program as the G-code export and follows it to its end.
 *
 * @author michael.morosov
 *
 * @since 2026-11-03
 *
 * @copyright michael.morosov - All rights reserved.
 * You may not use, distribute or modify this code without explicit permission by michael.morosov.
 */
import type { Task } from 'redux-saga';
import { call, cancel, delay, fork, join, put, race, select, take } from 'redux-saga/effects';
import { GRBL_MACHINE_STATE, GRBL_STOP_FINISH_MAX_WAIT_MS } from '../grbl/grbl.constants';
import type { GrblController } from '../grbl/grbl.controller';
import type { GrblProgramResult } from '../grbl/interfaces/GrblProgramResult';
import type { MachineProfile } from '../profiles/interfaces/MachineProfile';
import type { GeometryPoint } from '../svg/geometry/interfaces/GeometryPoint';
import { GCODE_AIR_ASSIST_OFF } from '../toolpath/gcode.constants';
import type { Toolpath } from '../toolpath/interfaces/Toolpath';
import type { Action } from './action';
import { newRawErrorConsoleInfo } from './grbl.raw.error.console.info';
import type { JobFinishRaceResult } from './interfaces/JobFinishRaceResult';
import { JOB_RUN_KIND } from './job.run.kind.constants';
import { JobRunStarted, JobRunStatusChanged } from './job.run.state';
import { JOB_RUN_STATUS } from './job.run.status.constants';
import type { JobRunStatus } from './job.run.status.constants';
import { selectJobStartBlockedReasonKey } from './job.start.blocked.reason.selector';
import { getJobStartWorkPosition, returnToJobStartPosition } from './job.start.position.return.saga';
import { selectActiveMachineProfile } from './machine.profile.state';
import {
  MachineAirAssistChanged,
  MachineControllerResetDetected,
  MachineResetRequested,
  MachineStatusReceived,
  MachineStopFinished,
  MachineStopRequested,
} from './machine.status.state';
import { getProjectGcodeText } from './project.gcode.text.saga';
import { selectToolpath } from './toolpath.state';

const PROGRAM_LINE_BREAK_PATTERN = /\r?\n/;

const newJobRunStatusChanged = (status: JobRunStatus): JobRunStatusChanged => new JobRunStatusChanged({ status });

/** A job that ended early ended in a reset, which switches the air off; a finished one did if its program says so. */
const isAirAssistOffAfterJob = (endStatus: JobRunStatus, programLines: string[]): boolean =>
  endStatus === JOB_RUN_STATUS.INTERRUPTED || programLines.includes(GCODE_AIR_ASSIST_OFF);

function* getJobProgramLines(): Generator {
  const toolpath: Toolpath = (yield select(selectToolpath)) as Toolpath;
  const profile: MachineProfile = (yield select(selectActiveMachineProfile)) as MachineProfile;
  const programText: string = (yield call(getProjectGcodeText, toolpath, profile)) as string;

  return programText.split(PROGRAM_LINE_BREAK_PATTERN);
}

/** Resolves true at the next Idle report and false at an Alarm report. */
function* waitForMachineAfterProgram(): Generator {
  while (true) {
    const { payload }: MachineStatusReceived = (yield take(MachineStatusReceived.type)) as MachineStatusReceived;

    if (payload.status.machineState === GRBL_MACHINE_STATE.IDLE) {
      return true;
    }

    if (payload.status.machineState === GRBL_MACHINE_STATE.ALARM) {
      return false;
    }
  }
}

/**
 * A stop counts only once it has finished, so the locks stay on until the machine got its reset. The reset byte is
 * awaited without a time limit, so a stalled port would otherwise keep the locks on until the connection ends.
 */
export function* waitForJobInterruption(): Generator {
  const interruption: Action<unknown> = (yield take([
    MachineStopRequested.type,
    MachineResetRequested.type,
    MachineControllerResetDetected.type,
  ])) as Action<unknown>;

  if (interruption.type === MachineStopRequested.type) {
    yield race({
      stopFinished: take(MachineStopFinished.type),
      waitExpired: delay(GRBL_STOP_FINISH_MAX_WAIT_MS),
    });
  }

  return interruption;
}

/**
 * The last ok only says GRBL buffered the last line, so the laser may have far to go. A reset also leaves the machine
 * Idle, so a finished stop or a reset must not read as a finished job. That includes one from before this wait: the
 * last lines can still be answered while a stop waits for the machine to come to rest. A report during a stop that has
 * not finished can still win this race; getJobEndStatusAfterStop corrects that.
 */
function* waitForJobFinish(interruptionTask: Task): Generator {
  const { isMachineDone }: JobFinishRaceResult = (yield race({
    isMachineDone: call(waitForMachineAfterProgram),
    interruption: join(interruptionTask),
  })) as JobFinishRaceResult;

  return Boolean(isMachineDone);
}

/** Sends the program and follows it; resolves with the status the job ended in. */
export function* followJobProgram(
  controller: GrblController,
  programLines: string[],
  interruptionTask: Task,
): Generator {
  const { isCompleted }: GrblProgramResult = (yield call(
    [controller, controller.streamProgram],
    programLines,
    { isStopOnErrorEnabled: true },
  )) as GrblProgramResult;

  if (!isCompleted) {
    return JOB_RUN_STATUS.INTERRUPTED;
  }

  yield put(newJobRunStatusChanged(JOB_RUN_STATUS.FINISHING));

  const isFinished: boolean = (yield call(waitForJobFinish, interruptionTask)) as boolean;

  return isFinished ? JOB_RUN_STATUS.COMPLETED : JOB_RUN_STATUS.INTERRUPTED;
}

function* waitForJobStopRequest(): Generator {
  yield take(MachineStopRequested.type);
}

/**
 * The program can end before a stop has finished: the stop drops the program lines before it writes the reset, and an
 * Idle or Alarm report can arrive while it waits for the machine to come to rest. Whatever the program ended in, a
 * requested stop means an interrupted job, and the locks stay on until that stop has finished.
 */
function* getJobEndStatusAfterStop(
  programEndStatus: JobRunStatus,
  stopRequestTask: Task,
  interruptionTask: Task,
): Generator {
  if (stopRequestTask.isRunning()) {
    return programEndStatus;
  }

  yield join(interruptionTask);

  return JOB_RUN_STATUS.INTERRUPTED;
}

export function* runGrblJob(controller: GrblController): Generator {
  const blockedReasonKey: string | undefined = (yield select(selectJobStartBlockedReasonKey)) as string | undefined;

  if (blockedReasonKey) {
    return;
  }

  const startPosition: GeometryPoint | undefined = (yield call(getJobStartWorkPosition)) as GeometryPoint | undefined;
  const interruptionTask: Task = (yield fork(waitForJobInterruption)) as Task;
  const stopRequestTask: Task = (yield fork(waitForJobStopRequest)) as Task;

  yield put(new JobRunStarted({ startedAtMs: Date.now(), kind: JOB_RUN_KIND.JOB }));

  try {
    const programLines: string[] = (yield call(getJobProgramLines)) as string[];
    const programEndStatus: JobRunStatus =
      (yield call(followJobProgram, controller, programLines, interruptionTask)) as JobRunStatus;
    const endStatus: JobRunStatus =
      (yield call(getJobEndStatusAfterStop, programEndStatus, stopRequestTask, interruptionTask)) as JobRunStatus;

    yield put(newJobRunStatusChanged(endStatus));

    if (isAirAssistOffAfterJob(endStatus, programLines)) {
      yield put(new MachineAirAssistChanged({ isAirAssistOn: false }));
    }

    yield call(returnToJobStartPosition, controller, endStatus, startPosition);
  } catch (error: unknown) {
    yield put(newRawErrorConsoleInfo(error));
    yield put(newJobRunStatusChanged(JOB_RUN_STATUS.INTERRUPTED));
  } finally {
    yield cancel(stopRequestTask);
    yield cancel(interruptionTask);
  }
}
