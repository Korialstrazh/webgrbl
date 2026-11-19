/**
 * The name of the open project in the top bar. A click turns it into a box that renames the project; an empty or
 * unchanged name cancels.
 *
 * @author michael.morosov
 *
 * @since 2026-11-01
 *
 * @copyright michael.morosov - All rights reserved.
 * You may not use, distribute or modify this code without explicit permission by michael.morosov.
 */
import { EditOutlined } from '@ant-design/icons';
import { Button, Tooltip } from 'antd';
import { useEffect, useState } from 'react';
import type { ReactNode } from 'react';
import { useTranslation } from 'react-i18next';
import { useDispatch, useSelector } from 'react-redux';
import { ANTD_BUTTON_TYPE_TEXT } from '../../../utils/antd.constants';
import { DEFAULT } from '../../../utils/localization/default.locales';
import type { AppDispatch } from '../../../utils/states/new.store';
import { selectProjectDisplayName } from '../../../utils/states/project.display.name.selector';
import { ProjectRenameRequested, selectProjectId, selectProjectName } from '../../../utils/states/project.state';
import { ProjectRenameInput } from '../../ProjectRenameInput';
import styles from './styles.module.scss';

export const ProjectNameButton = (): ReactNode => {
  const { t, i18n } = useTranslation();
  const dispatch: AppDispatch = useDispatch();
  const projectId: string | undefined = useSelector(selectProjectId);
  const projectName: string = useSelector(selectProjectName);
  const [isRenaming, setIsRenaming] = useState<boolean>(false);
  const shownName: string = useSelector(selectProjectDisplayName(i18n.language));
  const documentTitle: string = t(DEFAULT.APP_DOCUMENT_TITLE, { name: shownName });

  useEffect(() => {
    document.title = documentTitle;
  }, [documentTitle]);

  const commitName = (newName: string): void => {
    setIsRenaming(false);

    if (projectId) {
      dispatch(new ProjectRenameRequested({ projectId, name: newName }));
    }
  };

  if (isRenaming) {
    return (
      <div className={styles.renameBox}>
        <ProjectRenameInput
          initialName={projectName}
          ariaLabel={t(DEFAULT.TOP_BAR_PROJECT_NAME_INPUT)}
          onCommit={commitName}
          onCancel={() => setIsRenaming(false)}
        />
      </div>
    );
  }

  return (
    // The name stays on one line and may be cut, so the tooltip shows it whole.
    <Tooltip title={shownName}>
      <Button
        className={styles.nameButton}
        type={ANTD_BUTTON_TYPE_TEXT}
        disabled={!projectId}
        onClick={() => setIsRenaming(true)}
      >
        {shownName}
        <EditOutlined className={styles.pencil} aria-hidden />
      </Button>
    </Tooltip>
  );
};
