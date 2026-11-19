/**
 * Gets the handle sizes in bed millimetres that give a fixed size on screen, or the millimetre fallback sizes while
 * the bed's screen scale is not known.
 *
 * @author michael.morosov
 *
 * @since 2026-11-01
 *
 * @copyright 2026 michael.morosov
 * Licensed under the Apache License, Version 2.0. See the LICENSE file.
 */
import {
  ROTATE_HANDLE_ARM_MM,
  ROTATE_HANDLE_ARM_PX,
  SELECTION_HANDLE_SIZE_MM,
  SELECTION_HANDLE_SIZE_PX,
} from './bed.objects.constants';
import type { BedHandleSizes } from './interfaces/BedHandleSizes';

export const getBedHandleSizes = (pixelsPerMm: number | undefined): BedHandleSizes => {
  if (!pixelsPerMm) {
    return { handleSizeMm: SELECTION_HANDLE_SIZE_MM, rotateArmMm: ROTATE_HANDLE_ARM_MM };
  }

  return { handleSizeMm: SELECTION_HANDLE_SIZE_PX / pixelsPerMm, rotateArmMm: ROTATE_HANDLE_ARM_PX / pixelsPerMm };
};
