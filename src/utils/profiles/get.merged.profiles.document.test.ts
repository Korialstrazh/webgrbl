import { describe, expect, it } from 'vitest';
import type { MachineProfile } from './interfaces/MachineProfile';
import type { MachineProfilesDocument } from './interfaces/MachineProfilesDocument';
import { getMergedProfilesDocument } from './get.merged.profiles.document';
import { newMachineProfile } from './new.machine.profile';

const OTHER_NAME = 'Other laser';
const UNPARSEABLE_TEXT = '{';

const newCurrentDocument = (profiles: MachineProfile[], activeProfileId?: string): MachineProfilesDocument => ({
  version: 1,
  activeProfileId,
  profiles,
});

describe(getMergedProfilesDocument.name, () => {
  it('appends imported profiles and keeps the active profile', () => {
    const existing: MachineProfile = newMachineProfile();
    const imported: MachineProfile = newMachineProfile({ name: OTHER_NAME });

    const merged = getMergedProfilesDocument(newCurrentDocument([existing], existing.id), {
      version: 1,
      profiles: [imported],
    });

    expect(merged).toEqual(newCurrentDocument([existing, imported], existing.id));
  });

  it('gives an imported profile a new id when the id is taken and keeps both', () => {
    const existing: MachineProfile = newMachineProfile();
    const clashing: MachineProfile = newMachineProfile({ id: existing.id, name: OTHER_NAME });

    const merged = getMergedProfilesDocument(newCurrentDocument([existing]), { version: 1, profiles: [clashing] });

    expect(merged?.profiles).toHaveLength(2);
    expect(merged?.profiles[0]).toEqual(existing);
    expect(merged?.profiles[1]?.name).toBe(OTHER_NAME);
    expect(merged?.profiles[1]?.id).not.toBe(existing.id);
  });

  it('gives new ids to imported profiles that share an id with each other', () => {
    const first: MachineProfile = newMachineProfile();

    const merged = getMergedProfilesDocument(newCurrentDocument([]), { version: 1, profiles: [first, { ...first }] });

    expect(new Set(merged?.profiles.map((profile: MachineProfile): string => profile.id)).size).toBe(2);
  });

  it.each([
    ['garbage text', UNPARSEABLE_TEXT],
    ['a wrong version', { version: 2, profiles: [] }],
    ['a profile of the wrong shape', { version: 1, profiles: [{ id: 'a' }] }],
    ['a profile with an invalid value', { version: 1, profiles: [newMachineProfile({ name: '' })] }],
  ])('returns undefined for %s', (_label: string, imported: unknown) => {
    expect(getMergedProfilesDocument(newCurrentDocument([]), imported)).toBeUndefined();
  });
});
