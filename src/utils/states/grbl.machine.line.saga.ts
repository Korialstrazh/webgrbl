/**
 * Sends one line from the machine controls to the controller. Such a line is dropped during a job, as it would change
 * what the laser burns.
 *
 * @author michael.morosov
 *
 * @since 2026-11-03
 *
 * @copyright 2026 michael.morosov
 * Licensed under the Apache License, Version 2.0. See the LICENSE file.
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
