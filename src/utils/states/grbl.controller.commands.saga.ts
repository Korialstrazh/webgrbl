/**
 * Turns the requests of the console, the machine controls and the job card into calls on the connected controller.
 *
 * @author michael.morosov
 *
 * @since 2026-11-04
 *
 * @copyright michael.morosov - All rights reserved.
 * You may not use, distribute or modify this code without explicit permission by michael.morosov.
 */
import { all, call, put, takeEvery, takeLeading } from 'redux-saga/effects';
import type { GrblController } from '../grbl/grbl.controller';
import { runGrblFrame } from './frame.run.saga';
import { submitGrblConsoleCommand } from './grbl.console.command.saga';
import { ConsoleCommandSubmitted } from './grbl.console.state';
import { runGrblJobPauseCommand } from './grbl.job.pause.saga';
import { submitGrblMachineLine } from './grbl.machine.line.saga';
import { runGrblMachineStop } from './grbl.machine.stop.saga';
import { newRawErrorConsoleInfo } from './grbl.raw.error.console.info';
import { runGrblJob } from './job.run.saga';
import { FrameStartRequested, JobPauseRequested, JobResumeRequested, JobStartRequested } from './job.run.state';
import {
  MachineLineRequested,
  MachineResetRequested,
  MachineStopRequested,
  MachineUnlockRequested,
} from './machine.status.state';

function* runGrblMachineCommand(machineCommand: () => Promise<void> | void): Generator {
  try {
    yield call(machineCommand);
  } catch (error: unknown) {
    yield put(newRawErrorConsoleInfo(error));
  }
}

export function* handleGrblControllerCommands(controller: GrblController): Generator {
  yield all([
    takeEvery(ConsoleCommandSubmitted.type, submitGrblConsoleCommand, controller),
    takeLeading(JobStartRequested.type, runGrblJob, controller),
    takeLeading(FrameStartRequested.type, runGrblFrame, controller),
    takeEvery([JobPauseRequested.type, JobResumeRequested.type], runGrblJobPauseCommand, controller),
    takeEvery(MachineStopRequested.type, runGrblMachineStop, controller),
    takeEvery(MachineResetRequested.type, runGrblMachineCommand, (): Promise<void> => controller.resetMachine()),
    takeEvery(MachineUnlockRequested.type, runGrblMachineCommand, (): void => controller.unlockMachine()),
    takeEvery(MachineLineRequested.type, submitGrblMachineLine, controller),
  ]);
}
