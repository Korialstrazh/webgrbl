/**
 * The autosave readout of the top bar: an icon for the state of the open project. Saved is a lone muted outline check, since it
 * is the usual state; Saving and Waiting to save add a short word. Waiting is a calm grey clock, not an error: autosave
 * * stores the change shortly. When the bar is narrow only the icon stays; its tooltip and name give the state.
 *
 * @author michael.morosov
 *
 * @since 2026-11-01
 *
 * @copyright 2026 michael.morosov
 * Licensed under the Apache License, Version 2.0. See the LICENSE file.
 */
import { CheckCircleOutlined, ClockCircleOutlined, SyncOutlined } from '@ant-design/icons';
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

  return saveStatus === PROJECT_SAVE_STATUS.SAVED ? <CheckCircleOutlined /> : <ClockCircleOutlined />;
};

export const AutosaveReadout = (): ReactNode => {
  const { t } = useTranslation();
  const saveStatus: ProjectSaveStatus = useSelector(selectProjectSaveStatus);

  const statusLabel: string = t(PROJECT_SAVE_STATUS_LABEL_KEY[saveStatus]);
  const isSaved: boolean = saveStatus === PROJECT_SAVE_STATUS.SAVED;

  return (
    <Tooltip title={statusLabel}>
      <p className={styles.autosave} role="status" aria-label={statusLabel}>
        <span className={[styles.icon, ICON_CLASS_NAME[saveStatus]].join(' ')} aria-hidden>
          {getSaveStatusIconComponent(saveStatus)}
        </span>
        {/* The check alone says Saved; only a state that needs a look gets a word. */}
        {!isSaved && <span className={styles.label}>{statusLabel}</span>}
      </p>
    </Tooltip>
  );
};
