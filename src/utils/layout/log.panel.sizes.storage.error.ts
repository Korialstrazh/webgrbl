/**
 * Writes a panel sizes storage error to the browser log. The user is not told: the workbench keeps working with the
 * default or the current sizes, and only the remembered sizes are lost.
 *
 * @author michael.morosov
 *
 * @since 2026-11-02
 *
 * @copyright michael.morosov - All rights reserved.
 * You may not use, distribute or modify this code without explicit permission by michael.morosov.
 */
const PANEL_SIZES_STORAGE_ERROR_LOG_MESSAGE = 'Reading or storing the panel sizes failed';

export const logPanelSizesStorageError = (error: unknown): void => {
  // eslint-disable-next-line no-console -- no toast is shown for this, so the log is the only place to see it
  console.error(PANEL_SIZES_STORAGE_ERROR_LOG_MESSAGE, error);
};
