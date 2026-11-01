/**
 * Fixed values of the toolpath Web Worker and its messages.
 *
 * @author michael.morosov
 *
 * @since 2026-11-01
 *
 * @copyright michael.morosov - All rights reserved.
 * You may not use, distribute or modify this code without explicit permission by michael.morosov.
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
