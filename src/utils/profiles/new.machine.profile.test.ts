import { describe, expect, it } from 'vitest';
import { MACHINE_ORIGIN_CORNER } from './machine.profile.constants';
import { newMachineProfile } from './new.machine.profile';

const OVERRIDE_NAME = 'Diode 20W';

describe(newMachineProfile.name, () => {
  it('uses the default values', () => {
    expect(newMachineProfile()).toEqual({
      id: expect.any(String),
      name: 'My laser',
      maxPowerWatts: 10,
      workAreaXMm: 400,
      workAreaYMm: 400,
      sValueMax: 1000,
      originCorner: MACHINE_ORIGIN_CORNER.FRONT_LEFT,
      hasAirAssist: false,
      hasHomingSwitches: false,
      jogFeedRate: 1500,
    });
  });

  it('gives every profile its own id', () => {
    expect(newMachineProfile().id).not.toBe(newMachineProfile().id);
  });

  it('applies overrides', () => {
    expect(newMachineProfile({ name: OVERRIDE_NAME, hasAirAssist: true })).toMatchObject({
      name: OVERRIDE_NAME,
      hasAirAssist: true,
      workAreaXMm: 400,
    });
  });
});
