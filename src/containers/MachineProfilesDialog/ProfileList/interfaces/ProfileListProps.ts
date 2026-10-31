/**
 * Props of ProfileList: the stored profiles, which one the form edits, and what each list action asks for.
 *
 * @author michael.morosov
 *
 * @since 2026-10-31
 *
 * @copyright michael.morosov - All rights reserved.
 * You may not use, distribute or modify this code without explicit permission by michael.morosov.
 */
import type { MachineProfilesDocument } from '../../../../utils/profiles/interfaces/MachineProfilesDocument';

export interface ProfileListProps {
  /** All stored profiles and the id of the active one. */
  profilesDocument: MachineProfilesDocument;
  /** Id of the profile in the form; it may be a new profile that is not stored yet. */
  editedProfileId: string;
  /** Called with the id of the profile the user picks for editing. */
  onSelect: (profileId: string) => void;
  /** Called when the user starts a new profile. */
  onCreate: () => void;
  /** Called with the id of the profile the user confirmed to delete. */
  onDelete: (profileId: string) => void;
  /** Called with the id of the profile the user makes the active one. */
  onSetActive: (profileId: string) => void;
}
