/**
 * All stored machine profiles and which one is active.
 *
 * @author michael.morosov
 *
 * @since 2026-10-31
 *
 * @copyright 2026 michael.morosov
 * Licensed under the Apache License, Version 2.0. See the LICENSE file.
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
