/**
 * A drag of objects on the bed that is still in progress, kept locally until the pointer comes up.
 *
 * @author michael.morosov
 *
 * @since 2026-11-01
 *
 * @copyright michael.morosov - All rights reserved.
 * You may not use, distribute or modify this code without explicit permission by michael.morosov.
 */
import type { BedSvgPoint } from './BedSvgPoint';

export interface BedObjectDrag {
  /** The pointer that started the drag; other pointers are ignored. */
  pointerId: number;
  /** The objects that move with the pointer. */
  objectIds: string[];
  /** Where the pointer went down, in screen pixels, to tell a click from a drag. */
  startClientX: number;
  startClientY: number;
  /** Where the pointer went down, in bed SVG units. */
  startPoint: BedSvgPoint;
  /** How far the pointer has moved since it went down, in bed SVG units (Y down). */
  offset: BedSvgPoint;
  /** Whether the pointer has travelled far enough to count as a drag rather than a click. */
  isMoving: boolean;
  /** The selection to make if the pointer comes up without a drag; undefined to keep it. */
  selectionAfterClick: string[] | undefined;
}
