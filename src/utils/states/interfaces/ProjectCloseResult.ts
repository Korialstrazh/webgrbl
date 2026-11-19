/**
 * The outcome of closing the open project: whether the caller may go on, and the project that was closed, if any.
 *
 * @author michael.morosov
 *
 * @since 2026-11-01
 *
 * @copyright 2026 michael.morosov
 * Licensed under the Apache License, Version 2.0. See the LICENSE file.
 */
import type { ClosedProject } from './ClosedProject';

export interface ProjectCloseResult {
  /** False when a pending change could not be saved; the project then stays open. */
  isClosed: boolean;
  /** The closed project; undefined when no project was open. */
  closedProject?: ClosedProject;
}
