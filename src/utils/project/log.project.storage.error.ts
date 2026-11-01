/**
 * Writes a project storage error to the browser log; the user only ever sees a fixed toast text.
 *
 * @author michael.morosov
 *
 * @since 2026-11-01
 *
 * @copyright michael.morosov - All rights reserved.
 * You may not use, distribute or modify this code without explicit permission by michael.morosov.
 */
const PROJECT_STORAGE_ERROR_LOG_MESSAGE = 'A project storage operation failed';

export const logProjectStorageError = (error: unknown): void => {
  // eslint-disable-next-line no-console -- the toast never carries the error, so the log is the only place to see it
  console.error(PROJECT_STORAGE_ERROR_LOG_MESSAGE, error);
};
