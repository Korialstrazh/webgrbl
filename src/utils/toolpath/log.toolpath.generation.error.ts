/**
 * Logs why a toolpath generation failed. The user only sees a fixed message, so the log is the only place the error
 * shows up.
 *
 * @author michael.morosov
 *
 * @since 2026-11-01
 *
 * @copyright michael.morosov - All rights reserved.
 * You may not use, distribute or modify this code without explicit permission by michael.morosov.
 */
const TOOLPATH_GENERATION_ERROR_LOG_MESSAGE = 'The toolpath generation failed';

export const logToolpathGenerationError = (error: unknown): void => {
  // eslint-disable-next-line no-console -- the toast never carries the error, so the log is the only place to see it
  console.error(TOOLPATH_GENERATION_ERROR_LOG_MESSAGE, error);
};
