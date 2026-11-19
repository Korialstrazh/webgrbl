/**
 * Gets the zoom factor of one wheel event: scrolling up zooms in, down zooms out, in proportion to how far the wheel
 * moved, so a smooth trackpad and a stepped wheel both feel natural.
 *
 * @author michael.morosov
 *
 * @since 2026-11-02
 *
 * @copyright 2026 michael.morosov
 * Licensed under the Apache License, Version 2.0. See the LICENSE file.
 */
import { WHEEL_DELTA_MODE_LINE } from '../browser/browser.events.constants';
import { BED_WHEEL_LINE_HEIGHT_PX, BED_WHEEL_ZOOM_PER_PIXEL } from './bed.zoom.constants';

export const getBedWheelZoomFactor = (deltaY: number, deltaMode: number): number => {
  const deltaYPx: number = deltaMode === WHEEL_DELTA_MODE_LINE ? deltaY * BED_WHEEL_LINE_HEIGHT_PX : deltaY;

  return Math.exp(-deltaYPx * BED_WHEEL_ZOOM_PER_PIXEL);
};
