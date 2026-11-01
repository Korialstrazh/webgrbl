/**
 * The autosave readout of the top bar: a dot and the state of the open project, Saved, Saving or Not saved.
 *
 * @author michael.morosov
 *
 * @since 2026-11-01
 *
 * @copyright michael.morosov - All rights reserved.
 * You may not use, distribute or modify this code without explicit permission by michael.morosov.
 */
import type { ReactNode } from 'react';
import { useTranslation } from 'react-i18next';
import { useSelector } from 'react-redux';
import { PROJECT_SAVE_STATUS } from '../../../utils/states/project.save.status.constants';
import type { ProjectSaveStatus } from '../../../utils/states/project.save.status.constants';
import { selectProjectSaveStatus } from '../../../utils/states/project.state';
import { PROJECT_SAVE_STATUS_LABEL_KEY } from '../ProjectMenu/project.menu.constants';
import styles from './styles.module.scss';

const DOT_CLASS_NAME: Record<ProjectSaveStatus, string | undefined> = {
  [PROJECT_SAVE_STATUS.SAVED]: styles.saved,
  [PROJECT_SAVE_STATUS.SAVING]: styles.saving,
  [PROJECT_SAVE_STATUS.UNSAVED]: styles.unsaved,
};

export const AutosaveReadout = (): ReactNode => {
  const { t } = useTranslation();
  const saveStatus: ProjectSaveStatus = useSelector(selectProjectSaveStatus);

  return (
    <p className={styles.autosave} role="status">
      <span className={[styles.dot, DOT_CLASS_NAME[saveStatus]].join(' ')} aria-hidden />
      {t(PROJECT_SAVE_STATUS_LABEL_KEY[saveStatus])}
    </p>
  );
};
