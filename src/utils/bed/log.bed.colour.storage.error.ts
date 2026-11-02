/**
 * Logs a failed read or write of the stored bed colour.
 *
 * @author michael.morosov
 *
 * @since 2026-11-02
 *
 * @copyright michael.morosov - All rights reserved.
 * You may not use, distribute or modify this code without explicit permission by michael.morosov.
 */
const BED_COLOUR_STORAGE_ERROR_LOG_MESSAGE = 'Reading or storing the bed colour failed';

export const logBedColourStorageError = (error: unknown): void => {
  // eslint-disable-next-line no-console -- no toast is shown for this, so the log is the only place to see it
  console.error(BED_COLOUR_STORAGE_ERROR_LOG_MESSAGE, error);
};
