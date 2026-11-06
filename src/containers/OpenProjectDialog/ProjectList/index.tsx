/**
 * The body of the Open project dialog: the Open file button and one row for each stored project. It asks for the
 * list when it is shown.
 *
 * @author michael.morosov
 *
 * @since 2026-11-01
 *
 * @copyright michael.morosov - All rights reserved.
 * You may not use, distribute or modify this code without explicit permission by michael.morosov.
 */
import { FolderOpenOutlined } from '@ant-design/icons';
import { Button, Empty } from 'antd';
import { useEffect, useRef } from 'react';
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

  useEffect(() => {
    dispatch(new ProjectSummariesRequested());
  }, [dispatch]);

  return (
    <div className={styles.projectList}>
      <div className={styles.toolbar}>
        <Button icon={<FolderOpenOutlined aria-hidden />} onClick={() => fileInputRef.current?.click()}>
          {t(DEFAULT.OPEN_PROJECT_OPEN_FILE)}
        </Button>
        <ProjectFileInput inputRef={fileInputRef} />
      </div>
      {summaries.length ? (
        <ul className={styles.rows} aria-label={t(DEFAULT.OPEN_PROJECT_LIST)}>
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
