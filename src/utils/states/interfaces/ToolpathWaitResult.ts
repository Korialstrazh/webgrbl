/**
 * What the G-code export saga got while it waited for a ready toolpath: the result, the generation stopped, or a
 * project was opened.
 *
 * @author michael.morosov
 *
 * @since 2026-11-01
 *
 * @copyright 2026 michael.morosov
 * Licensed under the Apache License, Version 2.0. See the LICENSE file.
 */
import type { Action } from '../action';
import type { ToolpathReady } from '../toolpath.state';

export interface ToolpathWaitResult {
  /** The result, when the generation finished. */
  ready?: ToolpathReady;
  /** The failure or cancel, when the generation stopped without a result. */
  stopped?: Action<unknown>;
  /** The document load or project open, when a project was opened meanwhile. */
  projectChange?: Action<unknown>;
}
