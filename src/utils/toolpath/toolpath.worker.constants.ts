/**
 * Fixed values of the toolpath Web Worker and its messages.
 *
 * @author michael.morosov
 *
 * @since 2026-11-01
 *
 * @copyright 2026 michael.morosov
 * Licensed under the Apache License, Version 2.0. See the LICENSE file.
 */
export const TOOLPATH_WORKER_MESSAGE_KIND = {
  PROGRESS: 'progress',
  RESULT: 'result',
  ERROR: 'error',
} as const;

export type ToolpathWorkerMessageKind =
  (typeof TOOLPATH_WORKER_MESSAGE_KIND)[keyof typeof TOOLPATH_WORKER_MESSAGE_KIND];

/** The worker event that carries a posted message. */
export const WORKER_MESSAGE_EVENT_NAME = 'message';
/** The worker event fired when the worker script itself fails. */
export const WORKER_ERROR_EVENT_NAME = 'error';
/** The worker event fired when a message from the worker cannot be read. */
export const WORKER_MESSAGE_ERROR_EVENT_NAME = 'messageerror';
/** Developer-facing text of a toolpath worker message that could not be read. */
export const WORKER_MESSAGE_UNREADABLE_TEXT = 'A toolpath worker message could not be read';
