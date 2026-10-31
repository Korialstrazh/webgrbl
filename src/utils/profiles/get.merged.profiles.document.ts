import { getMachineProfileErrors } from './get.machine.profile.errors';
import type { MachineProfile } from './interfaces/MachineProfile';
import type { MachineProfilesDocument } from './interfaces/MachineProfilesDocument';
import { isMachineProfilesDocument } from './is.machine.profiles.document';

const hasProfileErrors = (profile: MachineProfile): boolean => !!getMachineProfileErrors(profile).length;

/**
 * Adds the profiles of an imported document to the current ones; a profile whose id is already taken gets a new
 * id. Returns undefined when the imported value is not a valid document.
 *
 * @author michael.morosov
 *
 * @since 2026-10-31
 *
 * @copyright michael.morosov - All rights reserved.
 * You may not use, distribute or modify this code without explicit permission by michael.morosov.
 */
export const getMergedProfilesDocument = (
  current: MachineProfilesDocument,
  imported: unknown,
): MachineProfilesDocument | undefined => {
  if (!isMachineProfilesDocument(imported) || imported.profiles.some(hasProfileErrors)) {
    return undefined;
  }

  const takenIds: Set<string> = new Set(current.profiles.map((profile: MachineProfile): string => profile.id));
  const addedProfiles: MachineProfile[] = [];

  for (const profile of imported.profiles) {
    const addedProfile: MachineProfile = takenIds.has(profile.id) ? { ...profile, id: crypto.randomUUID() } : profile;

    takenIds.add(addedProfile.id);
    addedProfiles.push(addedProfile);
  }

  return { ...current, profiles: [...current.profiles, ...addedProfiles] };
};
