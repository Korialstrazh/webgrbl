/**
 * The message the toolpath worker receives: the plain generation input with the id its answers carry.
 *
 * @author michael.morosov
 *
 * @since 2026-11-01
 *
 * @copyright michael.morosov - All rights reserved.
 * You may not use, distribute or modify this code without explicit permission by michael.morosov.
 */
import type { ToolpathGenerationInput } from './ToolpathGenerationInput';

export interface ToolpathWorkerRequest extends ToolpathGenerationInput {
  /** Id of the request, repeated in every message the worker answers it with. */
  requestId: number;
}
