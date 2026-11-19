/**
 * What the actions about one machine profile carry: deleting, selecting and updating it from the laser.
 *
 * @author michael.morosov
 *
 * @since 2026-10-31
 *
 * @copyright 2026 michael.morosov
 * Licensed under the Apache License, Version 2.0. See the LICENSE file.
 */
import type { MachineProfile } from '../../profiles/interfaces/MachineProfile';

export interface MachineProfileIdPayload {
  /** Id of the profile the action is about. */
  profileId: MachineProfile['id'];
}
