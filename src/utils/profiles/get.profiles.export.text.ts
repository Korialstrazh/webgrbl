/**
 * Writes machine profiles as a pretty JSON document that getMergedProfilesDocument can read back.
 *
 * @author michael.morosov
 *
 * @since 2026-10-31
 *
 * @copyright 2026 michael.morosov
 * Licensed under the Apache License, Version 2.0. See the LICENSE file.
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
