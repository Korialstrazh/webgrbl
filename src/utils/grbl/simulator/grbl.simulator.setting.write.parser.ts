/**
 * Reads a $n=value command for the simulated controller, rejecting unknown settings and bad numbers.
 *
 * @author michael.morosov
 *
 * @since 2026-10-30
 *
 * @copyright michael.morosov - All rights reserved.
 * You may not use, distribute or modify this code without explicit permission by michael.morosov.
 */
import {
  GRBL_SIMULATOR_ERROR_BAD_NUMBER,
  GRBL_SIMULATOR_ERROR_INVALID_STATEMENT,
  GRBL_SIMULATOR_NUMBER_PATTERN,
  GRBL_SIMULATOR_SETTING_WRITE_PATTERN,
} from './grbl.simulator.constants';
import type { GrblSimulatorGcodeError } from './interfaces/GrblSimulatorGcodeError';
import type { GrblSimulatorSettingWrite } from './interfaces/GrblSimulatorSettingWrite';

/** NaN, from a command that is no setting write, is never a known setting. */
const isKnownSettingNumber = (settingNumber: number, settings: Readonly<Record<number, string>>): boolean =>
  Object.hasOwn(settings, settingNumber);

export const getParsedSimulatorSettingWrite = (
  command: string,
  settings: Readonly<Record<number, string>>,
): GrblSimulatorSettingWrite | GrblSimulatorGcodeError => {
  const match: RegExpExecArray | null = GRBL_SIMULATOR_SETTING_WRITE_PATTERN.exec(command);
  const settingNumber: number = Number(match?.[1]);
  const value: string = match?.[2] ?? '';

  if (!isKnownSettingNumber(settingNumber, settings)) {
    return { errorCode: GRBL_SIMULATOR_ERROR_INVALID_STATEMENT };
  }

  if (!GRBL_SIMULATOR_NUMBER_PATTERN.test(value)) {
    return { errorCode: GRBL_SIMULATOR_ERROR_BAD_NUMBER };
  }

  return { settingNumber, value };
};
