import { describe, expect, it } from 'vitest';
import { GRBL_SETTING_S_VALUE_MAX } from '../grbl/grbl.constants';
import type { MachineProfile } from '../profiles/interfaces/MachineProfile';
import { DEFAULT_MACHINE_S_VALUE_MAX } from '../profiles/machine.profile.constants';
import { newMachineProfile } from '../profiles/new.machine.profile';
import { getPointerSValueMax } from './get.pointer.s.value.max';

const LASER_S_VALUE_MAX = 255;
const PROFILE_S_VALUE_MAX = 500;
const LASER_SETTINGS: Record<number, string> = { [GRBL_SETTING_S_VALUE_MAX]: String(LASER_S_VALUE_MAX) };
const INVALID_LASER_SETTINGS: Record<number, string> = { [GRBL_SETTING_S_VALUE_MAX]: '0' };

describe(getPointerSValueMax.name, () => {
  const profile: MachineProfile = newMachineProfile({ sValueMax: PROFILE_S_VALUE_MAX });

  it('prefers the validly reported $30 over the active profile', () => {
    expect(getPointerSValueMax(LASER_SETTINGS, profile)).toBe(LASER_S_VALUE_MAX);
  });

  it('uses the reported $30 without an active profile', () => {
    expect(getPointerSValueMax(LASER_SETTINGS, undefined)).toBe(LASER_S_VALUE_MAX);
  });

  it('falls back to the active profile when $30 is missing or invalid', () => {
    expect(getPointerSValueMax({}, profile)).toBe(PROFILE_S_VALUE_MAX);
    expect(getPointerSValueMax(INVALID_LASER_SETTINGS, profile)).toBe(PROFILE_S_VALUE_MAX);
  });

  it('falls back to the default without $30 and without an active profile', () => {
    expect(getPointerSValueMax({}, undefined)).toBe(DEFAULT_MACHINE_S_VALUE_MAX);
  });
});
