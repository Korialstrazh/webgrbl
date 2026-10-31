import { describe, expect, it } from 'vitest';
import type { MachineProfile } from './interfaces/MachineProfile';
import type { MachineProfilesDocument } from './interfaces/MachineProfilesDocument';
import { isMachineProfilesDocument } from './is.machine.profiles.document';
import { newMachineProfile } from './new.machine.profile';

const VALID_PROFILE: MachineProfile = newMachineProfile();
const VALID_DOCUMENT: MachineProfilesDocument = {
  version: 1,
  activeProfileId: undefined,
  profiles: [VALID_PROFILE],
};
const INVALID_VALUES: unknown[] = [
  undefined,
  'text',
  {},
  { ...VALID_DOCUMENT, version: 2 },
  { ...VALID_DOCUMENT, activeProfileId: 5 },
  { ...VALID_DOCUMENT, profiles: 'none' },
  { ...VALID_DOCUMENT, profiles: [{ ...newMachineProfile(), originCorner: 'middle' }] },
  { ...VALID_DOCUMENT, profiles: [{ ...newMachineProfile(), id: '' }] },
  { ...VALID_DOCUMENT, profiles: [{ ...newMachineProfile(), jogFeedRate: '1500' }] },
];

describe(isMachineProfilesDocument.name, () => {
  it('accepts a valid document', () => {
    expect(isMachineProfilesDocument(VALID_DOCUMENT)).toBe(true);
    expect(isMachineProfilesDocument({ ...VALID_DOCUMENT, activeProfileId: VALID_PROFILE.id })).toBe(true);
  });

  it.each(INVALID_VALUES)('rejects %j', (value: unknown) => {
    expect(isMachineProfilesDocument(value)).toBe(false);
  });
});
