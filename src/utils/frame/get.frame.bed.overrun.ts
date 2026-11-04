/**
 * Gets the edge of the work area the outline passes the furthest, or undefined when it stays inside.
 *
 * @author michael.morosov
 *
 * @since 2026-11-04
 *
 * @copyright michael.morosov - All rights reserved.
 * You may not use, distribute or modify this code without explicit permission by michael.morosov.
 */
import type { OriginWorkArea } from '../toolpath/interfaces/OriginWorkArea';
import { FRAME_EDGE } from './frame.constants';
import type { FrameBedOverrun } from './interfaces/FrameBedOverrun';
import type { FrameRectangle } from './interfaces/FrameRectangle';

export const getFrameBedOverrun = (
  rectangle: FrameRectangle,
  workArea: OriginWorkArea,
): FrameBedOverrun | undefined => {
  const overruns: FrameBedOverrun[] = [
    { edge: FRAME_EDGE.LEFT, distanceMm: -rectangle.minX },
    {
      edge: FRAME_EDGE.RIGHT,
      distanceMm: rectangle.maxX - workArea.workAreaXMm,
    },
    { edge: FRAME_EDGE.FRONT, distanceMm: -rectangle.minY },
    {
      edge: FRAME_EDGE.BACK,
      distanceMm: rectangle.maxY - workArea.workAreaYMm,
    },
  ];
  let largestOverrun: FrameBedOverrun | undefined;

  for (const overrun of overruns) {
    if (overrun.distanceMm > (largestOverrun?.distanceMm ?? 0)) {
      largestOverrun = overrun;
    }
  }

  return largestOverrun;
};
