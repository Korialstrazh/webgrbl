/**
 * Logs why a burn model build failed. The user only sees a fixed message, so the log is the only place the error
 * shows up.
 *
 * @author michael.morosov
 *
 * @since 2026-11-03
 *
 * @copyright michael.morosov - All rights reserved.
 * You may not use, distribute or modify this code without explicit permission by michael.morosov.
 */
const BURN_MODEL_ERROR_LOG_MESSAGE = 'The burn model build failed';

export const logBurnModelError = (error: unknown): void => {
  // eslint-disable-next-line no-console -- the toast never carries the error, so the log is the only place to see it
  console.error(BURN_MODEL_ERROR_LOG_MESSAGE, error);
};
