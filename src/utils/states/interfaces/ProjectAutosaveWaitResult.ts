/**
 * What ends one wait of the autosave timer: a new document change, the quiet time running out, or the tab being hidden
 * or left.
 *
 * @author michael.morosov
 *
 * @since 2026-11-01
 *
 * @copyright 2026 michael.morosov
 * Licensed under the Apache License, Version 2.0. See the LICENSE file.
 */
import type { Action } from '../action';

export interface ProjectAutosaveWaitResult {
  /** The change action, when a new change came first. */
  change?: Action<unknown>;
  /** Set when the debounce or the maximum wait ran out first. */
  quiet?: true;
  /** The browser event name, when the tab was hidden or the page left first. */
  flush?: string;
}
