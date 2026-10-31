import { afterEach, describe, expect, it, vi } from 'vitest';
import type { MachineProfile } from './interfaces/MachineProfile';
import type { MachineProfilesDocument } from './interfaces/MachineProfilesDocument';
import { MACHINE_PROFILES_STORAGE_KEY } from './machine.profile.constants';
import { MACHINE_PROFILES_STORAGE } from './machine.profiles.storage';
import { newMachineProfile } from './new.machine.profile';

const BLOCKED_MESSAGE = 'blocked';
const EMPTY_DOCUMENT: MachineProfilesDocument = { version: 1, activeProfileId: undefined, profiles: [] };
const INVALID_STORED_TEXTS = ['{not json', '"text"', '{"version":2,"profiles":[]}', '{"version":1,"profiles":[{}]}'];

describe('MACHINE_PROFILES_STORAGE', () => {
  afterEach(() => {
    vi.restoreAllMocks();
    localStorage.clear();
  });

  it('round-trips a stored document', () => {
    const profile: MachineProfile = newMachineProfile();
    const storedDocument: MachineProfilesDocument = { version: 1, activeProfileId: profile.id, profiles: [profile] };

    MACHINE_PROFILES_STORAGE.storeDocument(storedDocument);

    expect(MACHINE_PROFILES_STORAGE.getStoredDocument()).toEqual(storedDocument);
  });

  it('returns an empty document when nothing is stored', () => {
    expect(MACHINE_PROFILES_STORAGE.getStoredDocument()).toEqual(EMPTY_DOCUMENT);
  });

  it.each(INVALID_STORED_TEXTS)('returns an empty document for invalid value %s', (storedText: string) => {
    localStorage.setItem(MACHINE_PROFILES_STORAGE_KEY, storedText);

    expect(MACHINE_PROFILES_STORAGE.getStoredDocument()).toEqual(EMPTY_DOCUMENT);
  });

  it('drops stored profiles with values out of range and keeps the valid ones', () => {
    const validProfile: MachineProfile = newMachineProfile();
    const hugeProfile: MachineProfile = newMachineProfile({ workAreaXMm: 1e9 });
    localStorage.setItem(
      MACHINE_PROFILES_STORAGE_KEY,
      JSON.stringify({ version: 1, activeProfileId: validProfile.id, profiles: [hugeProfile, validProfile] }),
    );

    expect(MACHINE_PROFILES_STORAGE.getStoredDocument()).toEqual({
      version: 1,
      activeProfileId: validProfile.id,
      profiles: [validProfile],
    });
  });

  it.each([['missing-id'], ['']])('clears the dangling active profile id %j', (activeProfileId: string) => {
    const validProfile: MachineProfile = newMachineProfile();
    localStorage.setItem(
      MACHINE_PROFILES_STORAGE_KEY,
      JSON.stringify({ version: 1, activeProfileId, profiles: [validProfile] }),
    );

    expect(MACHINE_PROFILES_STORAGE.getStoredDocument().activeProfileId).toBeUndefined();
  });

  it('does not throw when localStorage throws', () => {
    vi.spyOn(Storage.prototype, 'getItem').mockImplementation((): never => {
      throw new Error(BLOCKED_MESSAGE);
    });
    vi.spyOn(Storage.prototype, 'setItem').mockImplementation((): never => {
      throw new Error(BLOCKED_MESSAGE);
    });

    expect(MACHINE_PROFILES_STORAGE.getStoredDocument()).toEqual(EMPTY_DOCUMENT);
    expect(() => MACHINE_PROFILES_STORAGE.storeDocument(EMPTY_DOCUMENT)).not.toThrow();
  });
});
