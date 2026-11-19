/**
 * What dragging the lift axis reads and changes: the lift of the selected part, in mm.
 *
 * @author michael.morosov
 *
 * @since 2026-11-03
 *
 * @copyright 2026 michael.morosov
 * Licensed under the Apache License, Version 2.0. See the LICENSE file.
 */
export interface BurnLiftDragHandlers {
  /** The lift of the part when the drag starts. */
  getLiftMm: () => number;
  /** Sets the lift of the part while dragging. */
  setLiftMm: (liftMm: number) => void;
}
