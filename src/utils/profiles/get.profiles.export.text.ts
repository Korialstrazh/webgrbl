/**
 * Writes machine profiles as a pretty JSON document that getMergedProfilesDocument can read back.
 *
 * @author michael.morosov
 *
 * @since 2026-10-31
 *
 * @copyright michael.morosov - All rights reserved.
 * You may not use, distribute or modify this code without explicit permission by michael.morosov.
 */
import type { MachineProfile } from './interfaces/MachineProfile';
import type { MachineProfilesDocument } from './interfaces/MachineProfilesDocument';
import { MACHINE_PROFILES_DOCUMENT_VERSION, MACHINE_PROFILES_EXPORT_INDENT } from './machine.profile.constants';

export const getProfilesExportText = (profiles: MachineProfile[]): string => {
  const exportDocument: MachineProfilesDocument = {
    version: MACHINE_PROFILES_DOCUMENT_VERSION,
    activeProfileId: undefined,
    profiles,
  };

  return JSON.stringify(exportDocument, undefined, MACHINE_PROFILES_EXPORT_INDENT);
};
