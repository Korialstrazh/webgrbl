/**
 * Gets the part of an SVG's user space its root viewport shows: the viewBox, or without one the intrinsic size in CSS
 * pixels from the origin.
 *
 * @author michael.morosov
 *
 * @since 2026-11-01
 *
 * @copyright michael.morosov - All rights reserved.
 * You may not use, distribute or modify this code without explicit permission by michael.morosov.
 */
import type { SvgPhysicalSize } from './interfaces/SvgPhysicalSize';
import type { SvgViewBox } from './interfaces/SvgViewBox';
import type { SvgViewportBounds } from './interfaces/SvgViewportBounds';
import { SVG_LENGTH_UNIT, SVG_LENGTH_UNIT_MM } from './svg.constants';

export const getSvgRootViewportBounds = (
  viewBox: SvgViewBox | undefined,
  intrinsicSize: SvgPhysicalSize,
): SvgViewportBounds => {
  if (viewBox) {
    return { minX: viewBox.minX, minY: viewBox.minY, width: viewBox.width, height: viewBox.height };
  }

  return {
    minX: 0,
    minY: 0,
    width: intrinsicSize.widthMm / SVG_LENGTH_UNIT_MM[SVG_LENGTH_UNIT.PIXEL],
    height: intrinsicSize.heightMm / SVG_LENGTH_UNIT_MM[SVG_LENGTH_UNIT.PIXEL],
  };
};
