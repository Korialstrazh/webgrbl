import { describe, expect, it } from 'vitest';
import { getImportedProfilesDocument } from './get.imported.profiles.document';
import type { MachineProfile } from './interfaces/MachineProfile';
import type { MachineProfilesDocument } from './interfaces/MachineProfilesDocument';
import { MACHINE_PROFILES_DOCUMENT_VERSION } from './machine.profile.constants';
import { newMachineProfile } from './new.machine.profile';

const IMPORTED_NAME = 'Imported laser';

const newDocument = (profiles: MachineProfile[]): MachineProfilesDocument => ({
  version: MACHINE_PROFILES_DOCUMENT_VERSION,
  activeProfileId: undefined,
  profiles,
});

describe(getImportedProfilesDocument.name, () => {
  it('adds the profiles of a valid file to the current ones', () => {
    const currentProfile: MachineProfile = newMachineProfile();
    const importedProfile: MachineProfile = newMachineProfile({ name: IMPORTED_NAME });

    const importedDocument: MachineProfilesDocument | undefined = getImportedProfilesDocument(
      newDocument([currentProfile]),
      JSON.stringify(newDocument([importedProfile])),
    );

    expect(importedDocument).toEqual(newDocument([currentProfile, importedProfile]));
  });

  it.each(['', '{"version": 1, "profiles": [', 'not json'])('returns undefined for the unparseable text %j', (
    fileText: string,
  ) => {
    expect(getImportedProfilesDocument(newDocument([]), fileText)).toBeUndefined();
  });
});
