/**
 * The list of stored machine profiles, with the active one marked, and the actions on the edited profile: start a
 * new one, set it active, or delete it after a confirmation.
 *
 * @author michael.morosov
 *
 * @since 2026-10-31
 *
 * @copyright michael.morosov - All rights reserved.
 * You may not use, distribute or modify this code without explicit permission by michael.morosov.
 */
import { Button, Menu, Popconfirm, Tag, Tooltip } from 'antd';
import type { ReactNode } from 'react';
import { useTranslation } from 'react-i18next';
import { ANTD_MENU_MODE_INLINE } from '../../../utils/antd.constants';
import { DEFAULT } from '../../../utils/localization/default.locales';
import type { MachineProfile } from '../../../utils/profiles/interfaces/MachineProfile';
import type { MachineProfilesDocument } from '../../../utils/profiles/interfaces/MachineProfilesDocument';
import type { ProfileListProps } from './interfaces/ProfileListProps';
import type { ProfileMenuClickInfo } from './interfaces/ProfileMenuClickInfo';
import type { ProfileMenuItems } from './interfaces/ProfileMenuItems';
import styles from './styles.module.scss';

export const ProfileList = (props: ProfileListProps): ReactNode => {
  const { profilesDocument, editedProfileId, onSelect, onCreate, onDelete, onSetActive } = props;
  const { t } = useTranslation();
  const { activeProfileId, profiles }: MachineProfilesDocument = profilesDocument;
  // A new profile is in the form but not in the list until it is saved.
  const editedStoredProfile: MachineProfile | undefined =
    profiles.find((profile: MachineProfile): boolean => profile.id === editedProfileId);
  const isEditedProfileStored: boolean = !!editedStoredProfile;
  const canSetEditedProfileActive: boolean = isEditedProfileStored && editedProfileId !== activeProfileId;
  // The last profile stays: without one the bed size and the G-code export have nothing to work from.
  const isOnlyProfile: boolean = profiles.length <= 1;
  const canDeleteEditedProfile: boolean = isEditedProfileStored && !isOnlyProfile;
  const menuItems: ProfileMenuItems = profiles.map((profile: MachineProfile) => ({
    key: profile.id,
    label: (
      <span className={styles.profileLabel}>
        <span className={styles.profileName}>{profile.name}</span>
        {profile.id === activeProfileId && <Tag>{t(DEFAULT.MACHINE_PROFILES_ACTIVE)}</Tag>}
      </span>
    ),
  }));

  return (
    <div className={styles.profileList}>
      <Menu
        className={styles.profileMenu}
        mode={ANTD_MENU_MODE_INLINE}
        items={menuItems}
        selectedKeys={[editedProfileId]}
        aria-label={t(DEFAULT.MACHINE_PROFILES_LIST)}
        onClick={({ key }: ProfileMenuClickInfo) => onSelect(key)}
      />
      <Button block onClick={onCreate}>{t(DEFAULT.MACHINE_PROFILES_NEW)}</Button>
      <div className={styles.actions}>
        <Button disabled={!canSetEditedProfileActive} onClick={() => onSetActive(editedProfileId)}>
          {t(DEFAULT.MACHINE_PROFILES_SET_ACTIVE)}
        </Button>
        <Popconfirm
          title={t(DEFAULT.MACHINE_PROFILES_DELETE_CONFIRM, { name: editedStoredProfile?.name })}
          okText={t(DEFAULT.MACHINE_PROFILES_DELETE_OK)}
          cancelText={t(DEFAULT.MACHINE_PROFILES_DELETE_CANCEL)}
          okButtonProps={{ danger: true }}
          disabled={!canDeleteEditedProfile}
          onConfirm={() => onDelete(editedProfileId)}
        >
          <Tooltip title={isOnlyProfile ? t(DEFAULT.MACHINE_PROFILES_DELETE_LAST_HINT) : undefined}>
            {/* A plain wrapper: a disabled button fires no hover events, so the tooltip listens on the wrapper. */}
            <span className={styles.deleteButtonWrapper}>
              <Button danger disabled={!canDeleteEditedProfile}>{t(DEFAULT.MACHINE_PROFILES_DELETE)}</Button>
            </span>
          </Tooltip>
        </Popconfirm>
      </div>
    </div>
  );
};
