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
import { call, cancel, fork, join, put, race, select, take } from 'redux-saga/effects';
import { GRBL_MACHINE_STATE } from '../grbl/grbl.constants';
import type { GrblController } from '../grbl/grbl.controller';
import type { GrblProgramResult } from '../grbl/interfaces/GrblProgramResult';
import type { MachineProfile } from '../profiles/interfaces/MachineProfile';
import { GCODE_AIR_ASSIST_OFF } from '../toolpath/gcode.constants';
import type { Toolpath } from '../toolpath/interfaces/Toolpath';
import type { Action } from './action';
import { newRawErrorConsoleInfo } from './grbl.raw.error.console.info';
import type { JobFinishRaceResult } from './interfaces/JobFinishRaceResult';
import { JobRunStatusChanged } from './job.run.state';
import { JOB_RUN_STATUS } from './job.run.status.constants';
import type { JobRunStatus } from './job.run.status.constants';
import { selectJobStartBlockedReasonKey } from './job.start.blocked.reason.selector';
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

/** A stop counts only once it has finished, so the locks stay on until the machine got its reset. */
function* waitForJobInterruption(): Generator {
  const interruption: Action<unknown> = (yield take([
    MachineStopRequested.type,
    MachineResetRequested.type,
    MachineControllerResetDetected.type,
  ])) as Action<unknown>;

  if (interruption.type === MachineStopRequested.type) {
    yield take(MachineStopFinished.type);
  }

  return interruption;
}

/**
 * The last ok only says GRBL buffered the last line, so the laser may have far to go. A reset also leaves the machine
 * Idle, so a stop or reset meanwhile must not read as a finished job. That includes one from before this wait: the last
 * lines can still be answered while a stop waits for the machine to come to rest.
 */
function* waitForJobFinish(interruptionTask: Task): Generator {
  const { isMachineDone }: JobFinishRaceResult = (yield race({
    isMachineDone: call(waitForMachineAfterProgram),
    interruption: join(interruptionTask),
  })) as JobFinishRaceResult;

  return Boolean(isMachineDone);
}

/** Sends the program and follows it; resolves with the status the job ended in. */
function* followJobProgram(controller: GrblController, programLines: string[], interruptionTask: Task): Generator {
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

export function* runGrblJob(controller: GrblController): Generator {
  const blockedReasonKey: string | undefined = (yield select(selectJobStartBlockedReasonKey)) as string | undefined;

  if (blockedReasonKey) {
    return;
  }

  const interruptionTask: Task = (yield fork(waitForJobInterruption)) as Task;

  yield put(newJobRunStatusChanged(JOB_RUN_STATUS.SENDING));

  try {
    const programLines: string[] = (yield call(getJobProgramLines)) as string[];
    const endStatus: JobRunStatus =
      (yield call(followJobProgram, controller, programLines, interruptionTask)) as JobRunStatus;

    yield put(newJobRunStatusChanged(endStatus));

    if (isAirAssistOffAfterJob(endStatus, programLines)) {
      yield put(new MachineAirAssistChanged({ isAirAssistOn: false }));
    }
  } catch (error: unknown) {
    yield put(newRawErrorConsoleInfo(error));
    yield put(newJobRunStatusChanged(JOB_RUN_STATUS.INTERRUPTED));
  } finally {
    yield cancel(interruptionTask);
  }
}
