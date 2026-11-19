/**
 * One corner handle of the selection box: which handle it is and the top-left corner of its square.
 *
 * @author michael.morosov
 *
 * @since 2026-11-01
 *
 * @copyright 2026 michael.morosov
 * Licensed under the Apache License, Version 2.0. See the LICENSE file.
 */
import type { BedObjectScaleHandle } from '../../bed.objects.constants';
import type { ObjectFramePoint } from './ObjectFramePoint';

export interface SelectionHandlePlacement {
  /** The corner the handle scales from. */
  handle: BedObjectScaleHandle;
  /** The top-left corner of the handle's square in the object's drawing frame. */
  origin: ObjectFramePoint;
}
