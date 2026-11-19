/**
 * What the MachineProfileSaved action carries.
 *
 * @author michael.morosov
 *
 * @since 2026-10-31
 *
 * @copyright 2026 michael.morosov
 * Licensed under the Apache License, Version 2.0. See the LICENSE file.
 */
import type { MachineProfile } from '../../profiles/interfaces/MachineProfile';

export interface MachineProfileSavedPayload {
  /** The profile to add, or to replace when its id already exists. */
  profile: MachineProfile;
}
