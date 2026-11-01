/**
 * The outcome of closing the open project: whether the caller may go on, and the project that was closed, if any.
 *
 * @author michael.morosov
 *
 * @since 2026-11-01
 *
 * @copyright michael.morosov - All rights reserved.
 * You may not use, distribute or modify this code without explicit permission by michael.morosov.
 */
import type { ClosedProject } from './ClosedProject';

export interface ProjectCloseResult {
  /** False when a pending change could not be saved; the project then stays open. */
  isClosed: boolean;
  /** The closed project; undefined when no project was open. */
  closedProject?: ClosedProject;
}
