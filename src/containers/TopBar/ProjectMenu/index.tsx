/**
 * The Project menu of the top bar: new project, the Open dialog, save, save as file, open file and the Export G-code
 * entry that is not built yet. Open file uses a hidden file input.
 *
 * @author michael.morosov
 *
 * @since 2026-11-01
 *
 * @copyright michael.morosov - All rights reserved.
 * You may not use, distribute or modify this code without explicit permission by michael.morosov.
 */
import { Button, Dropdown } from 'antd';
import { useRef, useState } from 'react';
import type { ReactNode, RefObject } from 'react';
import { useTranslation } from 'react-i18next';
import { useDispatch } from 'react-redux';
import { ANTD_BUTTON_TYPE_TEXT, ANTD_DROPDOWN_TRIGGER_CLICK } from '../../../utils/antd.constants';
import { DROPDOWN_CARET } from '../../../utils/characters.constants';
import { DEFAULT } from '../../../utils/localization/default.locales';
import type { AppDispatch } from '../../../utils/states/new.store';
import {
  NewProjectRequested,
  ProjectFileExportRequested,
  ProjectSaveRequested,
} from '../../../utils/states/project.state';
import { OpenProjectDialog } from '../../OpenProjectDialog';
import { ProjectFileInput } from '../../ProjectFileInput';
import type { ProjectMenuClickInfo } from '../interfaces/ProjectMenuClickInfo';
import { getProjectMenuItems } from './get.project.menu.items';
import { PROJECT_MENU_KEY } from './project.menu.constants';
import styles from './styles.module.scss';

export const ProjectMenu = (): ReactNode => {
  const { t } = useTranslation();
  const dispatch: AppDispatch = useDispatch();
  const fileInputRef: RefObject<HTMLInputElement | null> = useRef<HTMLInputElement | null>(null);
  const [isOpenDialogShown, setIsOpenDialogShown] = useState<boolean>(false);

  const handleMenuClick = ({ key }: ProjectMenuClickInfo): void => {
    switch (key) {
    case PROJECT_MENU_KEY.NEW:
      dispatch(new NewProjectRequested());
      break;
    case PROJECT_MENU_KEY.OPEN:
      setIsOpenDialogShown(true);
      break;
    case PROJECT_MENU_KEY.SAVE:
      dispatch(new ProjectSaveRequested());
      break;
    case PROJECT_MENU_KEY.SAVE_AS_FILE:
      dispatch(new ProjectFileExportRequested());
      break;
    case PROJECT_MENU_KEY.OPEN_FILE:
      fileInputRef.current?.click();
      break;
    default:
      break;
    }
  };

  return (
    <>
      <Dropdown
        trigger={ANTD_DROPDOWN_TRIGGER_CLICK}
        menu={{ items: getProjectMenuItems(t), onClick: handleMenuClick }}
      >
        <Button type={ANTD_BUTTON_TYPE_TEXT}>
          {t(DEFAULT.TOP_BAR_MENU_PROJECT)}
          <span className={styles.caret} aria-hidden>{DROPDOWN_CARET}</span>
        </Button>
      </Dropdown>
      <ProjectFileInput inputRef={fileInputRef} />
      <OpenProjectDialog isOpen={isOpenDialogShown} onClose={() => setIsOpenDialogShown(false)} />
    </>
  );
};
