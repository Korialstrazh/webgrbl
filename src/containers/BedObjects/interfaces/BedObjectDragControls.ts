/**
 * A drag of objects on the bed as the objects layer uses it: the drag in progress, a way to start one, and the pointer
 * handlers that move, finish or drop it.
 *
 * @author michael.morosov
 *
 * @since 2026-11-01
 *
 * @copyright 2026 michael.morosov
 * Licensed under the Apache License, Version 2.0. See the LICENSE file.
 */
import type { PointerEvent } from 'react';
import type { BedObjectDrag } from './BedObjectDrag';
import type { SelectToolPointerDownOutcome } from './SelectToolPointerDownOutcome';

export interface BedObjectDragControls {
  /** The drag in progress; undefined while no pointer drags objects. */
  drag: BedObjectDrag | undefined;
  /** Starts a drag of the outcome's dragged objects from the pointer's position; stable between renders. */
  startObjectDrag: (pointerEvent: PointerEvent, outcome: SelectToolPointerDownOutcome) => void;
  handleDragPointerMove: (pointerEvent: PointerEvent) => void;
  /** Commits a real drag as one transform, or makes the click's selection. */
  handleDragPointerUp: (pointerEvent: PointerEvent) => void;
  /** Drops the drag without a change. */
  handleDragPointerCancel: (pointerEvent: PointerEvent) => void;
}
