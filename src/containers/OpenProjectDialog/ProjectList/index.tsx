/**
 * The body of the Open project dialog: an "In this browser" heading with the storage note and the Open file button
 * in one row above the list, then one row for each stored project. It asks for the
 * list when it is shown.
 *
 * @author michael.morosov
 *
 * @since 2026-11-01
 *
 * @copyright 2026 michael.morosov
 * Licensed under the Apache License, Version 2.0. See the LICENSE file.
 */
import { FolderOpenOutlined, HddOutlined } from '@ant-design/icons';
import { Button, Empty } from 'antd';
import { useEffect, useId, useRef } from 'react';
import type { ReactNode, RefObject } from 'react';
import { useTranslation } from 'react-i18next';
import { useDispatch, useSelector } from 'react-redux';
import { DEFAULT } from '../../../utils/localization/default.locales';
import type { ProjectSummary } from '../../../utils/project/interfaces/ProjectSummary';
import type { AppDispatch } from '../../../utils/states/new.store';
import {
  ProjectSummariesRequested,
  selectProjectId,
  selectProjectSummaries,
} from '../../../utils/states/project.state';
import { TooltipNoteIcon } from '../../../views/TooltipNoteIcon';
import { ProjectFileInput } from '../../ProjectFileInput';
import { ProjectRow } from '../ProjectRow';
import type { ProjectListProps } from './interfaces/ProjectListProps';
import styles from './styles.module.scss';

export const ProjectList = ({ onClose }: ProjectListProps): ReactNode => {
  const { t } = useTranslation();
  const dispatch: AppDispatch = useDispatch();
  const fileInputRef: RefObject<HTMLInputElement | null> = useRef<HTMLInputElement | null>(null);
  const summaries: ProjectSummary[] = useSelector(selectProjectSummaries);
  const openProjectId: string | undefined = useSelector(selectProjectId);
  const headingId: string = useId();

  useEffect(() => {
    dispatch(new ProjectSummariesRequested());
  }, [dispatch]);

  return (
    <div className={styles.projectList}>
      <div className={styles.toolbar}>
        <div className={styles.heading}>
          <TooltipNoteIcon noteText={t(DEFAULT.OPEN_PROJECT_FOOTER)} iconComponent={<HddOutlined />} />
          <h3 id={headingId} className={styles.headingText}>{t(DEFAULT.OPEN_PROJECT_STORED_CAPTION)}</h3>
        </div>
        <Button icon={<FolderOpenOutlined aria-hidden />} onClick={() => fileInputRef.current?.click()}>
          {t(DEFAULT.OPEN_PROJECT_OPEN_FILE)}
        </Button>
        <ProjectFileInput inputRef={fileInputRef} />
      </div>
      {summaries.length ? (
        <ul className={styles.rows} aria-label={t(DEFAULT.OPEN_PROJECT_LIST)} aria-describedby={headingId}>
          {summaries.map((summary: ProjectSummary) => (
            <ProjectRow
              key={summary.id}
              summary={summary}
              isOpenProject={summary.id === openProjectId}
              onOpened={onClose}
            />
          ))}
        </ul>
      ) : (
        <Empty description={t(DEFAULT.OPEN_PROJECT_EMPTY)} />
      )}
    </div>
  );
};
