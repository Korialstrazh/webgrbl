/**
 * Logs why a burn model build failed. The user only sees a fixed message, so the log is the only place the error
 * shows up.
 *
 * @author michael.morosov
 *
 * @since 2026-11-03
 *
 * @copyright 2026 michael.morosov
 * Licensed under the Apache License, Version 2.0. See the LICENSE file.
 */
const BURN_MODEL_ERROR_LOG_MESSAGE = 'The burn model build failed';

export const logBurnModelError = (error: unknown): void => {
  // eslint-disable-next-line no-console -- the toast never carries the error, so the log is the only place to see it
  console.error(BURN_MODEL_ERROR_LOG_MESSAGE, error);
};
