/**
 * Runs a job on the connected laser: sends the same program as the G-code export and follows it to its end.
 *
 * @author michael.morosov
 *
 * @since 2026-11-03
 *
 * @copyright 2026 michael.morosov
 * Licensed under the Apache License, Version 2.0. See the LICENSE file.
 */
import type { Task } from 'redux-saga';
import { call, cancel, delay, fork, join, put, race, select, take } from 'redux-saga/effects';
import { GRBL_MACHINE_STATE, GRBL_STOP_FINISH_MAX_WAIT_MS } from '../grbl/grbl.constants';
import type { GrblController } from '../grbl/grbl.controller';
import type { GrblProgramResult } from '../grbl/interfaces/GrblProgramResult';
import type { ProjectLayer } from '../layers/interfaces/ProjectLayer';
import { MACHINE_COMMAND } from '../machine/machine.commands';
import type { MachineProfile } from '../profiles/interfaces/MachineProfile';
import type { GeometryPoint } from '../svg/geometry/interfaces/GeometryPoint';
import { GCODE_AIR_ASSIST_OFF } from '../toolpath/gcode.constants';
import type { GcodeLine } from '../toolpath/interfaces/GcodeLine';
import type { Toolpath } from '../toolpath/interfaces/Toolpath';
import type { ToolpathLayerRange } from '../toolpath/interfaces/ToolpathLayerRange';
import type { Action } from './action';
import { getAnsweredProgramLineCount } from './get.answered.program.line.count';
import { getLinePassesByLayerKey } from './get.line.passes.by.layer.key';
import { newRawErrorConsoleInfo } from './grbl.raw.error.console.info';
import type { JobFinishRaceResult } from './interfaces/JobFinishRaceResult';
import type { JobStartRequest } from './interfaces/JobStartRequest';
import type { JobResumeState } from './interfaces/JobResumeState';
import { selectJobResumeBlockedReasonKey } from './job.resume.blocked.reason.selector';
import { JobResumePointCleared, JobResumePointRecorded } from './job.resume.state';
import { JOB_RUN_KIND } from './job.run.kind.constants';
import {
  JobCutCheckLayersCaptured,
  JobRunStarted,
  JobRunStatusChanged,
  selectJobRunAnsweredLineCount,
} from './job.run.state';
import type { JobStartRequested } from './job.run.state';
import { JOB_RUN_STATUS } from './job.run.status.constants';
import type { JobRunStatus } from './job.run.status.constants';
import { getJobRunToolpath } from './job.run.toolpath.saga';
import { selectJobStartBlockedReasonKey } from './job.start.blocked.reason.selector';
import { JOB_START_REQUEST_KIND } from './job.start.request.constants';
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
import { selectEnabledProjectLayers } from './project.document.state';
import { getProjectGcodeLines } from './project.gcode.lines.saga';
import { selectToolpathDocumentVersion } from './toolpath.state';

const newJobRunStatusChanged = (status: JobRunStatus): JobRunStatusChanged => new JobRunStatusChanged({ status });

/** A job that ended early ended in a reset, which switches the air off; a finished one did if its program says so. */
const isAirAssistOffAfterJob = (endStatus: JobRunStatus, programLines: string[]): boolean =>
  endStatus === JOB_RUN_STATUS.INTERRUPTED || programLines.includes(GCODE_AIR_ASSIST_OFF);

/** The line layers a toolpath burns, in its burn order. */
function* getToolpathLineLayerKeys(toolpath: Toolpath): Generator {
  const enabledLayers: ProjectLayer[] = (yield select(selectEnabledProjectLayers)) as ProjectLayer[];
  const passesByLayerKey: Record<string, number> = getLinePassesByLayerKey(enabledLayers);

  return toolpath.layers
    .map(({ layerKey }: ToolpathLayerRange): string => layerKey)
    .filter((layerKey: string): boolean => layerKey in passesByLayerKey);
}

function* getJobProgramLines(toolpath: Toolpath): Generator {
  const profile: MachineProfile = (yield select(selectActiveMachineProfile)) as MachineProfile;

  return (yield call(getProjectGcodeLines, toolpath, profile)) as GcodeLine[];
}

/** Keeps what a resume needs: the lines that streamed, how far the laser answered, and the toolpath they came from. */
function* recordJobResumePoint(lines: GcodeLine[], toolpath: Toolpath, toolpathDocumentVersion: number): Generator {
  const profile: MachineProfile = (yield select(selectActiveMachineProfile)) as MachineProfile;
  const answeredSentLineCount: number = (yield select(selectJobRunAnsweredLineCount)) as number;
  const resume: JobResumeState = {
    lines,
    answeredLineCount: getAnsweredProgramLineCount(lines, answeredSentLineCount),
    toolpathDocumentVersion,
    profileId: profile.id,
    toolpath,
  };

  yield put(new JobResumePointRecorded(resume));
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

/**
 * Homes a machine with homing switches before a resume, so the head finds the work zero again; a machine without them
 * stays where it is. Resolves false when homing failed or the run was interrupted, true once the machine is Idle.
 */
function* homeMachineBeforeResume(controller: GrblController, interruptionTask: Task): Generator {
  const profile: MachineProfile = (yield select(selectActiveMachineProfile)) as MachineProfile;

  if (!profile.hasHomingSwitches) {
    return true;
  }

  const { isCompleted }: GrblProgramResult = (yield call(
    [controller, controller.streamProgram],
    [MACHINE_COMMAND.HOME],
    { isStopOnErrorEnabled: true },
  )) as GrblProgramResult;

  if (!isCompleted) {
    return false;
  }

  return (yield call(waitForJobFinish, interruptionTask)) as boolean;
}

/** The start blockers of a request: a resume also needs a resume point that still matches the project and profile. */
const getJobStartBlockedReasonSelector = (request: JobStartRequest): typeof selectJobStartBlockedReasonKey =>
  request.kind === JOB_START_REQUEST_KIND.RESUME ? selectJobResumeBlockedReasonKey : selectJobStartBlockedReasonKey;

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

export function* runGrblJob(controller: GrblController, action: JobStartRequested): Generator {
  const isResume: boolean = action.payload.kind === JOB_START_REQUEST_KIND.RESUME;
  const blockedReasonKey: string | undefined =
    (yield select(getJobStartBlockedReasonSelector(action.payload))) as string | undefined;

  if (blockedReasonKey) {
    return;
  }

  const runToolpath: Toolpath | undefined = (yield call(getJobRunToolpath, action.payload)) as Toolpath | undefined;

  if (!runToolpath) {
    return;
  }

  // Taken before the run, so the cut check lists what was burned even if the layers change on the way.
  const cutCheckLayerKeys: string[] = (yield call(getToolpathLineLayerKeys, runToolpath)) as string[];

  const startPosition: GeometryPoint | undefined = (yield call(getJobStartWorkPosition)) as GeometryPoint | undefined;
  const interruptionTask: Task = (yield fork(waitForJobInterruption)) as Task;
  const stopRequestTask: Task = (yield fork(waitForJobStopRequest)) as Task;

  const toolpathDocumentVersion: number = (yield select(selectToolpathDocumentVersion)) as number;
  let streamedLines: GcodeLine[] | undefined;
  let isResumePointSettled = false;

  // A resume keeps its point until its own program streams, so a failed homing can be resumed again.
  if (!isResume) {
    yield put(new JobResumePointCleared());
  }

  yield put(new JobRunStarted({ startedAtMs: Date.now(), kind: JOB_RUN_KIND.JOB }));

  try {
    const isHomed: boolean = isResume
      ? (yield call(homeMachineBeforeResume, controller, interruptionTask)) as boolean
      : true;

    if (!isHomed) {
      const homingEndStatus: JobRunStatus = (yield call(
        getJobEndStatusAfterStop,
        JOB_RUN_STATUS.INTERRUPTED,
        stopRequestTask,
        interruptionTask,
      )) as JobRunStatus;

      yield put(newJobRunStatusChanged(homingEndStatus));

      return;
    }

    const gcodeLines: GcodeLine[] = (yield call(getJobProgramLines, runToolpath)) as GcodeLine[];
    const programLines: string[] = gcodeLines.map(({ text }: GcodeLine): string => text);

    streamedLines = gcodeLines;

    const programEndStatus: JobRunStatus =
      (yield call(followJobProgram, controller, programLines, interruptionTask)) as JobRunStatus;
    const endStatus: JobRunStatus =
      (yield call(getJobEndStatusAfterStop, programEndStatus, stopRequestTask, interruptionTask)) as JobRunStatus;

    // Recorded before the status flips, so the card has the stop point the moment it shows the stop.
    if (endStatus === JOB_RUN_STATUS.INTERRUPTED) {
      yield call(recordJobResumePoint, gcodeLines, runToolpath, toolpathDocumentVersion);
    }

    isResumePointSettled = true;
    yield put(newJobRunStatusChanged(endStatus));

    if (endStatus === JOB_RUN_STATUS.COMPLETED) {
      yield put(new JobResumePointCleared());
      yield put(new JobCutCheckLayersCaptured({ layerKeys: cutCheckLayerKeys }));
    }

    if (isAirAssistOffAfterJob(endStatus, programLines)) {
      yield put(new MachineAirAssistChanged({ isAirAssistOn: false }));
    }

    yield call(returnToJobStartPosition, controller, endStatus, startPosition);
  } catch (error: unknown) {
    yield put(newRawErrorConsoleInfo(error));

    if (streamedLines && !isResumePointSettled) {
      isResumePointSettled = true;

      try {
        yield call(recordJobResumePoint, streamedLines, runToolpath, toolpathDocumentVersion);
      } catch (recordError: unknown) {
        // The card must not stay running because its resume point failed to record.
        yield put(newRawErrorConsoleInfo(recordError));
      }
    }

    yield put(newJobRunStatusChanged(JOB_RUN_STATUS.INTERRUPTED));
  } finally {
    // A lost connection cancels this saga before it ends the run, and a resume after it is the main use.
    if (streamedLines && !isResumePointSettled) {
      yield call(recordJobResumePoint, streamedLines, runToolpath, toolpathDocumentVersion);
    }

    yield cancel(stopRequestTask);
    yield cancel(interruptionTask);
  }
}
