/**
 * Gets the top-left corner of each square corner handle, so each handle is centred on its corner of a selection box
 * that is centred on the origin. The drawing frame's Y points down, so a corner up on screen has a negative Y.
 *
 * @author michael.morosov
 *
 * @since 2026-11-01
 *
 * @copyright michael.morosov - All rights reserved.
 * You may not use, distribute or modify this code without explicit permission by michael.morosov.
 */
import { HALF_BOX_FACTOR } from '../../../utils/project/project.constants';
import { SCALE_HANDLE_CORNER_SIGNS, SCALE_HANDLES } from '../bed.objects.constants';
import type { BedObjectScaleHandle } from '../bed.objects.constants';
import type { BedMachinePoint } from '../interfaces/BedMachinePoint';
import type { SelectionHandlePlacement } from './interfaces/SelectionHandlePlacement';

export const getSelectionHandleOrigins = (
  boxWidthMm: number,
  boxHeightMm: number,
  handleSizeMm: number,
): SelectionHandlePlacement[] => {
  const halfHandle: number = handleSizeMm * HALF_BOX_FACTOR;

  return SCALE_HANDLES.map((handle: BedObjectScaleHandle): SelectionHandlePlacement => {
    const cornerSign: BedMachinePoint = SCALE_HANDLE_CORNER_SIGNS[handle];

    return {
      handle,
      origin: {
        x: cornerSign.x * boxWidthMm * HALF_BOX_FACTOR - halfHandle,
        y: -cornerSign.y * boxHeightMm * HALF_BOX_FACTOR - halfHandle,
      },
    };
  });
};
