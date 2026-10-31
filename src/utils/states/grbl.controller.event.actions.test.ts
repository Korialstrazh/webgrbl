import { describe, expect, it } from 'vitest';
import { GRBL_CONTROLLER_EVENT_KIND } from '../grbl/grbl.constants';
import { DEFAULT } from '../localization/default.locales';
import { getGrblControllerEventActions } from './grbl.controller.event.actions';
import { NO_TOAST_PARAMETERS, TOAST_SEVERITY } from './toast.constants';
import { ToastShown } from './toast.state';

const STOPPED_LINE_NUMBER = 5;
const STOPPED_LINE_TEXT = 'G38.2Z-1';
const UNSUPPORTED_COMMAND_ERROR_CODE = 20;

describe(getGrblControllerEventActions.name, () => {
  it('a stop on error shows an error toast with line, code and the description key of the code', () => {
    expect(getGrblControllerEventActions({
      kind: GRBL_CONTROLLER_EVENT_KIND.PROGRAM_STOPPED_ON_ERROR,
      lineNumber: STOPPED_LINE_NUMBER,
      lineText: STOPPED_LINE_TEXT,
      errorCode: UNSUPPORTED_COMMAND_ERROR_CODE,
    })).toEqual([new ToastShown({
      severity: TOAST_SEVERITY.ERROR,
      messageKey: DEFAULT.TOAST_PROGRAM_STOPPED_ON_ERROR,
      messageParameters: {
        lineNumber: STOPPED_LINE_NUMBER,
        code: UNSUPPORTED_COMMAND_ERROR_CODE,
        description: DEFAULT.GRBL_ERROR_20,
      },
    })]);
  });

  it('a controller reset shows the controller-reset warning toast', () => {
    expect(getGrblControllerEventActions({ kind: GRBL_CONTROLLER_EVENT_KIND.CONTROLLER_RESET })).toEqual([
      new ToastShown({
        severity: TOAST_SEVERITY.WARNING,
        messageKey: DEFAULT.TOAST_CONTROLLER_RESET,
        messageParameters: NO_TOAST_PARAMETERS,
      }),
    ]);
  });
});
