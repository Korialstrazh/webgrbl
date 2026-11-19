/**
 * Runs the stop sequence and tells the store when it ended, so a job keeps its locks until then.
 *
 * @author michael.morosov
 *
 * @since 2026-11-04
 *
 * @copyright 2026 michael.morosov
 * Licensed under the Apache License, Version 2.0. See the LICENSE file.
 */
import { call, put } from 'redux-saga/effects';
import type { GrblController } from '../grbl/grbl.controller';
import { newRawErrorConsoleInfo } from './grbl.raw.error.console.info';
import { MachineStopFinished } from './machine.status.state';

export function* runGrblMachineStop(controller: GrblController): Generator {
  try {
    yield call([controller, controller.stopMachine]);
  } catch (error: unknown) {
    yield put(newRawErrorConsoleInfo(error));
  } finally {
    yield put(new MachineStopFinished());
  }
}
