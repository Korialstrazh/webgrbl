/**
 * Sends one line from the machine controls to the controller. Such a line is dropped during a job, as it would change
 * what the laser burns.
 *
 * @author michael.morosov
 *
 * @since 2026-11-03
 *
 * @copyright michael.morosov - All rights reserved.
 * You may not use, distribute or modify this code without explicit permission by michael.morosov.
 */
import { call, put, select } from 'redux-saga/effects';
import type { GrblController } from '../grbl/grbl.controller';
import { newRawErrorConsoleInfo } from './grbl.raw.error.console.info';
import { selectIsJobRunActive } from './job.run.state';
import type { MachineLineRequested } from './machine.status.state';

export function* submitGrblMachineLine(controller: GrblController, action: MachineLineRequested): Generator {
  if ((yield select(selectIsJobRunActive)) as boolean) {
    return;
  }

  try {
    yield call([controller, controller.sendConsoleCommand], action.payload.line);
  } catch (error: unknown) {
    yield put(newRawErrorConsoleInfo(error));
  }
}
