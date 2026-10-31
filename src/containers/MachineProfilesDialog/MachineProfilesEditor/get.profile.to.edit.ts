/**
 * Picks the profile the dialog edits first: the active one, else the first one, else a new unsaved profile.
 *
 * @author michael.morosov
 *
 * @since 2026-10-31
 *
 * @copyright michael.morosov - All rights reserved.
 * You may not use, distribute or modify this code without explicit permission by michael.morosov.
 */
import type { MachineProfile } from '../../../utils/profiles/interfaces/MachineProfile';
import type { MachineProfilesDocument } from '../../../utils/profiles/interfaces/MachineProfilesDocument';
import { newMachineProfile } from '../../../utils/profiles/new.machine.profile';

export const getProfileToEdit = ({ activeProfileId, profiles }: MachineProfilesDocument): MachineProfile =>
  profiles.find((profile: MachineProfile): boolean => profile.id === activeProfileId)
  ?? profiles[0]
  ?? newMachineProfile();
