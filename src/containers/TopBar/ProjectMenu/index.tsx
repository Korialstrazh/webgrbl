/**
 * The Project menu of the top bar: new project, the Open dialog, save, save as file, open file, Export G-code and,
 * at phone width, Import SVG. Open file uses a hidden file input.
 *
 * @author michael.morosov
 *
 * @since 2026-11-01
 *
 * @copyright 2026 michael.morosov
 * Licensed under the Apache License, Version 2.0. See the LICENSE file.
 */
import { DownOutlined, FolderOutlined } from '@ant-design/icons';
import { Button, Dropdown } from 'antd';
import { useRef, useState } from 'react';
import type { ReactNode, RefObject } from 'react';
import { useTranslation } from 'react-i18next';
import { useDispatch } from 'react-redux';
import { ANTD_BUTTON_TYPE_TEXT, ANTD_DROPDOWN_TRIGGER_CLICK } from '../../../utils/antd.constants';
import type { GcodeExportAvailability } from '../../../utils/hooks/interfaces/GcodeExportAvailability';
import { useGcodeExportAvailability } from '../../../utils/hooks/use.gcode.export.availability';
import { useOverlayRegistration } from '../../../utils/hooks/use.overlay.registration';
import { usePopoverAutoClose } from '../../../utils/hooks/use.popover.auto.close';
import { DEFAULT } from '../../../utils/localization/default.locales';
import type { AppDispatch } from '../../../utils/states/new.store';
import {
  NewProjectRequested,
  ProjectFileExportRequested,
  ProjectSaveRequested,
} from '../../../utils/states/project.state';
import { GcodeExportRequested } from '../../../utils/states/toolpath.state';
import { OpenProjectDialog } from '../../OpenProjectDialog';
import { DismissibleTooltip } from '../../../views/DismissibleTooltip';
import { ProjectFileInput } from '../../ProjectFileInput';
import type { ProjectMenuClickInfo } from '../interfaces/ProjectMenuClickInfo';
import { getProjectMenuItems } from './get.project.menu.items';
import { PROJECT_MENU_KEY, TOP_BAR_IMPORT_SVG_BUTTON_ID } from './project.menu.constants';
import styles from './styles.module.scss';

const PROJECT_MENU_OVERLAY_ID = 'project-menu';

export const ProjectMenu = (): ReactNode => {
  const { t } = useTranslation();
  const dispatch: AppDispatch = useDispatch();
  const fileInputRef: RefObject<HTMLInputElement | null> = useRef<HTMLInputElement | null>(null);
  const [isOpenDialogShown, setIsOpenDialogShown] = useState<boolean>(false);
  const [isMenuOpen, setIsMenuOpen] = useState<boolean>(false);

  // Escape must only close this, not also stop the machine.
  useOverlayRegistration(PROJECT_MENU_OVERLAY_ID, isMenuOpen);

  const gcodeExport: GcodeExportAvailability = useGcodeExportAvailability();

  usePopoverAutoClose(isMenuOpen, () => setIsMenuOpen(false));

  const handleMenuClick = ({ key }: ProjectMenuClickInfo): void => {
    setIsMenuOpen(false);

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
    case PROJECT_MENU_KEY.IMPORT_SVG:
      document.getElementById(TOP_BAR_IMPORT_SVG_BUTTON_ID)?.click();
      break;
    case PROJECT_MENU_KEY.EXPORT_GCODE:
      dispatch(new GcodeExportRequested({ isWarningConfirmed: false }));
      break;
    default:
      break;
    }
  };

  return (
    <>
      <DismissibleTooltip title={t(DEFAULT.TOP_BAR_MENU_PROJECT)}>
        <Dropdown
          trigger={ANTD_DROPDOWN_TRIGGER_CLICK}
          open={isMenuOpen}
          onOpenChange={setIsMenuOpen}
          menu={{ items: getProjectMenuItems(t, gcodeExport), onClick: handleMenuClick }}
        >
          <Button type={ANTD_BUTTON_TYPE_TEXT} aria-label={t(DEFAULT.TOP_BAR_MENU_PROJECT)}>
            <FolderOutlined aria-hidden="true" />
            {/* A short word while there is room, so the folder reads as the Project menu; the tooltip names it too. */}
            <span className={styles.label} aria-hidden="true">{t(DEFAULT.TOP_BAR_MENU_PROJECT)}</span>
            <DownOutlined className={styles.caret} aria-hidden="true" />
          </Button>
        </Dropdown>
      </DismissibleTooltip>
      <ProjectFileInput inputRef={fileInputRef} />
      <OpenProjectDialog isOpen={isOpenDialogShown} onClose={() => setIsOpenDialogShown(false)} />
    </>
  );
};
