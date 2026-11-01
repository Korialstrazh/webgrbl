/**
 * Values of the Project menu: the key of each entry and the label of each autosave state.
 *
 * @author michael.morosov
 *
 * @since 2026-11-01
 *
 * @copyright michael.morosov - All rights reserved.
 * You may not use, distribute or modify this code without explicit permission by michael.morosov.
 */
import { DEFAULT } from '../../../utils/localization/default.locales';
import { PROJECT_SAVE_STATUS } from '../../../utils/states/project.save.status.constants';
import type { ProjectSaveStatus } from '../../../utils/states/project.save.status.constants';

export const PROJECT_MENU_KEY = {
  NEW: 'new',
  OPEN: 'open',
  SAVE: 'save',
  SAVE_AS_FILE: 'save-as-file',
  OPEN_FILE: 'open-file',
  EXPORT_GCODE: 'export-gcode',
} as const;

export const PROJECT_SAVE_STATUS_LABEL_KEY: Record<ProjectSaveStatus, string> = {
  [PROJECT_SAVE_STATUS.SAVED]: DEFAULT.TOP_BAR_AUTOSAVE_SAVED,
  [PROJECT_SAVE_STATUS.SAVING]: DEFAULT.TOP_BAR_AUTOSAVE_SAVING,
  [PROJECT_SAVE_STATUS.UNSAVED]: DEFAULT.TOP_BAR_AUTOSAVE_UNSAVED,
};
