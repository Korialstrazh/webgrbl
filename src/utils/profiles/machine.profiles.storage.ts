import { getMachineProfileErrors } from './get.machine.profile.errors';
import type { MachineProfile } from './interfaces/MachineProfile';
import type { MachineProfilesDocument } from './interfaces/MachineProfilesDocument';
import { isMachineProfilesDocument } from './is.machine.profiles.document';
import { MACHINE_PROFILES_DOCUMENT_VERSION, MACHINE_PROFILES_STORAGE_KEY } from './machine.profile.constants';

const newEmptyDocument = (): MachineProfilesDocument => ({
  version: MACHINE_PROFILES_DOCUMENT_VERSION,
  activeProfileId: undefined,
  profiles: [],
});

const isProfileValid = (profile: MachineProfile): boolean => !getMachineProfileErrors(profile).length;

const getCleanedDocument = (storedDocument: MachineProfilesDocument): MachineProfilesDocument => {
  const profiles: MachineProfile[] = storedDocument.profiles.filter(isProfileValid);
  const hasActiveProfile: boolean = profiles.some(
    (profile: MachineProfile): boolean => profile.id === storedDocument.activeProfileId,
  );

  return {
    version: storedDocument.version,
    activeProfileId: hasActiveProfile ? storedDocument.activeProfileId : undefined,
    profiles,
  };
};

/**
 * Keeps the machine profiles in localStorage. Storage can be blocked or full, so every access is guarded and a
 * failure reads as an empty document.
 *
 * @author michael.morosov
 *
 * @since 2026-10-31
 *
 * @copyright michael.morosov - All rights reserved.
 * You may not use, distribute or modify this code without explicit permission by michael.morosov.
 */
export const MACHINE_PROFILES_STORAGE = {
  getStoredDocument(): MachineProfilesDocument {
    try {
      const storedText: string | null = localStorage.getItem(MACHINE_PROFILES_STORAGE_KEY);

      if (!storedText) {
        return newEmptyDocument();
      }

      const parsedValue: unknown = JSON.parse(storedText);

      return isMachineProfilesDocument(parsedValue) ? getCleanedDocument(parsedValue) : newEmptyDocument();
    } catch {
      return newEmptyDocument();
    }
  },

  storeDocument(document: MachineProfilesDocument): void {
    try {
      localStorage.setItem(MACHINE_PROFILES_STORAGE_KEY, JSON.stringify(document));
    } catch {
      // Storage can be blocked or full; the profiles are then simply not remembered.
    }
  },
};
