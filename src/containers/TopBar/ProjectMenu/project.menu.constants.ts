/**
 * Values of the Project menu: the key of each entry and the label of each autosave state.
 *
 * @author michael.morosov
 *
 * @since 2026-11-01
 *
 * @copyright 2026 michael.morosov
 * Licensed under the Apache License, Version 2.0. See the LICENSE file.
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
  IMPORT_SVG: 'import-svg',
} as const;

/** The id of the top bar Import SVG button, which the Project menu entry clicks while the button is hidden. */
export const TOP_BAR_IMPORT_SVG_BUTTON_ID = 'top-bar-import-svg';

export const PROJECT_SAVE_STATUS_LABEL_KEY: Record<ProjectSaveStatus, string> = {
  [PROJECT_SAVE_STATUS.SAVED]: DEFAULT.TOP_BAR_AUTOSAVE_SAVED,
  [PROJECT_SAVE_STATUS.SAVING]: DEFAULT.TOP_BAR_AUTOSAVE_SAVING,
  [PROJECT_SAVE_STATUS.UNSAVED]: DEFAULT.TOP_BAR_AUTOSAVE_UNSAVED,
};
