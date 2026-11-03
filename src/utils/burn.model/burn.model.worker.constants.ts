/**
 * Fixed values of the burn model Web Worker and its messages.
 *
 * @author michael.morosov
 *
 * @since 2026-11-03
 *
 * @copyright michael.morosov - All rights reserved.
 * You may not use, distribute or modify this code without explicit permission by michael.morosov.
 */
export const BURN_MODEL_WORKER_MESSAGE_KIND = {
  RESULT: 'result',
  ERROR: 'error',
} as const;

/** Developer-facing text of a burn model worker message that could not be read. */
export const BURN_MODEL_WORKER_MESSAGE_UNREADABLE_TEXT = 'A burn model worker message could not be read';
