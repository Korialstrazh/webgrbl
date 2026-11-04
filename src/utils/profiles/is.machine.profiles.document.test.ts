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
  { ...VALID_DOCUMENT, profiles: [{ ...newMachineProfile(), frameGridCellMm: '10' }] },
  { ...VALID_DOCUMENT, profiles: [{ ...newMachineProfile(), frameMarginMm: NaN }] },
  { ...VALID_DOCUMENT, profiles: [{ ...newMachineProfile(), frameFeedMmPerMin: '6000' }] },
];

describe(isMachineProfilesDocument.name, () => {
  it('accepts a profile with frame settings', () => {
    const document: MachineProfilesDocument = {
      ...VALID_DOCUMENT,
      profiles: [newMachineProfile({ frameGridCellMm: 10, frameMarginMm: 2, frameFeedMmPerMin: 3000 })],
    };

    expect(isMachineProfilesDocument(document)).toBe(true);
  });

  it('accepts a valid document', () => {
    expect(isMachineProfilesDocument(VALID_DOCUMENT)).toBe(true);
    expect(isMachineProfilesDocument({ ...VALID_DOCUMENT, activeProfileId: VALID_PROFILE.id })).toBe(true);
  });

  it.each(INVALID_VALUES)('rejects %j', (value: unknown) => {
    expect(isMachineProfilesDocument(value)).toBe(false);
  });
});
