/**
 * The stored machine profiles as cards: a click on a card edits that profile, a check marks the active one, and each
 * card has its own icon actions to make it active or delete it after a confirmation. A button starts a new profile.
 *
 * @author michael.morosov
 *
 * @since 2026-11-01
 *
 * @copyright michael.morosov - All rights reserved.
 * You may not use, distribute or modify this code without explicit permission by michael.morosov.
 */
import { CheckCircleFilled, CheckOutlined, DeleteOutlined, PlusOutlined } from '@ant-design/icons';
import { Button, Popconfirm } from 'antd';
import type { ReactNode } from 'react';
import { useTranslation } from 'react-i18next';
import { ANTD_BUTTON_SIZE_SMALL, ANTD_BUTTON_TYPE_TEXT } from '../../../utils/antd.constants';
import { DEFAULT } from '../../../utils/localization/default.locales';
import type { MachineProfile } from '../../../utils/profiles/interfaces/MachineProfile';
import type { MachineProfilesDocument } from '../../../utils/profiles/interfaces/MachineProfilesDocument';
import { DismissibleTooltip } from '../../../views/DismissibleTooltip';
import { IconActionButton } from '../../../views/IconActionButton';
import type { ProfileListProps } from './interfaces/ProfileListProps';
import styles from './styles.module.scss';

export const ProfileList = (props: ProfileListProps): ReactNode => {
  const { profilesDocument, editedProfileId, unsavedProfileName, onSelect, onCreate, onDelete, onSetActive } = props;
  const { t } = useTranslation();
  const { activeProfileId, profiles }: MachineProfilesDocument = profilesDocument;
  // The last profile stays: without one the bed size and the G-code export have nothing to work from.
  const isOnlyProfile: boolean = profiles.length <= 1;
  const isEditedProfileUnsaved: boolean = !profiles.some(({ id }: MachineProfile): boolean => id === editedProfileId);

  return (
    <div className={styles.profileList}>
      <ul className={styles.cards} aria-label={t(DEFAULT.MACHINE_PROFILES_LIST)}>
        {profiles.map((profile: MachineProfile) => {
          const isActive: boolean = profile.id === activeProfileId;
          const isEdited: boolean = profile.id === editedProfileId;
          const deleteLabel: string = t(DEFAULT.MACHINE_PROFILES_DELETE, { name: profile.name });

          return (
            <li key={profile.id} className={isEdited ? [styles.card, styles.editedCard].join(' ') : styles.card}>
              <Button
                className={styles.selectButton}
                type={ANTD_BUTTON_TYPE_TEXT}
                aria-current={isEdited}
                onClick={() => onSelect(profile.id)}
              >
                {isActive && <CheckCircleFilled className={styles.activeCheck} aria-hidden />}
                <span className={styles.profileName}>{profile.name}</span>
                {isActive && <span className={styles.activeLabel}>{t(DEFAULT.MACHINE_PROFILES_ACTIVE)}</span>}
              </Button>
              <IconActionButton
                type={ANTD_BUTTON_TYPE_TEXT}
                size={ANTD_BUTTON_SIZE_SMALL}
                labelText={t(DEFAULT.MACHINE_PROFILES_SET_ACTIVE, { name: profile.name })}
                iconComponent={<CheckOutlined />}
                isDisabled={isActive}
                onClick={() => onSetActive(profile.id)}
              />
              <DismissibleTooltip title={isOnlyProfile ? t(DEFAULT.MACHINE_PROFILES_DELETE_LAST_HINT) : deleteLabel}>
                <Popconfirm
                  title={t(DEFAULT.MACHINE_PROFILES_DELETE_CONFIRM, { name: profile.name })}
                  okText={t(DEFAULT.MACHINE_PROFILES_DELETE_OK)}
                  cancelText={t(DEFAULT.MACHINE_PROFILES_DELETE_CANCEL)}
                  okButtonProps={{ danger: true }}
                  disabled={isOnlyProfile}
                  onConfirm={() => onDelete(profile.id)}
                >
                  <Button
                    type={ANTD_BUTTON_TYPE_TEXT}
                    size={ANTD_BUTTON_SIZE_SMALL}
                    danger
                    icon={<DeleteOutlined />}
                    aria-label={deleteLabel}
                    disabled={isOnlyProfile}
                  />
                </Popconfirm>
              </DismissibleTooltip>
            </li>
          );
        })}
        {isEditedProfileUnsaved && (
          <li className={[styles.card, styles.editedCard].join(' ')}>
            <Button className={styles.selectButton} type={ANTD_BUTTON_TYPE_TEXT} aria-current>
              <span className={styles.profileName}>{unsavedProfileName}</span>
              <span className={styles.unsavedLabel}>{t(DEFAULT.MACHINE_PROFILES_UNSAVED)}</span>
            </Button>
          </li>
        )}
      </ul>
      <Button block icon={<PlusOutlined aria-hidden />} onClick={onCreate}>{t(DEFAULT.MACHINE_PROFILES_NEW)}</Button>
    </div>
  );
};
