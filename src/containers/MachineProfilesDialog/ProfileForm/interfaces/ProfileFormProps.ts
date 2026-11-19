/**
 * Props of ProfileForm: the profile it starts its draft from.
 *
 * @author michael.morosov
 *
 * @since 2026-10-31
 *
 * @copyright 2026 michael.morosov
 * Licensed under the Apache License, Version 2.0. See the LICENSE file.
 */
import type { MachineProfile } from '../../../../utils/profiles/interfaces/MachineProfile';

export interface ProfileFormProps {
  /** The stored or new profile the form edits; the form changes only its own copy until Save. */
  profile: MachineProfile;
}
