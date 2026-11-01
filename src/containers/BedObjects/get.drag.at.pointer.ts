/**
 * Gets the moved state of a drag for the pointer's new position: the offset from where it went down, and whether it
 * has now travelled far enough to count as a drag.
 *
 * @author michael.morosov
 *
 * @since 2026-11-01
 *
 * @copyright michael.morosov - All rights reserved.
 * You may not use, distribute or modify this code without explicit permission by michael.morosov.
 */
import { hasPointerPassedDragStartDistance } from './has.pointer.passed.drag.start.distance';
import type { BedObjectDrag } from './interfaces/BedObjectDrag';
import type { BedObjectDragPointer } from './interfaces/BedObjectDragPointer';

export const getDragAtPointer = (drag: BedObjectDrag, pointer: BedObjectDragPointer): BedObjectDrag => ({
  ...drag,
  offset: { x: pointer.point.x - drag.startPoint.x, y: pointer.point.y - drag.startPoint.y },
  isMoving: drag.isMoving || hasPointerPassedDragStartDistance(drag, pointer.clientX, pointer.clientY),
});
