/**
 * What a press on an object with the Select tool starts with: the object pressed and the selection before it.
 *
 * @author michael.morosov
 *
 * @since 2026-11-01
 *
 * @copyright michael.morosov - All rights reserved.
 * You may not use, distribute or modify this code without explicit permission by michael.morosov.
 */
export interface SelectToolPointerDownInput {
  /** Ids of the objects selected before the press. */
  selectedObjectIds: string[];
  /** The object under the pointer. */
  objectId: string;
  /** Whether Shift was held, which adds or removes the object instead of replacing the selection. */
  isShiftPressed: boolean;
}
