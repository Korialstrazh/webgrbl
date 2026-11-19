/**
 * What a press on an object with the Select tool starts with: the object pressed and the selection before it.
 *
 * @author michael.morosov
 *
 * @since 2026-11-01
 *
 * @copyright 2026 michael.morosov
 * Licensed under the Apache License, Version 2.0. See the LICENSE file.
 */
export interface SelectToolPointerDownInput {
  /** Ids of the objects selected before the press. */
  selectedObjectIds: string[];
  /** The object under the pointer. */
  objectId: string;
  /** Whether Shift was held, which adds or removes the object instead of replacing the selection. */
  isShiftPressed: boolean;
}
