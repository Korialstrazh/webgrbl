/**
 * Tests for the lookup of the description key of a GRBL alarm code.
 *
 * @author michael.morosov
 *
 * @since 2026-10-30
 *
 * @copyright michael.morosov - All rights reserved.
 * You may not use, distribute or modify this code without explicit permission by michael.morosov.
 */
import { describe, expect, it } from 'vitest';
import { DEFAULT } from '../localization/default.locales';
import { getGrblAlarmDescriptionKey } from './grbl.alarm.description.key';

const FIRST_ALARM_CODE = 1;
const LAST_ALARM_CODE = 10;
const KNOWN_ALARM_CODES: number[] = Array.from(
  { length: LAST_ALARM_CODE - FIRST_ALARM_CODE + 1 },
  (_unused: unknown, index: number) => FIRST_ALARM_CODE + index,
);
const UNKNOWN_ALARM_CODES: number[] = [0, LAST_ALARM_CODE + 1, 99, -1];

describe(getGrblAlarmDescriptionKey.name, () => {
  it.each(KNOWN_ALARM_CODES)('maps code %i to a key that exists', (code: number) => {
    expect(getGrblAlarmDescriptionKey(code)).toBe(DEFAULT[`GRBL_ALARM_${code}` as keyof typeof DEFAULT]);
  });

  it.each(UNKNOWN_ALARM_CODES)('maps unknown code %i to the unknown key', (code: number) => {
    expect(getGrblAlarmDescriptionKey(code)).toBe(DEFAULT.GRBL_ALARM_UNKNOWN);
  });
});
