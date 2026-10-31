import { describe, expect, it } from 'vitest';
import { GRBL_SETTING_X_MAX_TRAVEL, GRBL_SETTING_Y_MAX_TRAVEL } from '../bed/bed.constants';
import {
  GRBL_SETTING_HOMING_ENABLED,
  GRBL_SETTING_LASER_MODE,
  GRBL_SETTING_S_VALUE_MAX,
} from '../grbl/grbl.constants';
import { getValidlyReportedProfileValues } from './get.validly.reported.profile.values';

const SETTING_ON = '1';
const SETTING_OFF = '0';
const WORK_AREA_X_MM = 300;
const WORK_AREA_Y_MM = 200;
const S_VALUE_MAX = 255;

describe(getValidlyReportedProfileValues.name, () => {
  it('returns every value the laser reports validly', () => {
    expect(getValidlyReportedProfileValues({
      [GRBL_SETTING_X_MAX_TRAVEL]: '300.000',
      [GRBL_SETTING_Y_MAX_TRAVEL]: '200',
      [GRBL_SETTING_S_VALUE_MAX]: '255',
      [GRBL_SETTING_HOMING_ENABLED]: SETTING_OFF,
      [GRBL_SETTING_LASER_MODE]: SETTING_ON,
    })).toEqual({
      workAreaXMm: WORK_AREA_X_MM,
      workAreaYMm: WORK_AREA_Y_MM,
      sValueMax: S_VALUE_MAX,
      hasHomingSwitches: false,
      isLaserModeOn: true,
    });
  });

  it('returns nothing when the settings are missing', () => {
    expect(getValidlyReportedProfileValues({})).toEqual({});
  });

  it('leaves out values outside the profile ranges', () => {
    expect(getValidlyReportedProfileValues({
      [GRBL_SETTING_X_MAX_TRAVEL]: '0',
      [GRBL_SETTING_Y_MAX_TRAVEL]: '6000',
      [GRBL_SETTING_S_VALUE_MAX]: '1.5',
      [GRBL_SETTING_LASER_MODE]: SETTING_OFF,
    })).toEqual({ isLaserModeOn: false });
  });
});
