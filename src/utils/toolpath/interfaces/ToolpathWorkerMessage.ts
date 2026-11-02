/**
 * Any message the toolpath worker posts back.
 *
 * @author michael.morosov
 *
 * @since 2026-11-01
 *
 * @copyright michael.morosov - All rights reserved.
 * You may not use, distribute or modify this code without explicit permission by michael.morosov.
 */
import type { ToolpathWorkerErrorMessage } from './ToolpathWorkerErrorMessage';
import type { ToolpathWorkerProgressMessage } from './ToolpathWorkerProgressMessage';
import type { ToolpathWorkerResultMessage } from './ToolpathWorkerResultMessage';

export type ToolpathWorkerMessage =
  | ToolpathWorkerProgressMessage
  | ToolpathWorkerResultMessage
  | ToolpathWorkerErrorMessage;
