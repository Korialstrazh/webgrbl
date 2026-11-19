/**
 * Classifies one line sent by a GRBL controller.
 *
 * @author michael.morosov
 *
 * @since 2026-10-30
 *
 * @copyright 2026 michael.morosov
 * Licensed under the Apache License, Version 2.0. See the LICENSE file.
 */
import {
  GRBL_ALARM_PATTERN,
  GRBL_EMPTY_TEXT,
  GRBL_ERROR_PATTERN,
  GRBL_FEEDBACK_PATTERN,
  GRBL_OK_RESPONSE_TEXT,
  GRBL_RESPONSE_KIND,
  GRBL_SETTING_PATTERN,
} from './grbl.constants';
import { getParsedGrblFirmwareIdentity } from './grbl.firmware.banner.parser';
import { getParsedGrblStatusReport } from './grbl.status.report.parser';
import type { GrblFirmwareIdentity } from './interfaces/GrblFirmwareIdentity';
import type { GrblResponse } from './interfaces/GrblResponse';
import type { GrblStatusReport } from './interfaces/GrblStatusReport';

export const getParsedGrblResponse = (line: string): GrblResponse => {
  const text: string = line.trim();

  if (text === GRBL_OK_RESPONSE_TEXT) {
    return { kind: GRBL_RESPONSE_KIND.OK };
  }

  const errorMatch: RegExpMatchArray | null = text.match(GRBL_ERROR_PATTERN);

  if (errorMatch) {
    return { kind: GRBL_RESPONSE_KIND.ERROR, code: Number(errorMatch[1]) };
  }

  const alarmMatch: RegExpMatchArray | null = text.match(GRBL_ALARM_PATTERN);

  if (alarmMatch) {
    return { kind: GRBL_RESPONSE_KIND.ALARM, code: Number(alarmMatch[1]) };
  }

  const settingMatch: RegExpMatchArray | null = text.match(GRBL_SETTING_PATTERN);

  if (settingMatch) {
    const value: string = settingMatch[2] ?? GRBL_EMPTY_TEXT;

    return { kind: GRBL_RESPONSE_KIND.SETTING, settingNumber: Number(settingMatch[1]), value };
  }

  const report: GrblStatusReport | undefined = getParsedGrblStatusReport(text);

  if (report) {
    return { kind: GRBL_RESPONSE_KIND.STATUS, report };
  }

  if (GRBL_FEEDBACK_PATTERN.test(text)) {
    return { kind: GRBL_RESPONSE_KIND.FEEDBACK, text };
  }

  const identity: GrblFirmwareIdentity | undefined = getParsedGrblFirmwareIdentity(text);

  return identity ? { kind: GRBL_RESPONSE_KIND.BANNER, identity } : { kind: GRBL_RESPONSE_KIND.OTHER, text };
};
