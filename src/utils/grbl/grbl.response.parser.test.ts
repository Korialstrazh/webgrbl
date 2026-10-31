import { describe, expect, it } from 'vitest';
import { GRBL_MACHINE_STATE, GRBL_RESPONSE_KIND } from './grbl.constants';
import { getParsedGrblResponse } from './grbl.response.parser';

const BANNER_LINE = "Grbl 1.1h ['$' for help]";
const STATUS_LINE = '<Idle|MPos:1.000,2.000,3.000|FS:0,0>';
const MESSAGE_LINE = '[MSG:Caution: Unlocked]';
const ACMER_S2_BOARD_NAME_LINE = '[MSG:board name:ACMER S2 V1.0]';
const ACMER_S2_MACHINE_LINE = '[MSG:mechine:ACMER_S2]';
const ACMER_S2_BLUETOOTH_LINE = '[BT_VER:]';
const UNKNOWN_LINE = 'something odd';
const ERROR_CODE = 20;
const ALARM_CODE = 3;
const SETTING_NUMBER = 32;

describe(getParsedGrblResponse.name, () => {
  it('parses ok', () => {
    expect(getParsedGrblResponse('ok')).toEqual({ kind: GRBL_RESPONSE_KIND.OK });
  });

  it('parses an error code', () => {
    expect(getParsedGrblResponse(`error:${ERROR_CODE}`)).toEqual({ kind: GRBL_RESPONSE_KIND.ERROR, code: ERROR_CODE });
  });

  it('parses an alarm code', () => {
    expect(getParsedGrblResponse(`ALARM:${ALARM_CODE}`)).toEqual({ kind: GRBL_RESPONSE_KIND.ALARM, code: ALARM_CODE });
  });

  it('parses a setting line', () => {
    expect(getParsedGrblResponse(`$${SETTING_NUMBER}=1`)).toEqual({
      kind: GRBL_RESPONSE_KIND.SETTING,
      settingNumber: SETTING_NUMBER,
      value: '1',
    });
  });

  it('parses a bracketed line as feedback', () => {
    expect(getParsedGrblResponse(MESSAGE_LINE)).toEqual({ kind: GRBL_RESPONSE_KIND.FEEDBACK, text: MESSAGE_LINE });
  });

  it.each([ACMER_S2_BOARD_NAME_LINE, ACMER_S2_MACHINE_LINE, ACMER_S2_BLUETOOTH_LINE])(
    'classifies the line recorded from a real ACMER S2 as feedback: %s',
    (line) => {
      expect(getParsedGrblResponse(line)).toEqual({ kind: GRBL_RESPONSE_KIND.FEEDBACK, text: line });
    },
  );

  it('parses the welcome banner', () => {
    expect(getParsedGrblResponse(BANNER_LINE)).toMatchObject({
      kind: GRBL_RESPONSE_KIND.BANNER,
      identity: { firmwareName: 'Grbl', version: '1.1h' },
    });
  });

  it('parses a status report', () => {
    expect(getParsedGrblResponse(STATUS_LINE)).toMatchObject({
      kind: GRBL_RESPONSE_KIND.STATUS,
      report: { machineState: GRBL_MACHINE_STATE.IDLE },
    });
  });

  it('keeps an unknown line as other', () => {
    expect(getParsedGrblResponse(UNKNOWN_LINE)).toEqual({ kind: GRBL_RESPONSE_KIND.OTHER, text: UNKNOWN_LINE });
  });
});
