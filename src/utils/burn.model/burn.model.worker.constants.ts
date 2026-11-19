/**
 * Fixed values of the burn model Web Worker and its messages.
 *
 * @author michael.morosov
 *
 * @since 2026-11-03
 *
 * @copyright 2026 michael.morosov
 * Licensed under the Apache License, Version 2.0. See the LICENSE file.
 */
export const BURN_MODEL_WORKER_MESSAGE_KIND = {
  RESULT: 'result',
  ERROR: 'error',
} as const;

/** Developer-facing text of a burn model worker message that could not be read. */
export const BURN_MODEL_WORKER_MESSAGE_UNREADABLE_TEXT = 'A burn model worker message could not be read';
