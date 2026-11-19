/**
 * Where a pointer is during a drag: on screen, to tell a click from a drag, and on the bed, to move the objects.
 *
 * @author michael.morosov
 *
 * @since 2026-11-01
 *
 * @copyright 2026 michael.morosov
 * Licensed under the Apache License, Version 2.0. See the LICENSE file.
 */
import type { BedSvgPoint } from './BedSvgPoint';

export interface BedObjectDragPointer {
  /** The pointer's screen position, in pixels. */
  clientX: number;
  clientY: number;
  /** The pointer's position in bed SVG units. */
  point: BedSvgPoint;
}
