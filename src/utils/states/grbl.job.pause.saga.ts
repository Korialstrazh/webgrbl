/**
 * Pauses and resumes the running job, only when the pause control offers that.
 *
 * @author michael.morosov
 *
 * @since 2026-11-04
 *
 * @copyright 2026 michael.morosov
 * Licensed under the Apache License, Version 2.0. See the LICENSE file.
 */
import { call, put, select } from 'redux-saga/effects';
import type { GrblController } from '../grbl/grbl.controller';
import { newRawErrorConsoleInfo } from './grbl.raw.error.console.info';
import { JOB_PAUSE_CONTROL } from './job.pause.control.constants';
import type { JobPauseControl } from './job.pause.control.constants';
import { selectJobPauseControl } from './job.pause.control.selector';
import { JobPauseRequested } from './job.run.state';
import type { JobResumeRequested } from './job.run.state';

export function* runGrblJobPauseCommand(
  controller: GrblController,
  action: JobPauseRequested | JobResumeRequested,
): Generator {
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
