/**
 * The entries of the Project menu in three groups (open, save, export) with shortcut hints and, at phone width, Undo,
 * Redo, Import SVG and the laser profiles in groups of their own.
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
  PlusSquareOutlined,
  SaveOutlined,
} from '@ant-design/icons';
import { Tooltip } from 'antd';
import type { TFunction } from 'i18next';
import type { ReactNode } from 'react';
import { ANTD_MENU_ITEM_TYPE_DIVIDER } from '../../../utils/antd.constants';
import { DEFAULT } from '../../../utils/localization/default.locales';
import { LaserMachineIcon } from '../../../views/LaserMachineIcon';
import { RedoArrowIcon } from '../../../views/RedoArrowIcon';
import { UndoArrowIcon } from '../../../views/UndoArrowIcon';
import type { ProjectMenuItems } from '../interfaces/ProjectMenuItems';
import type { ProjectMenuItemsOptions } from '../interfaces/ProjectMenuItemsOptions';
import {
  LASER_MACHINE_ICON_NAME,
  PROJECT_MENU_KEY,
  REDO_ARROW_ICON_NAME,
  UNDO_ARROW_ICON_NAME,
} from './project.menu.constants';
import styles from './styles.module.scss';

const PHONE_ONLY_DIVIDER: ProjectMenuItems[number] = {
  type: ANTD_MENU_ITEM_TYPE_DIVIDER,
  className: styles.phoneOnly,
};

// Only at phone width, where Undo, Redo, Import SVG and the laser profile button leave the bar for these entries.
const getPhoneOnlyMenuItems = (t: TFunction, options: ProjectMenuItemsOptions): ProjectMenuItems => [
  PHONE_ONLY_DIVIDER,
  {
    key: PROJECT_MENU_KEY.UNDO,
    className: styles.phoneOnly,
    icon: <UndoArrowIcon aria-label={UNDO_ARROW_ICON_NAME} />,
    disabled: !options.canUndo,
    label: getShortcutMenuLabel(t(DEFAULT.TOP_BAR_UNDO), t(DEFAULT.TOP_BAR_UNDO_SHORTCUT)),
  },
  {
    key: PROJECT_MENU_KEY.REDO,
    className: styles.phoneOnly,
    icon: <RedoArrowIcon aria-label={REDO_ARROW_ICON_NAME} />,
    disabled: !options.canRedo,
    label: getShortcutMenuLabel(t(DEFAULT.TOP_BAR_REDO), t(DEFAULT.TOP_BAR_REDO_SHORTCUT)),
  },
  PHONE_ONLY_DIVIDER,
  {
    key: PROJECT_MENU_KEY.IMPORT_SVG,
    className: styles.phoneOnly,
    icon: <FileAddOutlined aria-hidden />,
    label: t(DEFAULT.TOP_BAR_MENU_IMPORT_SVG),
  },
  {
    key: PROJECT_MENU_KEY.MACHINE_PROFILES,
    className: styles.phoneOnly,
    icon: <LaserMachineIcon aria-label={LASER_MACHINE_ICON_NAME} />,
    label: t(DEFAULT.TOP_BAR_MENU_MACHINE_PROFILES),
  },
];

const getShortcutMenuLabel = (labelText: string, shortcutText: string): ReactNode => (
  <span className={styles.menuEntry}>
    <span>{labelText}</span>
    <span className={styles.hint}>{shortcutText}</span>
  </span>
);

export const getProjectMenuItems = (t: TFunction, options: ProjectMenuItemsOptions): ProjectMenuItems => [
  { key: PROJECT_MENU_KEY.NEW, icon: <PlusSquareOutlined aria-hidden />, label: t(DEFAULT.TOP_BAR_PROJECT_MENU_NEW) },
  { key: PROJECT_MENU_KEY.OPEN, icon: <HistoryOutlined aria-hidden />, label: t(DEFAULT.TOP_BAR_PROJECT_MENU_OPEN) },
  {
    key: PROJECT_MENU_KEY.OPEN_FILE,
    icon: <FolderOpenOutlined aria-hidden />,
    label: t(DEFAULT.TOP_BAR_PROJECT_MENU_OPEN_FILE),
  },
  { type: ANTD_MENU_ITEM_TYPE_DIVIDER },
  {
    key: PROJECT_MENU_KEY.SAVE,
    icon: <SaveOutlined aria-hidden />,
    label: getShortcutMenuLabel(t(DEFAULT.TOP_BAR_PROJECT_MENU_SAVE), t(DEFAULT.TOP_BAR_PROJECT_MENU_SAVE_SHORTCUT)),
  },
  {
    key: PROJECT_MENU_KEY.SAVE_AS_FILE,
    icon: <DownloadOutlined aria-hidden />,
    label: t(DEFAULT.TOP_BAR_PROJECT_MENU_SAVE_AS_FILE),
  },
  { type: ANTD_MENU_ITEM_TYPE_DIVIDER },
  {
    key: PROJECT_MENU_KEY.EXPORT_GCODE,
    icon: <CodeOutlined aria-hidden />,
    disabled: !options.gcodeExport.isGcodeExportEnabled,
    label: (
      <Tooltip
        title={options.gcodeExport.gcodeExportBlockedReasonKey && t(options.gcodeExport.gcodeExportBlockedReasonKey)}
      >
        <span>{t(DEFAULT.TOP_BAR_PROJECT_MENU_EXPORT_GCODE)}</span>
      </Tooltip>
    ),
  },
  ...getPhoneOnlyMenuItems(t, options),
];
