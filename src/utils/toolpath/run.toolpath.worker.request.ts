/**
 * Answers one toolpath worker request: builds the toolpath, posting the progress after each layer, then the toolpath
 * or the error. A plain function, so it is tested without a Web Worker.
 *
 * @author michael.morosov
 *
 * @since 2026-11-01
 *
 * @copyright michael.morosov - All rights reserved.
 * You may not use, distribute or modify this code without explicit permission by michael.morosov.
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
  const { requestId, drawables, warnings, layers } = request;

  try {
    const toolpath: Toolpath = getToolpath(drawables, warnings, layers, (progress: number): void => {
      postMessage({ kind: TOOLPATH_WORKER_MESSAGE_KIND.PROGRESS, requestId, progress });
    });

    postMessage({ kind: TOOLPATH_WORKER_MESSAGE_KIND.RESULT, requestId, toolpath });
  } catch (error: unknown) {
    postMessage({ kind: TOOLPATH_WORKER_MESSAGE_KIND.ERROR, requestId, errorText: getThrownErrorText(error) });
  }
};
