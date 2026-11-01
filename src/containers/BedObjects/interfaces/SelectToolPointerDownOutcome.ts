/**
 * What a press on an object with the Select tool does: the selection to make now, what a drag moves, and the
 * selection to make on a plain click.
 *
 * @author michael.morosov
 *
 * @since 2026-11-01
 *
 * @copyright michael.morosov - All rights reserved.
 * You may not use, distribute or modify this code without explicit permission by michael.morosov.
 */
export interface SelectToolPointerDownOutcome {
  /** The selection to make right away; undefined to keep it. */
  selectionNow: string[] | undefined;
  /** The objects a drag from this press moves; empty when the press cannot start a drag. */
  draggedObjectIds: string[];
  /** The selection to make when the pointer comes up without a drag; undefined to keep it. */
  selectionAfterClick: string[] | undefined;
}
