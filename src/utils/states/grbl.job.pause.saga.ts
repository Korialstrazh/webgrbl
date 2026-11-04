/**
 * Pauses and resumes the running job, only when the pause control offers that.
 *
 * @author michael.morosov
 *
 * @since 2026-11-04
 *
 * @copyright michael.morosov - All rights reserved.
 * You may not use, distribute or modify this code without explicit permission by michael.morosov.
 */
import { call, put, select } from 'redux-saga/effects';
import type { GrblController } from '../grbl/grbl.controller';
import type { Action } from './action';
import { newRawErrorConsoleInfo } from './grbl.raw.error.console.info';
import { JOB_PAUSE_CONTROL } from './job.pause.control.constants';
import type { JobPauseControl } from './job.pause.control.constants';
import { selectJobPauseControl } from './job.pause.control.selector';
import { JobPauseRequested } from './job.run.state';

export function* runGrblJobPauseCommand(controller: GrblController, action: Action<unknown>): Generator {
  const pauseControl: JobPauseControl = (yield select(selectJobPauseControl)) as JobPauseControl;
  const isPauseRequest: boolean = action.type === JobPauseRequested.type;
  const allowedControl: JobPauseControl = isPauseRequest ? JOB_PAUSE_CONTROL.PAUSE : JOB_PAUSE_CONTROL.RESUME;

  if (pauseControl !== allowedControl) {
    return;
  }

  try {
    yield call(
      isPauseRequest ? [controller, controller.sendFeedHold] : [controller, controller.sendCycleResume],
    );
  } catch (error: unknown) {
    yield put(newRawErrorConsoleInfo(error));
  }
}
