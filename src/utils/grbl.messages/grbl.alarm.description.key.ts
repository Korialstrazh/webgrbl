/**
 * Looks up the localisation key of the plain-language description of a GRBL alarm code.
 *
 * @author michael.morosov
 *
 * @since 2026-10-30
 *
 * @copyright 2026 michael.morosov
 * Licensed under the Apache License, Version 2.0. See the LICENSE file.
 */
import { DEFAULT } from '../localization/default.locales';

/** Description keys are named GRBL_ALARM_<code>, for example GRBL_ALARM_9. */
const ALARM_DESCRIPTION_KEY_PATTERN = /^GRBL_ALARM_(\d+)$/;

const newAlarmDescriptionKeyByCode = (): ReadonlyMap<number, string> => {
  const keyByCode: Map<number, string> = new Map<number, string>();

  for (const [localisationKey, descriptionKey] of Object.entries(DEFAULT)) {
    const codeMatch: RegExpExecArray | null = ALARM_DESCRIPTION_KEY_PATTERN.exec(localisationKey);

    if (codeMatch) {
      keyByCode.set(Number(codeMatch[1]), descriptionKey);
    }
  }

  return keyByCode;
};

const ALARM_DESCRIPTION_KEY_BY_CODE: ReadonlyMap<number, string> = newAlarmDescriptionKeyByCode();

export const getGrblAlarmDescriptionKey = (code: number): string =>
  ALARM_DESCRIPTION_KEY_BY_CODE.get(code) ?? DEFAULT.GRBL_ALARM_UNKNOWN;
