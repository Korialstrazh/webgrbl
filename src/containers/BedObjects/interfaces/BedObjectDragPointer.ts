/**
 * Where a pointer is during a drag: on screen, to tell a click from a drag, and on the bed, to move the objects.
 *
 * @author michael.morosov
 *
 * @since 2026-11-01
 *
 * @copyright michael.morosov - All rights reserved.
 * You may not use, distribute or modify this code without explicit permission by michael.morosov.
 */
import type { BedSvgPoint } from './BedSvgPoint';

export interface BedObjectDragPointer {
  /** The pointer's screen position, in pixels. */
  clientX: number;
  clientY: number;
  /** The pointer's position in bed SVG units. */
  point: BedSvgPoint;
}
