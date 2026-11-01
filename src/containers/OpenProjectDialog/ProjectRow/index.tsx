/**
 * One stored project in the Open dialog: its name, when it changed and how many objects it holds, with Open, an in-
 * place Rename and Delete after a confirmation. The project open now is marked and has no Open button.
 *
 * @author michael.morosov
 *
 * @since 2026-11-01
 *
 * @copyright michael.morosov - All rights reserved.
 * You may not use, distribute or modify this code without explicit permission by michael.morosov.
 */
import { Button, Popconfirm, Tag } from 'antd';
import { useState } from 'react';
import type { ReactNode } from 'react';
import { useTranslation } from 'react-i18next';
import { useDispatch } from 'react-redux';
import { ANTD_BUTTON_SIZE_SMALL, ANTD_BUTTON_TYPE_TEXT } from '../../../utils/antd.constants';
import { DEFAULT } from '../../../utils/localization/default.locales';
import { getProjectChangedTimeText } from '../../../utils/project/get.project.changed.time.text';
import type { AppDispatch } from '../../../utils/states/new.store';
import {
  ProjectDeleteRequested,
  ProjectOpenRequested,
  ProjectRenameRequested,
} from '../../../utils/states/project.state';
import { ProjectRenameInput } from '../../ProjectRenameInput';
import type { ProjectRowProps } from './interfaces/ProjectRowProps';
import styles from './styles.module.scss';

export const ProjectRow = ({ summary, isOpenProject, onOpened }: ProjectRowProps): ReactNode => {
  const { t, i18n } = useTranslation();
  const dispatch: AppDispatch = useDispatch();
  const [isRenaming, setIsRenaming] = useState<boolean>(false);
  const { id: projectId, name: projectName, updatedAt, objectCount } = summary;

  const openProject = (): void => {
    dispatch(new ProjectOpenRequested({ projectId }));
    onOpened();
  };

  const commitName = (newName: string): void => {
    setIsRenaming(false);
    dispatch(new ProjectRenameRequested({ projectId, name: newName }));
  };

  return (
    <li className={styles.row}>
      <div className={styles.details}>
        {isRenaming ? (
          <ProjectRenameInput
            initialName={projectName}
            ariaLabel={t(DEFAULT.OPEN_PROJECT_RENAME_INPUT, { name: projectName })}
            onCommit={commitName}
            onCancel={() => setIsRenaming(false)}
          />
        ) : (
          <span className={styles.name}>
            {projectName}
            {isOpenProject && <Tag className={styles.openNow}>{t(DEFAULT.OPEN_PROJECT_NOW)}</Tag>}
          </span>
        )}
        <span className={styles.meta}>
          {t(DEFAULT.OPEN_PROJECT_META, {
            time: getProjectChangedTimeText(updatedAt, i18n.language),
            count: objectCount,
          })}
        </span>
      </div>
      <div className={styles.actions}>
        {!isOpenProject && (
          <Button size={ANTD_BUTTON_SIZE_SMALL} onClick={openProject}>{t(DEFAULT.OPEN_PROJECT_OPEN)}</Button>
        )}
        <Button size={ANTD_BUTTON_SIZE_SMALL} type={ANTD_BUTTON_TYPE_TEXT} onClick={() => setIsRenaming(true)}>
          {t(DEFAULT.OPEN_PROJECT_RENAME)}
        </Button>
        <Popconfirm
          title={t(DEFAULT.OPEN_PROJECT_DELETE_CONFIRM, { name: projectName })}
          okText={t(DEFAULT.OPEN_PROJECT_DELETE_OK)}
          cancelText={t(DEFAULT.OPEN_PROJECT_DELETE_CANCEL)}
          okButtonProps={{ danger: true }}
          onConfirm={() => dispatch(new ProjectDeleteRequested({ projectId }))}
        >
          <Button size={ANTD_BUTTON_SIZE_SMALL} type={ANTD_BUTTON_TYPE_TEXT} danger>
            {t(DEFAULT.OPEN_PROJECT_DELETE)}
          </Button>
        </Popconfirm>
      </div>
    </li>
  );
};
