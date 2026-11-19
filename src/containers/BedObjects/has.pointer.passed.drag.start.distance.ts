/**
 * Tells whether a pointer has travelled far enough from where it went down to count as a drag rather than a click.
 *
 * @author michael.morosov
 *
 * @since 2026-11-01
 *
 * @copyright 2026 michael.morosov
 * Licensed under the Apache License, Version 2.0. See the LICENSE file.
 */
import { DRAG_START_DISTANCE_PX } from './bed.objects.constants';
import type { PointerPressOrigin } from './interfaces/PointerPressOrigin';

export const hasPointerPassedDragStartDistance = (
  pressOrigin: PointerPressOrigin,
  clientX: number,
  clientY: number,
): boolean =>
  Math.hypot(clientX - pressOrigin.startClientX, clientY - pressOrigin.startClientY) >= DRAG_START_DISTANCE_PX;
