/**
 * The content of the machine profiles dialog: the profile list beside the form of the profile being edited. It
 * remembers which profile is edited; the form keeps its own unsaved draft, which a switch to another profile drops.
 *
 * @author michael.morosov
 *
 * @since 2026-10-31
 *
 * @copyright michael.morosov - All rights reserved.
 * You may not use, distribute or modify this code without explicit permission by michael.morosov.
 */
import { useState } from 'react';
import type { ReactNode } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import type { MachineProfile } from '../../../utils/profiles/interfaces/MachineProfile';
import type { MachineProfilesDocument } from '../../../utils/profiles/interfaces/MachineProfilesDocument';
import { newMachineProfile } from '../../../utils/profiles/new.machine.profile';
import {
  ActiveMachineProfileSelected,
  MachineProfileDeleted,
  selectMachineProfilesDocument,
} from '../../../utils/states/machine.profile.state';
import type { AppDispatch, AppStore } from '../../../utils/states/new.store';
import { useAppStore } from '../../../utils/states/use.app.store';
import { ProfileFileActions } from '../ProfileFileActions';
import { ProfileForm } from '../ProfileForm';
import { ProfileList } from '../ProfileList';
import { getProfileToEdit } from './get.profile.to.edit';
import styles from './styles.module.scss';

export const MachineProfilesEditor = (): ReactNode => {
  const dispatch: AppDispatch = useDispatch();
  const store: AppStore = useAppStore();
  const profilesDocument: MachineProfilesDocument = useSelector(selectMachineProfilesDocument);
  const [editedProfile, setEditedProfile] = useState<MachineProfile>(() => getProfileToEdit(profilesDocument));

  const selectProfile = (profileId: string): void => {
    const selectedProfile: MachineProfile | undefined =
      profilesDocument.profiles.find((profile: MachineProfile): boolean => profile.id === profileId);

    if (selectedProfile) {
      setEditedProfile(selectedProfile);
    }
  };

  const deleteProfile = (profileId: string): void => {
    dispatch(new MachineProfileDeleted({ profileId }));
    // Read the store again: the document of this render still contains the deleted profile.
    setEditedProfile(getProfileToEdit(selectMachineProfilesDocument(store.getState())));
  };

  return (
    <div className={styles.machineProfilesEditor}>
      <div className={styles.sidebar}>
        <ProfileList
          profilesDocument={profilesDocument}
          editedProfileId={editedProfile.id}
          onSelect={selectProfile}
          onCreate={() => setEditedProfile(newMachineProfile())}
          onDelete={deleteProfile}
          onSetActive={(profileId: string) => dispatch(new ActiveMachineProfileSelected({ profileId }))}
        />
        <ProfileFileActions />
      </div>
      <ProfileForm key={editedProfile.id} profile={editedProfile} />
    </div>
  );
};
