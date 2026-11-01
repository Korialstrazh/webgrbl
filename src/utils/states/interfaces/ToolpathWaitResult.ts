/**
 * What the G-code export saga got while it waited for a ready toolpath: the result, or the generation stopped.
 *
 * @author michael.morosov
 *
 * @since 2026-11-01
 *
 * @copyright michael.morosov - All rights reserved.
 * You may not use, distribute or modify this code without explicit permission by michael.morosov.
 */
import type { Action } from '../action';
import type { ToolpathReady } from '../toolpath.state';

export interface ToolpathWaitResult {
  /** The result, when the generation finished. */
  ready?: ToolpathReady;
  /** The failure or cancel, when the generation stopped without a result. */
  stopped?: Action<unknown>;
}
