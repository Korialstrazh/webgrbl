/**
 * Logs why a toolpath generation failed. The user only sees a fixed message, so the log is the only place the error
 * shows up.
 *
 * @author michael.morosov
 *
 * @since 2026-11-01
 *
 * @copyright 2026 michael.morosov
 * Licensed under the Apache License, Version 2.0. See the LICENSE file.
 */
const TOOLPATH_GENERATION_ERROR_LOG_MESSAGE = 'The toolpath generation failed';

export const logToolpathGenerationError = (error: unknown): void => {
  // eslint-disable-next-line no-console -- the toast never carries the error, so the log is the only place to see it
  console.error(TOOLPATH_GENERATION_ERROR_LOG_MESSAGE, error);
};
