/**
 * All stored machine profiles and which one is active.
 *
 * @author michael.morosov
 *
 * @since 2026-10-31
 *
 * @copyright michael.morosov - All rights reserved.
 * You may not use, distribute or modify this code without explicit permission by michael.morosov.
 */
import type { MachineProfile } from './MachineProfile';

export interface MachineProfilesDocument {
  /** Format version of the document. */
  version: number;
  /** Id of the profile in use; undefined when none is chosen. */
  activeProfileId: string | undefined;
  /** All profiles the user has. */
  profiles: MachineProfile[];
}
