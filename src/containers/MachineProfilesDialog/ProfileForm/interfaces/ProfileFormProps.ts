/**
 * Props of ProfileForm: the profile it starts its draft from.
 *
 * @author michael.morosov
 *
 * @since 2026-10-31
 *
 * @copyright michael.morosov - All rights reserved.
 * You may not use, distribute or modify this code without explicit permission by michael.morosov.
 */
import type { MachineProfile } from '../../../../utils/profiles/interfaces/MachineProfile';

export interface ProfileFormProps {
  /** The stored or new profile the form edits; the form changes only its own copy until Save. */
  profile: MachineProfile;
}
