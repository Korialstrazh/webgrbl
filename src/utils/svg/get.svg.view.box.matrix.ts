/**
 * Gets the matrix from an SVG's user units to its intrinsic millimetres, Y down. With a viewBox, the viewBox is fitted
 * into the intrinsic size by its preserveAspectRatio; without one, a user unit is a CSS pixel.
 *
 * @author michael.morosov
 *
 * @since 2026-11-01
 *
 * @copyright michael.morosov - All rights reserved.
 * You may not use, distribute or modify this code without explicit permission by michael.morosov.
 */
import type { SvgMatrix } from './geometry/interfaces/SvgMatrix';
import type { SvgPhysicalSize } from './interfaces/SvgPhysicalSize';
import type { SvgViewBox } from './interfaces/SvgViewBox';
import { MM_PER_INCH, SVG_PX_PER_INCH } from './svg.constants';

const MM_PER_CSS_PIXEL: number = MM_PER_INCH / SVG_PX_PER_INCH;

export const getSvgViewBoxMatrix = (viewBox: SvgViewBox | undefined, intrinsicSize: SvgPhysicalSize): SvgMatrix => {
  if (!viewBox) {
    return { a: MM_PER_CSS_PIXEL, b: 0, c: 0, d: MM_PER_CSS_PIXEL, e: 0, f: 0 };
  }

  const { aspectRatioFit } = viewBox;
  const stretchX: number = intrinsicSize.widthMm / viewBox.width;
  const stretchY: number = intrinsicSize.heightMm / viewBox.height;
  const uniformScale: number = aspectRatioFit.isSlice ? Math.max(stretchX, stretchY) : Math.min(stretchX, stretchY);
  const scaleX: number = aspectRatioFit.isUniform ? uniformScale : stretchX;
  const scaleY: number = aspectRatioFit.isUniform ? uniformScale : stretchY;

  return {
    a: scaleX,
    b: 0,
    c: 0,
    d: scaleY,
    e: -viewBox.minX * scaleX + aspectRatioFit.alignX * (intrinsicSize.widthMm - viewBox.width * scaleX),
    f: -viewBox.minY * scaleY + aspectRatioFit.alignY * (intrinsicSize.heightMm - viewBox.height * scaleY),
  };
};
