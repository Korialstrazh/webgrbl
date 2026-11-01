import { describe, expect, it } from 'vitest';
import { getGcodeExportContext } from './get.gcode.export.context';
import { APP_VERSION } from '../app.version.constants';
import { GRBL_SETTING_S_VALUE_MAX } from '../grbl/grbl.constants';
import type { MachineProfile } from '../profiles/interfaces/MachineProfile';
import { DEFAULT_MACHINE_S_VALUE_MAX, MACHINE_ORIGIN_CORNER } from '../profiles/machine.profile.constants';
import { newMachineProfile } from '../profiles/new.machine.profile';

const PROJECT_NAME = 'Coaster set';
const CREATED_AT_ISO = '2026-11-01T10:00:00.000Z';
const PROFILE: MachineProfile = newMachineProfile({
  name: 'Diode 10 W',
  originCorner: MACHINE_ORIGIN_CORNER.BACK_RIGHT,
  workAreaXMm: 400,
  workAreaYMm: 300,
  sValueMax: 255,
  hasAirAssist: true,
});
const LASER_S_VALUE_MAX = 500;

describe(getGcodeExportContext.name, () => {
  it('takes the machine from the active profile and the S max from it when no laser reports one', () => {
    expect(getGcodeExportContext({
      profile: PROFILE,
      laserSettings: {},
      projectName: PROJECT_NAME,
      createdAtIso: CREATED_AT_ISO,
    })).toEqual({
      projectName: PROJECT_NAME,
      profileName: PROFILE.name,
      originCorner: PROFILE.originCorner,
      workAreaXMm: PROFILE.workAreaXMm,
      workAreaYMm: PROFILE.workAreaYMm,
      sValueMax: PROFILE.sValueMax,
      hasAirAssist: PROFILE.hasAirAssist,
      appVersion: APP_VERSION,
      createdAtIso: CREATED_AT_ISO,
    });
  });

  it('prefers the S max the connected laser reports', () => {
    expect(getGcodeExportContext({
      profile: PROFILE,
      laserSettings: { [GRBL_SETTING_S_VALUE_MAX]: String(LASER_S_VALUE_MAX) },
      projectName: PROJECT_NAME,
      createdAtIso: CREATED_AT_ISO,
    }).sValueMax).toBe(LASER_S_VALUE_MAX);
  });

  it('falls back to the default S max when the profile holds an invalid one', () => {
    expect(getGcodeExportContext({
      profile: { ...PROFILE, sValueMax: 0 },
      laserSettings: {},
      projectName: PROJECT_NAME,
      createdAtIso: CREATED_AT_ISO,
    }).sValueMax).toBe(DEFAULT_MACHINE_S_VALUE_MAX);
  });
});
