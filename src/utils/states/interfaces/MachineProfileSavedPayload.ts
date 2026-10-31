/**
 * What the MachineProfileSaved action carries.
 *
 * @author michael.morosov
 *
 * @since 2026-10-31
 *
 * @copyright michael.morosov - All rights reserved.
 * You may not use, distribute or modify this code without explicit permission by michael.morosov.
 */
import type { MachineProfile } from '../../profiles/interfaces/MachineProfile';

export interface MachineProfileSavedPayload {
  /** The profile to add, or to replace when its id already exists. */
  profile: MachineProfile;
}
