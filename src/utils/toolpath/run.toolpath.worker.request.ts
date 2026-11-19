/**
 * Answers one toolpath worker request: builds the toolpath, posting the progress after each layer, then the toolpath
 * or the error. A plain function, so it is tested without a Web Worker.
 *
 * @author michael.morosov
 *
 * @since 2026-11-01
 *
 * @copyright 2026 michael.morosov
 * Licensed under the Apache License, Version 2.0. See the LICENSE file.
 */
import { getToolpath } from './get.toolpath';
import type { Toolpath } from './interfaces/Toolpath';
import type { ToolpathWorkerMessagePoster } from './interfaces/ToolpathWorkerMessagePoster';
import type { ToolpathWorkerRequest } from './interfaces/ToolpathWorkerRequest';
import { TOOLPATH_WORKER_MESSAGE_KIND } from './toolpath.worker.constants';

/** The developer-facing text of anything thrown while building. */
const getThrownErrorText = (error: unknown): string => (error instanceof Error ? error.message : String(error));

export const runToolpathWorkerRequest = (
  request: ToolpathWorkerRequest,
  postMessage: ToolpathWorkerMessagePoster,
): void => {
  const { requestId } = request;

  try {
    const toolpath: Toolpath = getToolpath(request, (progress: number): void => {
      postMessage({ kind: TOOLPATH_WORKER_MESSAGE_KIND.PROGRESS, requestId, progress });
    });

    postMessage({ kind: TOOLPATH_WORKER_MESSAGE_KIND.RESULT, requestId, toolpath });
  } catch (error: unknown) {
    postMessage({ kind: TOOLPATH_WORKER_MESSAGE_KIND.ERROR, requestId, errorText: getThrownErrorText(error) });
  }
};
