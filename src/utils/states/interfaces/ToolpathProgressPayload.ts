/**
 * Payload of ToolpathProgress: how much of the running generation is done.
 *
 * @author michael.morosov
 *
 * @since 2026-11-01
 *
 * @copyright 2026 michael.morosov
 * Licensed under the Apache License, Version 2.0. See the LICENSE file.
 */
export interface ToolpathProgressPayload {
  /** Share of the generation that is done, from 0 to 1. */
  progress: number;
}
