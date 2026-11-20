/**
 * The entries of the Project menu, with the Save shortcut hint and, at phone width, Import SVG and the laser profiles.
 * Export G-code is disabled while it cannot start, with a tooltip that says what is missing.
 *
 * @author michael.morosov
 *
 * @since 2026-11-01
 *
 * @copyright 2026 michael.morosov
 * Licensed under the Apache License, Version 2.0. See the LICENSE file.
 */
import {
  CodeOutlined,
  DownloadOutlined,
  FileAddOutlined,
  FolderOpenOutlined,
  HistoryOutlined,
  SaveOutlined,
  UploadOutlined,
} from '@ant-design/icons';
import { Tooltip } from 'antd';
import type { TFunction } from 'i18next';
import { ANTD_MENU_ITEM_TYPE_DIVIDER } from '../../../utils/antd.constants';
import type { GcodeExportAvailability } from '../../../utils/hooks/interfaces/GcodeExportAvailability';
import { DEFAULT } from '../../../utils/localization/default.locales';
import { LaserMachineIcon } from '../../../views/LaserMachineIcon';
import type { ProjectMenuItems } from '../interfaces/ProjectMenuItems';
import { LASER_MACHINE_ICON_NAME, PROJECT_MENU_KEY } from './project.menu.constants';
import styles from './styles.module.scss';

export const getProjectMenuItems = (t: TFunction, gcodeExport: GcodeExportAvailability): ProjectMenuItems => [
  { key: PROJECT_MENU_KEY.NEW, icon: <FileAddOutlined aria-hidden />, label: t(DEFAULT.TOP_BAR_PROJECT_MENU_NEW) },
  { key: PROJECT_MENU_KEY.OPEN, icon: <HistoryOutlined aria-hidden />, label: t(DEFAULT.TOP_BAR_PROJECT_MENU_OPEN) },
  {
    key: PROJECT_MENU_KEY.SAVE,
    icon: <SaveOutlined aria-hidden />,
    label: (
      <span className={styles.menuEntry}>
        <span>{t(DEFAULT.TOP_BAR_PROJECT_MENU_SAVE)}</span>
        <span className={styles.hint}>{t(DEFAULT.TOP_BAR_PROJECT_MENU_SAVE_SHORTCUT)}</span>
      </span>
    ),
  },
  { type: ANTD_MENU_ITEM_TYPE_DIVIDER },
  {
    key: PROJECT_MENU_KEY.SAVE_AS_FILE,
    icon: <DownloadOutlined aria-hidden />,
    label: t(DEFAULT.TOP_BAR_PROJECT_MENU_SAVE_AS_FILE),
  },
  {
    key: PROJECT_MENU_KEY.OPEN_FILE,
    icon: <FolderOpenOutlined aria-hidden />,
    label: t(DEFAULT.TOP_BAR_PROJECT_MENU_OPEN_FILE),
  },
  {
    key: PROJECT_MENU_KEY.IMPORT_SVG,
    // Only at phone width, where the Import SVG button leaves the bar for this entry.
    className: styles.phoneOnly,
    icon: <UploadOutlined aria-hidden />,
    label: t(DEFAULT.TOP_BAR_MENU_IMPORT_SVG),
  },
  {
    key: PROJECT_MENU_KEY.MACHINE_PROFILES,
    // Only at phone width, where the laser profile button leaves the bar for this entry.
    className: styles.phoneOnly,
    icon: <LaserMachineIcon aria-label={LASER_MACHINE_ICON_NAME} />,
    label: t(DEFAULT.TOP_BAR_MENU_MACHINE_PROFILES),
  },
  { type: ANTD_MENU_ITEM_TYPE_DIVIDER },
  {
    key: PROJECT_MENU_KEY.EXPORT_GCODE,
    icon: <CodeOutlined aria-hidden />,
    disabled: !gcodeExport.isGcodeExportEnabled,
    label: (
      <Tooltip title={gcodeExport.gcodeExportBlockedReasonKey && t(gcodeExport.gcodeExportBlockedReasonKey)}>
        <span>{t(DEFAULT.TOP_BAR_PROJECT_MENU_EXPORT_GCODE)}</span>
      </Tooltip>
    ),
  },
];
