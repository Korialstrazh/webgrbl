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
import { call, put, race, select, take } from 'redux-saga/effects';
import { GRBL_MACHINE_STATE } from '../grbl/grbl.constants';
import type { GrblController } from '../grbl/grbl.controller';
import type { GrblProgramResult } from '../grbl/interfaces/GrblProgramResult';
import type { MachineProfile } from '../profiles/interfaces/MachineProfile';
import { getGcodeExportContext } from '../toolpath/get.gcode.export.context';
import { getGcodeText } from '../toolpath/get.gcode.text';
import type { Toolpath } from '../toolpath/interfaces/Toolpath';
import { selectGrblSettings } from './grbl.connection.state';
import { newRawErrorConsoleInfo } from './grbl.raw.error.console.info';
import type { JobFinishRaceResult } from './interfaces/JobFinishRaceResult';
import { JobRunStatusChanged } from './job.run.state';
import { JOB_RUN_STATUS } from './job.run.status.constants';
import type { JobRunStatus } from './job.run.status.constants';
import { selectJobStartBlockedReasonKey } from './job.start.blocked.reason.selector';
import { selectActiveMachineProfile } from './machine.profile.state';
import {
  MachineControllerResetDetected,
  MachineResetRequested,
  MachineStatusReceived,
  MachineStopRequested,
} from './machine.status.state';
import { selectProjectName } from './project.state';
import { selectToolpath } from './toolpath.state';

const PROGRAM_LINE_BREAK_PATTERN = /\r?\n/;

const newJobRunStatusChanged = (status: JobRunStatus): JobRunStatusChanged => new JobRunStatusChanged({ status });

function* getJobProgramLines(): Generator {
  const toolpath: Toolpath = (yield select(selectToolpath)) as Toolpath;
  const profile: MachineProfile = (yield select(selectActiveMachineProfile)) as MachineProfile;
  const laserSettings: Record<number, string> = (yield select(selectGrblSettings)) as Record<number, string>;
  const projectName: string = (yield select(selectProjectName)) as string;
  const createdAtIso: string = new Date().toISOString();
  const programText: string = getGcodeText(
    toolpath,
    getGcodeExportContext({ profile, laserSettings, projectName, createdAtIso }),
  );

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
 * The last ok only says GRBL buffered the last line, so the laser may have far to go. A reset also leaves the machine
 * Idle, so a stop or reset meanwhile must not read as a finished job.
 */
function* waitForJobFinish(): Generator {
  const { isMachineDone }: JobFinishRaceResult = (yield race({
    isMachineDone: call(waitForMachineAfterProgram),
    interruption: take([MachineStopRequested.type, MachineResetRequested.type, MachineControllerResetDetected.type]),
  })) as JobFinishRaceResult;

  return Boolean(isMachineDone);
}

export function* runGrblJob(controller: GrblController): Generator {
  const blockedReasonKey: string | undefined = (yield select(selectJobStartBlockedReasonKey)) as string | undefined;

  if (blockedReasonKey) {
    return;
  }

  const programLines: string[] = (yield call(getJobProgramLines)) as string[];

  yield put(newJobRunStatusChanged(JOB_RUN_STATUS.SENDING));

  try {
    const { isCompleted }: GrblProgramResult = (yield call(
      [controller, controller.streamProgram],
      programLines,
      { isStopOnErrorEnabled: true },
    )) as GrblProgramResult;

    if (!isCompleted) {
      yield put(newJobRunStatusChanged(JOB_RUN_STATUS.INTERRUPTED));

      return;
    }

    yield put(newJobRunStatusChanged(JOB_RUN_STATUS.FINISHING));

    const isFinished: boolean = (yield call(waitForJobFinish)) as boolean;

    yield put(newJobRunStatusChanged(isFinished ? JOB_RUN_STATUS.COMPLETED : JOB_RUN_STATUS.INTERRUPTED));
  } catch (error: unknown) {
    yield put(newRawErrorConsoleInfo(error));
    yield put(newJobRunStatusChanged(JOB_RUN_STATUS.INTERRUPTED));
  }
}
