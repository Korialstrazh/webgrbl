/**
 * Writes a project storage error to the browser log; the user only ever sees a fixed toast text.
 *
 * @author michael.morosov
 *
 * @since 2026-11-01
 *
 * @copyright 2026 michael.morosov
 * Licensed under the Apache License, Version 2.0. See the LICENSE file.
 */
const PROJECT_STORAGE_ERROR_LOG_MESSAGE = 'A project storage operation failed';

export const logProjectStorageError = (error: unknown): void => {
  // eslint-disable-next-line no-console -- the toast never carries the error, so the log is the only place to see it
  console.error(PROJECT_STORAGE_ERROR_LOG_MESSAGE, error);
};
