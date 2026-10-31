import { describe, expect, it } from 'vitest';
import { GRBL_SETTING_X_MAX_TRAVEL, GRBL_SETTING_Y_MAX_TRAVEL } from '../bed/bed.constants';
import {
  GRBL_SETTING_HOMING_ENABLED,
  GRBL_SETTING_LASER_MODE,
  GRBL_SETTING_S_VALUE_MAX,
} from '../grbl/grbl.constants';
import { getProfileValuesFromSettings } from './get.profile.values.from.settings';
import type { MachineProfileValuesFromSettings } from './interfaces/MachineProfileValuesFromSettings';
import {
  DEFAULT_MACHINE_HAS_HOMING_SWITCHES,
  DEFAULT_MACHINE_S_VALUE_MAX,
  DEFAULT_MACHINE_WORK_AREA_MM,
} from './machine.profile.constants';

const SETTING_ON = '1';
const SETTING_OFF = '0';
const WORK_AREA_X_MM = 300;
const WORK_AREA_Y_MM = 200;
const S_VALUE_MAX = 255;

const DEFAULT_VALUES: MachineProfileValuesFromSettings = {
  workAreaXMm: DEFAULT_MACHINE_WORK_AREA_MM,
  workAreaYMm: DEFAULT_MACHINE_WORK_AREA_MM,
  sValueMax: DEFAULT_MACHINE_S_VALUE_MAX,
  hasHomingSwitches: DEFAULT_MACHINE_HAS_HOMING_SWITCHES,
  isLaserModeOn: false,
};

describe(getProfileValuesFromSettings.name, () => {
  it('reads work area, S max, homing and laser mode from $130, $131, $30, $22 and $32', () => {
    const values: MachineProfileValuesFromSettings = getProfileValuesFromSettings({
      [GRBL_SETTING_X_MAX_TRAVEL]: '300.000',
      [GRBL_SETTING_Y_MAX_TRAVEL]: '200.000',
      [GRBL_SETTING_S_VALUE_MAX]: '255',
      [GRBL_SETTING_HOMING_ENABLED]: SETTING_ON,
      [GRBL_SETTING_LASER_MODE]: SETTING_ON,
    });

    expect(values).toEqual({
      workAreaXMm: WORK_AREA_X_MM,
      workAreaYMm: WORK_AREA_Y_MM,
      sValueMax: S_VALUE_MAX,
      hasHomingSwitches: true,
      isLaserModeOn: true,
    });
  });

  it('falls back to the defaults when the settings are missing', () => {
    expect(getProfileValuesFromSettings({})).toEqual(DEFAULT_VALUES);
  });

  it.each([['0'], ['-5'], ['abc'], ['6000'], ['']])('falls back to the default work area for travel "%s"', (
    travel: string,
  ) => {
    const values: MachineProfileValuesFromSettings = getProfileValuesFromSettings({
      [GRBL_SETTING_X_MAX_TRAVEL]: travel,
      [GRBL_SETTING_Y_MAX_TRAVEL]: travel,
    });

    expect([values.workAreaXMm, values.workAreaYMm])
      .toEqual([DEFAULT_MACHINE_WORK_AREA_MM, DEFAULT_MACHINE_WORK_AREA_MM]);
  });

  it.each([['0'], ['1.5'], ['100001'], ['abc']])('falls back to the default S max for "%s"', (sValueMax: string) => {
    expect(getProfileValuesFromSettings({ [GRBL_SETTING_S_VALUE_MAX]: sValueMax }).sValueMax)
      .toBe(DEFAULT_MACHINE_S_VALUE_MAX);
  });

  it('reads homing and laser mode as off for any value other than 1', () => {
    const values: MachineProfileValuesFromSettings = getProfileValuesFromSettings({
      [GRBL_SETTING_HOMING_ENABLED]: SETTING_OFF,
      [GRBL_SETTING_LASER_MODE]: SETTING_OFF,
    });

    expect([values.hasHomingSwitches, values.isLaserModeOn]).toEqual([false, false]);
  });
});
