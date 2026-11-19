/**
 * The message the toolpath worker receives: the plain generation input with the id its answers carry.
 *
 * @author michael.morosov
 *
 * @since 2026-11-01
 *
 * @copyright 2026 michael.morosov
 * Licensed under the Apache License, Version 2.0. See the LICENSE file.
 */
import type { ToolpathGenerationInput } from './ToolpathGenerationInput';

export interface ToolpathWorkerRequest extends ToolpathGenerationInput {
  /** Id of the request, repeated in every message the worker answers it with. */
  requestId: number;
}
