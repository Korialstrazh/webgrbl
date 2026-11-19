/**
 * Posts a message from the toolpath worker back to the main thread.
 *
 * @author michael.morosov
 *
 * @since 2026-11-01
 *
 * @copyright 2026 michael.morosov
 * Licensed under the Apache License, Version 2.0. See the LICENSE file.
 */
import type { ToolpathWorkerMessage } from './ToolpathWorkerMessage';

export type ToolpathWorkerMessagePoster = (message: ToolpathWorkerMessage) => void;
