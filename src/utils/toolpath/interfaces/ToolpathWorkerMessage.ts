/**
 * Any message the toolpath worker posts back.
 *
 * @author michael.morosov
 *
 * @since 2026-11-01
 *
 * @copyright 2026 michael.morosov
 * Licensed under the Apache License, Version 2.0. See the LICENSE file.
 */
import type { ToolpathWorkerErrorMessage } from './ToolpathWorkerErrorMessage';
import type { ToolpathWorkerProgressMessage } from './ToolpathWorkerProgressMessage';
import type { ToolpathWorkerResultMessage } from './ToolpathWorkerResultMessage';

export type ToolpathWorkerMessage =
  | ToolpathWorkerProgressMessage
  | ToolpathWorkerResultMessage
  | ToolpathWorkerErrorMessage;
