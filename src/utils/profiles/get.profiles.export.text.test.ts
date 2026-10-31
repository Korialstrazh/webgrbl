import { describe, expect, it } from 'vitest';
import type { MachineProfile } from './interfaces/MachineProfile';
import { getProfilesExportText } from './get.profiles.export.text';
import { newMachineProfile } from './new.machine.profile';

describe(getProfilesExportText.name, () => {
  it('writes a version 1 document that parses back to the same profiles', () => {
    const profiles: MachineProfile[] = [newMachineProfile(), newMachineProfile({ hasAirAssist: true })];

    expect(JSON.parse(getProfilesExportText(profiles))).toEqual({ version: 1, profiles });
  });

  it('writes pretty multi-line text', () => {
    expect(getProfilesExportText([newMachineProfile()])).toContain('\n  "version": 1');
  });
});
