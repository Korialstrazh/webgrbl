/**
 * The autosave readout of the top bar: an icon and the state of the open project, Saved, Saving or Waiting to save.
 * Waiting is a calm grey clock, not an error: autosave stores the change shortly. When the bar is narrow only the icon
 * stays; its tooltip and accessible name still give the state.
 *
 * @author michael.morosov
 *
 * @since 2026-11-01
 *
 * @copyright 2026 michael.morosov
 * Licensed under the Apache License, Version 2.0. See the LICENSE file.
 */
import { CheckCircleFilled, ClockCircleOutlined, SyncOutlined } from '@ant-design/icons';
import { Tooltip } from 'antd';
import type { ReactNode } from 'react';
import { useTranslation } from 'react-i18next';
import { useSelector } from 'react-redux';
import { PROJECT_SAVE_STATUS } from '../../../utils/states/project.save.status.constants';
import type { ProjectSaveStatus } from '../../../utils/states/project.save.status.constants';
import { selectProjectSaveStatus } from '../../../utils/states/project.state';
import { PROJECT_SAVE_STATUS_LABEL_KEY } from '../ProjectMenu/project.menu.constants';
import styles from './styles.module.scss';

const ICON_CLASS_NAME: Record<ProjectSaveStatus, string | undefined> = {
  [PROJECT_SAVE_STATUS.SAVED]: styles.saved,
  [PROJECT_SAVE_STATUS.SAVING]: styles.saving,
  [PROJECT_SAVE_STATUS.UNSAVED]: styles.unsaved,
};

const getSaveStatusIconComponent = (saveStatus: ProjectSaveStatus): ReactNode => {
  if (saveStatus === PROJECT_SAVE_STATUS.SAVING) {
    return <SyncOutlined spin />;
  }

  return saveStatus === PROJECT_SAVE_STATUS.SAVED ? <CheckCircleFilled /> : <ClockCircleOutlined />;
};

export const AutosaveReadout = (): ReactNode => {
  const { t } = useTranslation();
  const saveStatus: ProjectSaveStatus = useSelector(selectProjectSaveStatus);

  const statusLabel: string = t(PROJECT_SAVE_STATUS_LABEL_KEY[saveStatus]);

  return (
    <Tooltip title={statusLabel}>
      <p className={styles.autosave} role="status" aria-label={statusLabel}>
        <span className={[styles.icon, ICON_CLASS_NAME[saveStatus]].join(' ')} aria-hidden>
          {getSaveStatusIconComponent(saveStatus)}
        </span>
        <span className={styles.label}>{statusLabel}</span>
      </p>
    </Tooltip>
  );
};
