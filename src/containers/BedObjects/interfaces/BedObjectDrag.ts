/**
 * A drag of objects on the bed that is still in progress, kept locally until the pointer comes up.
 *
 * @author michael.morosov
 *
 * @since 2026-11-01
 *
 * @copyright 2026 michael.morosov
 * Licensed under the Apache License, Version 2.0. See the LICENSE file.
 */
import type { BedSvgPoint } from './BedSvgPoint';
import type { PointerPressOrigin } from './PointerPressOrigin';

export interface BedObjectDrag extends PointerPressOrigin {
  /** The pointer that started the drag; other pointers are ignored. */
  pointerId: number;
  /** The objects that move with the pointer. */
  objectIds: string[];
  /** Where the pointer went down, in bed SVG units. */
  startPoint: BedSvgPoint;
  /** How far the pointer has moved since it went down, in bed SVG units (Y down). */
  offset: BedSvgPoint;
  /** Whether the pointer has travelled far enough to count as a drag rather than a click. */
  isMoving: boolean;
  /** The selection to make if the pointer comes up without a drag; undefined to keep it. */
  selectionAfterClick: string[] | undefined;
}
