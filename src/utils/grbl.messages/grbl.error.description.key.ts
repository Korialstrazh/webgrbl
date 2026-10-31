/**
 * Looks up the localisation key of the plain-language description of a GRBL error code, or of the client-side code of a
 * line the app refused to send.
 *
 * @author michael.morosov
 *
 * @since 2026-10-30
 *
 * @copyright michael.morosov - All rights reserved.
 * You may not use, distribute or modify this code without explicit permission by michael.morosov.
 */
import { NON_ASCII_LINE_ERROR_CODE } from '../grbl/grbl.constants';
import { DEFAULT } from '../localization/default.locales';

const FIRST_KNOWN_ERROR_CODE = 1;
const LAST_KNOWN_ERROR_CODE = 38;

const buildErrorDescriptionKeyByCode = (): ReadonlyMap<number, string> => {
  const keyByCode = new Map<number, string>();

  for (let code = FIRST_KNOWN_ERROR_CODE; code <= LAST_KNOWN_ERROR_CODE; code += 1) {
    keyByCode.set(code, DEFAULT[`GRBL_ERROR_${code}` as keyof typeof DEFAULT]);
  }

  keyByCode.set(NON_ASCII_LINE_ERROR_CODE, DEFAULT.GRBL_ERROR_NON_ASCII_LINE);

  return keyByCode;
};

const ERROR_DESCRIPTION_KEY_BY_CODE: ReadonlyMap<number, string> = buildErrorDescriptionKeyByCode();

export const getGrblErrorDescriptionKey = (code: number): string =>
  ERROR_DESCRIPTION_KEY_BY_CODE.get(code) ?? DEFAULT.GRBL_ERROR_UNKNOWN;
