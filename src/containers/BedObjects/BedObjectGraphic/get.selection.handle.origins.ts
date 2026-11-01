/**
 * Gets the top-left corner of each square handle, so each handle is centred on a corner of a selection box that is
 * centred on the origin.
 *
 * @author michael.morosov
 *
 * @since 2026-11-01
 *
 * @copyright michael.morosov - All rights reserved.
 * You may not use, distribute or modify this code without explicit permission by michael.morosov.
 */
import { HALF_BOX_FACTOR } from '../../../utils/project/project.constants';
import { SELECTION_HANDLE_SIZE_MM } from '../bed.objects.constants';
import type { ObjectFramePoint } from './interfaces/ObjectFramePoint';

export const getSelectionHandleOrigins = (boxWidthMm: number, boxHeightMm: number): ObjectFramePoint[] => {
  const halfHandle: number = SELECTION_HANDLE_SIZE_MM * HALF_BOX_FACTOR;
  const left: number = -boxWidthMm * HALF_BOX_FACTOR - halfHandle;
  const right: number = boxWidthMm * HALF_BOX_FACTOR - halfHandle;
  const top: number = -boxHeightMm * HALF_BOX_FACTOR - halfHandle;
  const bottom: number = boxHeightMm * HALF_BOX_FACTOR - halfHandle;

  return [
    { x: left, y: top },
    { x: right, y: top },
    { x: right, y: bottom },
    { x: left, y: bottom },
  ];
};
