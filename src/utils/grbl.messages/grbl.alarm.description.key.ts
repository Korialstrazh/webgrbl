/**
 * Looks up the localisation key of the plain-language description of a GRBL alarm code.
 *
 * @author michael.morosov
 *
 * @since 2026-10-30
 *
 * @copyright michael.morosov - All rights reserved.
 * You may not use, distribute or modify this code without explicit permission by michael.morosov.
 */
import { DEFAULT } from '../localization/default.locales';

const FIRST_KNOWN_ALARM_CODE = 1;
const LAST_KNOWN_ALARM_CODE = 10;

const buildAlarmDescriptionKeyByCode = (): ReadonlyMap<number, string> => {
  const keyByCode = new Map<number, string>();

  for (let code = FIRST_KNOWN_ALARM_CODE; code <= LAST_KNOWN_ALARM_CODE; code += 1) {
    keyByCode.set(code, DEFAULT[`GRBL_ALARM_${code}` as keyof typeof DEFAULT]);
  }

  return keyByCode;
};

const ALARM_DESCRIPTION_KEY_BY_CODE: ReadonlyMap<number, string> = buildAlarmDescriptionKeyByCode();

export const getGrblAlarmDescriptionKey = (code: number): string =>
  ALARM_DESCRIPTION_KEY_BY_CODE.get(code) ?? DEFAULT.GRBL_ALARM_UNKNOWN;
