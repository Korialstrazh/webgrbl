/**
 * Writes a material storage error to the browser log; the user only ever sees a fixed toast text.
 *
 * @author michael.morosov
 *
 * @since 2026-11-03
 *
 * @copyright michael.morosov - All rights reserved.
 * You may not use, distribute or modify this code without explicit permission by michael.morosov.
 */
const MATERIAL_STORAGE_ERROR_LOG_MESSAGE = 'A material storage operation failed';

export const logMaterialStorageError = (error: unknown): void => {
  // eslint-disable-next-line no-console -- the toast never carries the error, so the log is the only place to see it
  console.error(MATERIAL_STORAGE_ERROR_LOG_MESSAGE, error);
};
