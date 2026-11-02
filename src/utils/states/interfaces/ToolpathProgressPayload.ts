/**
 * Payload of ToolpathProgress: how much of the running generation is done.
 *
 * @author michael.morosov
 *
 * @since 2026-11-01
 *
 * @copyright michael.morosov - All rights reserved.
 * You may not use, distribute or modify this code without explicit permission by michael.morosov.
 */
export interface ToolpathProgressPayload {
  /** Share of the generation that is done, from 0 to 1. */
  progress: number;
}
