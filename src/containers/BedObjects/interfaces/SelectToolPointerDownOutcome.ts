/**
 * What a press on an object with the Select tool does: the selection to make now, what a drag moves, and the
 * selection to make on a plain click.
 *
 * @author michael.morosov
 *
 * @since 2026-11-01
 *
 * @copyright 2026 michael.morosov
 * Licensed under the Apache License, Version 2.0. See the LICENSE file.
 */
export interface SelectToolPointerDownOutcome {
  /** The selection to make right away; undefined to keep it. */
  selectionNow: string[] | undefined;
  /** The objects a drag from this press moves; empty when the press cannot start a drag. */
  draggedObjectIds: string[];
  /** The selection to make when the pointer comes up without a drag; undefined to keep it. */
  selectionAfterClick: string[] | undefined;
}
