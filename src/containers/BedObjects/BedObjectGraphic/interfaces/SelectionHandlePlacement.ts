/**
 * One corner handle of the selection box: which handle it is and the top-left corner of its square.
 *
 * @author michael.morosov
 *
 * @since 2026-11-01
 *
 * @copyright michael.morosov - All rights reserved.
 * You may not use, distribute or modify this code without explicit permission by michael.morosov.
 */
import type { BedObjectScaleHandle } from '../../bed.objects.constants';
import type { ObjectFramePoint } from './ObjectFramePoint';

export interface SelectionHandlePlacement {
  /** The corner the handle scales from. */
  handle: BedObjectScaleHandle;
  /** The top-left corner of the handle's square in the object's drawing frame. */
  origin: ObjectFramePoint;
}
