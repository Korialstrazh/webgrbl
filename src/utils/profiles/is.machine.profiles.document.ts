/**
 * Tells whether a value is a machine profiles document of the supported version.
 *
 * @author michael.morosov
 *
 * @since 2026-10-31
 *
 * @copyright 2026 michael.morosov
 * Licensed under the Apache License, Version 2.0. See the LICENSE file.
 */
import { isOptionalString } from '../type.guards/is.optional.string';
import { isRecord } from '../type.guards/is.record';
import type { MachineProfilesDocument } from './interfaces/MachineProfilesDocument';
import { isMachineProfile } from './is.machine.profile';
import { MACHINE_PROFILES_DOCUMENT_VERSION } from './machine.profile.constants';

export const isMachineProfilesDocument = (value: unknown): value is MachineProfilesDocument =>
  isRecord(value) &&
  value.version === MACHINE_PROFILES_DOCUMENT_VERSION &&
  isOptionalString(value.activeProfileId) &&
  Array.isArray(value.profiles) &&
  value.profiles.every(isMachineProfile);
