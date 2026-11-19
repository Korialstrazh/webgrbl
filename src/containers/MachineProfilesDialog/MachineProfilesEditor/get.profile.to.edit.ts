/**
 * Picks the profile the dialog edits first: the active one, else the first one, else a new unsaved profile.
 *
 * @author michael.morosov
 *
 * @since 2026-10-31
 *
 * @copyright 2026 michael.morosov
 * Licensed under the Apache License, Version 2.0. See the LICENSE file.
 */
import type { MachineProfile } from '../../../utils/profiles/interfaces/MachineProfile';
import type { MachineProfilesDocument } from '../../../utils/profiles/interfaces/MachineProfilesDocument';
import { newMachineProfile } from '../../../utils/profiles/new.machine.profile';

export const getProfileToEdit = ({ activeProfileId, profiles }: MachineProfilesDocument): MachineProfile =>
  profiles.find((profile: MachineProfile): boolean => profile.id === activeProfileId)
  ?? profiles[0]
  ?? newMachineProfile();
