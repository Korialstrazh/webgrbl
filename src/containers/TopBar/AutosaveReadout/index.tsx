/**
 * The autosave readout of the top bar: a cloud icon for the state of the open project. Saved is a cloud with a green
 * check; Saving (an amber syncing cloud), Waiting to save (a grey upload cloud) and Save failed (a red cloud with an
 * exclamation mark) add a short word. Waiting stays calm grey, not an error: autosave stores the change shortly.
 * When the bar is narrow only the icon stays; its tooltip and name give the state.
 *
 * @author michael.morosov
 *
 * @since 2026-11-01
 *
 * @copyright 2026 michael.morosov
 * Licensed under the Apache License, Version 2.0. See the LICENSE file.
 */
import {
  CheckOutlined,
  CloudOutlined,
  CloudSyncOutlined,
  CloudUploadOutlined,
  ExclamationOutlined,
} from '@ant-design/icons';
import { Tooltip } from 'antd';
import type { ReactNode } from 'react';
import { useTranslation } from 'react-i18next';
import { useSelector } from 'react-redux';
import { DEFAULT } from '../../../utils/localization/default.locales';
import { PROJECT_SAVE_STATUS } from '../../../utils/states/project.save.status.constants';
import type { ProjectSaveStatus } from '../../../utils/states/project.save.status.constants';
import { selectHasProjectSaveFailed, selectProjectSaveStatus } from '../../../utils/states/project.state';
import { PROJECT_SAVE_STATUS_LABEL_KEY } from '../ProjectMenu/project.menu.constants';
import styles from './styles.module.scss';

const ICON_CLASS_NAME: Record<ProjectSaveStatus, string | undefined> = {
  [PROJECT_SAVE_STATUS.SAVED]: styles.saved,
  [PROJECT_SAVE_STATUS.SAVING]: styles.saving,
  [PROJECT_SAVE_STATUS.UNSAVED]: styles.unsaved,
};

const getSaveFailedIconComponent = (): ReactNode => (
  <>
    <CloudOutlined />
    <ExclamationOutlined className={styles.cloudBadge} />
  </>
);

const getSaveStatusIconComponent = (saveStatus: ProjectSaveStatus): ReactNode => {
  if (saveStatus === PROJECT_SAVE_STATUS.SAVING) {
    return <CloudSyncOutlined />;
  }

  if (saveStatus === PROJECT_SAVE_STATUS.UNSAVED) {
    return <CloudUploadOutlined />;
  }

  // antd has no cloud with a check, so a small check sits on the cloud's corner.
  return (
    <>
      <CloudOutlined />
      <CheckOutlined className={[styles.cloudBadge, styles.cloudCheck].join(' ')} />
    </>
  );
};

export const AutosaveReadout = (): ReactNode => {
  const { t } = useTranslation();
  const saveStatus: ProjectSaveStatus = useSelector(selectProjectSaveStatus);

  const hasSaveFailed: boolean = useSelector(selectHasProjectSaveFailed);

  // A failed save outranks the waiting state it leaves behind, so the user sees why the change is not stored.
  const statusLabel: string = hasSaveFailed
    ? t(DEFAULT.TOP_BAR_AUTOSAVE_FAILED)
    : t(PROJECT_SAVE_STATUS_LABEL_KEY[saveStatus]);
  const iconClassName: string | undefined = hasSaveFailed ? styles.failed : ICON_CLASS_NAME[saveStatus];
  const isSaved: boolean = saveStatus === PROJECT_SAVE_STATUS.SAVED;

  return (
    <Tooltip title={statusLabel}>
      <p className={styles.autosave} role="status" aria-label={statusLabel}>
        <span className={[styles.icon, iconClassName].join(' ')} aria-hidden>
          {hasSaveFailed ? getSaveFailedIconComponent() : getSaveStatusIconComponent(saveStatus)}
        </span>
        {/* The cloud check alone says Saved; only a state that needs a look gets a word. */}
        {!isSaved && <span className={styles.label}>{statusLabel}</span>}
      </p>
    </Tooltip>
  );
};
