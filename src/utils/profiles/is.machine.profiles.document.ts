import { isOptionalString } from '../type.guards/is.optional.string';
import { isRecord } from '../type.guards/is.record';
import type { MachineProfilesDocument } from './interfaces/MachineProfilesDocument';
import { isMachineProfile } from './is.machine.profile';
import { MACHINE_PROFILES_DOCUMENT_VERSION } from './machine.profile.constants';

/**
 * Tells whether a value is a machine profiles document of the supported version.
 *
 * @author michael.morosov
 *
 * @since 2026-10-31
 *
 * @copyright michael.morosov - All rights reserved.
 * You may not use, distribute or modify this code without explicit permission by michael.morosov.
 */
export const isMachineProfilesDocument = (value: unknown): value is MachineProfilesDocument =>
  isRecord(value) &&
  value.version === MACHINE_PROFILES_DOCUMENT_VERSION &&
  isOptionalString(value.activeProfileId) &&
  Array.isArray(value.profiles) &&
  value.profiles.every(isMachineProfile);
