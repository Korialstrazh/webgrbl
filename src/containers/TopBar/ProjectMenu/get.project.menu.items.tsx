/**
 * The entries of the Project menu, with the Save shortcut hint and the Export G-code entry marked as coming soon.
 *
 * @author michael.morosov
 *
 * @since 2026-11-01
 *
 * @copyright michael.morosov - All rights reserved.
 * You may not use, distribute or modify this code without explicit permission by michael.morosov.
 */
import type { TFunction } from 'i18next';
import { ANTD_MENU_ITEM_TYPE_DIVIDER } from '../../../utils/antd.constants';
import { DEFAULT } from '../../../utils/localization/default.locales';
import type { ProjectMenuItems } from '../interfaces/ProjectMenuItems';
import { PROJECT_MENU_KEY } from './project.menu.constants';
import styles from './styles.module.scss';

export const getProjectMenuItems = (t: TFunction): ProjectMenuItems => [
  { key: PROJECT_MENU_KEY.NEW, label: t(DEFAULT.TOP_BAR_PROJECT_MENU_NEW) },
  { key: PROJECT_MENU_KEY.OPEN, label: t(DEFAULT.TOP_BAR_PROJECT_MENU_OPEN) },
  {
    key: PROJECT_MENU_KEY.SAVE,
    label: (
      <span className={styles.menuEntry}>
        <span>{t(DEFAULT.TOP_BAR_PROJECT_MENU_SAVE)}</span>
        <span className={styles.hint}>{t(DEFAULT.TOP_BAR_PROJECT_MENU_SAVE_SHORTCUT)}</span>
      </span>
    ),
  },
  { type: ANTD_MENU_ITEM_TYPE_DIVIDER },
  { key: PROJECT_MENU_KEY.SAVE_AS_FILE, label: t(DEFAULT.TOP_BAR_PROJECT_MENU_SAVE_AS_FILE) },
  { key: PROJECT_MENU_KEY.OPEN_FILE, label: t(DEFAULT.TOP_BAR_PROJECT_MENU_OPEN_FILE) },
  { type: ANTD_MENU_ITEM_TYPE_DIVIDER },
  {
    key: PROJECT_MENU_KEY.EXPORT_GCODE,
    disabled: true,
    label: (
      <span className={styles.menuEntry}>
        <span>{t(DEFAULT.TOP_BAR_PROJECT_MENU_EXPORT_GCODE)}</span>
        <span className={styles.hint}>{t(DEFAULT.TOP_BAR_PROJECT_MENU_SOON)}</span>
      </span>
    ),
  },
];
