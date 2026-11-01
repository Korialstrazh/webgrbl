/**
 * Where the answers to one toolpath worker request go: progress, the finished toolpath, or the failure.
 *
 * @author michael.morosov
 *
 * @since 2026-11-01
 *
 * @copyright michael.morosov - All rights reserved.
 * You may not use, distribute or modify this code without explicit permission by michael.morosov.
 */
import type { Toolpath } from './Toolpath';
import type { ToolpathProgressListener } from './ToolpathProgressListener';
import type { ToolpathWorkerError } from '../toolpath.worker.error';

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
