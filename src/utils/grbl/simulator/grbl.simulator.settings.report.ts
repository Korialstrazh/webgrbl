/**
 * Formats the $$ answer of the simulated controller: one $n=value line per setting in number order.
 *
 * @author michael.morosov
 *
 * @since 2026-10-30
 *
 * @copyright michael.morosov - All rights reserved.
 * You may not use, distribute or modify this code without explicit permission by michael.morosov.
 */
import { GRBL_SYSTEM_COMMAND_PREFIX } from '../grbl.constants';

/** Setting number text and value text. */
type SettingEntry = [string, string];

const SETTING_VALUE_SEPARATOR = '=';

export const getSimulatorSettingsReportLines = (settings: Readonly<Record<number, string>>): string[] => {
  const settingEntries: SettingEntry[] = Object.entries(settings).sort(
    ([leftNumber]: SettingEntry, [rightNumber]: SettingEntry): number => Number(leftNumber) - Number(rightNumber),
  );
  const reportLines: string[] = [];

  for (const [settingNumber, settingValue] of settingEntries) {
    reportLines.push(`${GRBL_SYSTEM_COMMAND_PREFIX}${settingNumber}${SETTING_VALUE_SEPARATOR}${settingValue}`);
  }

  return reportLines;
};
