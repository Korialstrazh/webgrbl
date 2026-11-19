/**
 * Turns one GRBL controller event into the store actions it causes: console entries, status reports, the lost
 * connection status, and toasts with fixed keys and parameters only.
 *
 * @author michael.morosov
 *
 * @since 2026-10-30
 *
 * @copyright 2026 michael.morosov
 * Licensed under the Apache License, Version 2.0. See the LICENSE file.
 */
import { getGrblAlarmDescriptionKey } from '../grbl.messages/grbl.alarm.description.key';
import { getGrblErrorDescriptionKey } from '../grbl.messages/grbl.error.description.key';
import { GRBL_CONNECTION_STATUS, GRBL_CONTROLLER_EVENT_KIND } from '../grbl/grbl.constants';
import type { GrblControllerEvent } from '../grbl/interfaces/GrblControllerEvent';
import { DEFAULT } from '../localization/default.locales';
import type { Action } from './action';
import { ConnectionStatusChanged } from './grbl.connection.state';
import { ConsoleEntryReceived } from './grbl.console.state';
import { JobRunProgressChanged } from './job.run.state';
import { MachineAlarmReported, MachineControllerResetDetected, MachineStatusReceived } from './machine.status.state';
import { NO_TOAST_PARAMETERS, TOAST_SEVERITY } from './toast.constants';
import { ToastShown } from './toast.state';

export const getGrblControllerEventActions = (event: GrblControllerEvent): Action<unknown>[] => {
  switch (event.kind) {
  case GRBL_CONTROLLER_EVENT_KIND.CONSOLE_ENTRY:
    return [new ConsoleEntryReceived({ entry: event.entry })];
  case GRBL_CONTROLLER_EVENT_KIND.STATUS_REPORT:
    return [new MachineStatusReceived({ status: event.status })];
  case GRBL_CONTROLLER_EVENT_KIND.GRBL_ERROR:
    return [new ToastShown({
      severity: TOAST_SEVERITY.ERROR,
      messageKey: DEFAULT.TOAST_GRBL_ERROR,
      messageParameters: { code: event.code, description: getGrblErrorDescriptionKey(event.code) },
    })];
  case GRBL_CONTROLLER_EVENT_KIND.GRBL_ALARM:
    return [
      new MachineAlarmReported(),
      new ToastShown({
        severity: TOAST_SEVERITY.ERROR,
        messageKey: DEFAULT.TOAST_GRBL_ALARM,
        messageParameters: { code: event.code, description: getGrblAlarmDescriptionKey(event.code) },
      }),
    ];
  case GRBL_CONTROLLER_EVENT_KIND.CONNECTION_LOST:
    return [
      new ConnectionStatusChanged({ connectionStatus: GRBL_CONNECTION_STATUS.LOST }),
      new ToastShown({
        severity: TOAST_SEVERITY.ERROR,
        messageKey: DEFAULT.TOAST_CONNECTION_LOST,
        messageParameters: NO_TOAST_PARAMETERS,
      }),
    ];
  case GRBL_CONTROLLER_EVENT_KIND.NOT_RESPONDING:
    return [new ToastShown({
      severity: TOAST_SEVERITY.WARNING,
      messageKey: DEFAULT.TOAST_NOT_RESPONDING,
      messageParameters: NO_TOAST_PARAMETERS,
    })];
  case GRBL_CONTROLLER_EVENT_KIND.PROGRAM_STOPPED_ON_ERROR:
    return [new ToastShown({
      severity: TOAST_SEVERITY.ERROR,
      messageKey: DEFAULT.TOAST_PROGRAM_STOPPED_ON_ERROR,
      messageParameters: {
        lineNumber: event.lineNumber,
        code: event.errorCode,
        description: getGrblErrorDescriptionKey(event.errorCode),
      },
    })];
  case GRBL_CONTROLLER_EVENT_KIND.CONTROLLER_RESET:
    return [
      new MachineControllerResetDetected(),
      new ToastShown({
        severity: TOAST_SEVERITY.WARNING,
        messageKey: DEFAULT.TOAST_CONTROLLER_RESET,
        messageParameters: NO_TOAST_PARAMETERS,
      }),
    ];
  case GRBL_CONTROLLER_EVENT_KIND.PROGRAM_PROGRESS:
    return [new JobRunProgressChanged({
      answeredLineCount: event.answeredLineCount,
      totalLineCount: event.totalLineCount,
    })];
  default: {
    const unknownEvent: never = event;
    throw new Error(`Unknown GRBL controller event ${JSON.stringify(unknownEvent)}`);
  }
  }
};
