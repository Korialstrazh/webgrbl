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

/** Description keys are named GRBL_ERROR_<code>, for example GRBL_ERROR_9. */
const ERROR_DESCRIPTION_KEY_PATTERN = /^GRBL_ERROR_(\d+)$/;

const newErrorDescriptionKeyByCode = (): ReadonlyMap<number, string> => {
  const keyByCode: Map<number, string> = new Map<number, string>();

  for (const [localisationKey, descriptionKey] of Object.entries(DEFAULT)) {
    const codeMatch: RegExpExecArray | null = ERROR_DESCRIPTION_KEY_PATTERN.exec(localisationKey);

    if (codeMatch) {
      keyByCode.set(Number(codeMatch[1]), descriptionKey);
    }
  }

  keyByCode.set(NON_ASCII_LINE_ERROR_CODE, DEFAULT.GRBL_ERROR_NON_ASCII_LINE);

  return keyByCode;
};

const ERROR_DESCRIPTION_KEY_BY_CODE: ReadonlyMap<number, string> = newErrorDescriptionKeyByCode();

export const getGrblErrorDescriptionKey = (code: number): string =>
  ERROR_DESCRIPTION_KEY_BY_CODE.get(code) ?? DEFAULT.GRBL_ERROR_UNKNOWN;
