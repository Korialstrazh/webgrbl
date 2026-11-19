/**
 * Where the answers to one toolpath worker request go: progress, the finished toolpath, or the failure.
 *
 * @author michael.morosov
 *
 * @since 2026-11-01
 *
 * @copyright 2026 michael.morosov
 * Licensed under the Apache License, Version 2.0. See the LICENSE file.
 */
import type { ToolpathWorkerError } from '../toolpath.worker.error';
import type { Toolpath } from './Toolpath';
import type { ToolpathProgressListener } from './ToolpathProgressListener';

export interface ToolpathRequestHandlers {
  /** Id of the request; answers to other requests are ignored. */
  requestId: number;
  /** Receives the share of the request that is done. */
  onProgress: ToolpathProgressListener;
  /** Receives the finished toolpath. */
  resolve: (toolpath: Toolpath) => void;
  /** Receives the failure. */
  reject: (error: ToolpathWorkerError) => void;
}
