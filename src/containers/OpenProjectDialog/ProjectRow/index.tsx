/**
 * One stored project in the Open dialog: its name, then how many objects it holds and how long ago it changed (the
 * exact time in a tooltip), with Open, an in-place Rename and Delete after a confirmation. The project open now is
 * marked and has no Open button.
 *
 * @author michael.morosov
 *
 * @since 2026-11-01
 *
 * @copyright michael.morosov - All rights reserved.
 * You may not use, distribute or modify this code without explicit permission by michael.morosov.
 */
import { DeleteOutlined, EditOutlined, FolderOpenOutlined } from '@ant-design/icons';
import { Button, Popconfirm, Tag } from 'antd';
import { useState } from 'react';
import type { ReactNode } from 'react';
import { useTranslation } from 'react-i18next';
import { useDispatch } from 'react-redux';
import { ANTD_BUTTON_SIZE_SMALL, ANTD_BUTTON_TYPE_TEXT } from '../../../utils/antd.constants';
import { DEFAULT } from '../../../utils/localization/default.locales';
import { getProjectChangedRelativeTimeText } from '../../../utils/project/get.project.changed.relative.time.text';
import { getProjectChangedTimeText } from '../../../utils/project/get.project.changed.time.text';
import type { AppDispatch } from '../../../utils/states/new.store';
import {
  ProjectDeleteRequested,
  ProjectOpenRequested,
  ProjectRenameRequested,
} from '../../../utils/states/project.state';
import { ProjectRenameInput } from '../../ProjectRenameInput';
import type { ProjectRowProps } from './interfaces/ProjectRowProps';
import { DismissibleTooltip } from '../../../views/DismissibleTooltip';
import { IconActionButton } from '../../../views/IconActionButton';
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
        <span className={styles.meta} title={getProjectChangedTimeText(updatedAt, i18n.language)}>
          {t(DEFAULT.OPEN_PROJECT_META, {
            time: getProjectChangedRelativeTimeText(updatedAt, Date.now(), i18n.language),
            count: objectCount,
          })}
        </span>
      </div>
      <div className={styles.actions}>
        {!isOpenProject && (
          <IconActionButton
            size={ANTD_BUTTON_SIZE_SMALL}
            labelText={t(DEFAULT.OPEN_PROJECT_OPEN)}
            iconComponent={<FolderOpenOutlined />}
            onClick={openProject}
          />
        )}
        <IconActionButton
          size={ANTD_BUTTON_SIZE_SMALL}
          type={ANTD_BUTTON_TYPE_TEXT}
          labelText={t(DEFAULT.OPEN_PROJECT_RENAME)}
          iconComponent={<EditOutlined />}
          onClick={() => setIsRenaming(true)}
        />
        <DismissibleTooltip title={t(DEFAULT.OPEN_PROJECT_DELETE)}>
          <Popconfirm
            title={t(DEFAULT.OPEN_PROJECT_DELETE_CONFIRM, { name: projectName })}
            okText={t(DEFAULT.OPEN_PROJECT_DELETE_OK)}
            cancelText={t(DEFAULT.OPEN_PROJECT_DELETE_CANCEL)}
            okButtonProps={{ danger: true }}
            onConfirm={() => dispatch(new ProjectDeleteRequested({ projectId }))}
          >
            <Button
              size={ANTD_BUTTON_SIZE_SMALL}
              type={ANTD_BUTTON_TYPE_TEXT}
              danger
              icon={<DeleteOutlined />}
              aria-label={t(DEFAULT.OPEN_PROJECT_DELETE)}
            />
          </Popconfirm>
        </DismissibleTooltip>
      </div>
    </li>
  );
};
