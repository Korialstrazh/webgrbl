/**
 * Posts a message from the toolpath worker back to the main thread.
 *
 * @author michael.morosov
 *
 * @since 2026-11-01
 *
 * @copyright michael.morosov - All rights reserved.
 * You may not use, distribute or modify this code without explicit permission by michael.morosov.
 */
import type { ToolpathWorkerMessage } from './ToolpathWorkerMessage';

export type ToolpathWorkerMessagePoster = (message: ToolpathWorkerMessage) => void;
