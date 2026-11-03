/**
 * Sends one console command the user submitted to the controller. A line GRBL could not receive safely (a character
 * outside printable ASCII) is refused with a fixed console message; any other failure shows its raw text.
 *
 * @author michael.morosov
 *
 * @since 2026-10-30
 *
 * @copyright michael.morosov - All rights reserved.
 * You may not use, distribute or modify this code without explicit permission by michael.morosov.
 */
import { call, put, select } from 'redux-saga/effects';
import type { GrblController } from '../grbl/grbl.controller';
import { GrblNonAsciiLineError } from '../grbl/grbl.non.ascii.line.error';
import { DEFAULT } from '../localization/default.locales';
import { ConsoleInfoAdded } from './grbl.console.state';
import type { ConsoleCommandSubmitted } from './grbl.console.state';
import { newRawErrorConsoleInfo } from './grbl.raw.error.console.info';
import { selectIsJobRunActive } from './job.run.state';

const newNonAsciiRejectedConsoleInfo = (): ConsoleInfoAdded => new ConsoleInfoAdded({
  messageKey: DEFAULT.CONSOLE_NON_ASCII_REJECTED,
  isError: true,
  timestamp: Date.now(),
});

export function* submitGrblConsoleCommand(controller: GrblController, action: ConsoleCommandSubmitted): Generator {
  // A line mixed into a running job would change what the laser burns.
  if ((yield select(selectIsJobRunActive)) as boolean) {
    yield put(new ConsoleInfoAdded({ messageKey: DEFAULT.CONSOLE_JOB_RUNNING, isError: true, timestamp: Date.now() }));

    return;
  }

  try {
    yield call([controller, controller.sendConsoleCommand], action.payload.commandText);
  } catch (error: unknown) {
    const consoleInfo: ConsoleInfoAdded =
      error instanceof GrblNonAsciiLineError ? newNonAsciiRejectedConsoleInfo() : newRawErrorConsoleInfo(error);

    yield put(consoleInfo);
  }
}
