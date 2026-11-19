/**
 * Works out the real size of an SVG file from its root width, height and viewBox.
 *
 * @author michael.morosov
 *
 * @since 2026-11-01
 *
 * @copyright 2026 michael.morosov
 * Licensed under the Apache License, Version 2.0. See the LICENSE file.
 */
import { getSvgLengthMm } from './get.svg.length.mm';
import { getSvgViewBox } from './get.svg.view.box';
import type { SvgPhysicalSize } from './interfaces/SvgPhysicalSize';
import type { SvgViewBox } from './interfaces/SvgViewBox';
import { MM_PER_INCH, SVG_HEIGHT_ATTRIBUTE, SVG_PX_PER_INCH, SVG_WIDTH_ATTRIBUTE } from './svg.constants';

const getViewBoxSize = (svgElement: Element): SvgPhysicalSize | undefined => {
  const viewBox: SvgViewBox | undefined = getSvgViewBox(svgElement);

  return viewBox ? { widthMm: viewBox.width, heightMm: viewBox.height } : undefined;
};

const getViewBoxPixelsAsMm = (viewBoxSize: SvgPhysicalSize): SvgPhysicalSize => ({
  widthMm: (viewBoxSize.widthMm * MM_PER_INCH) / SVG_PX_PER_INCH,
  heightMm: (viewBoxSize.heightMm * MM_PER_INCH) / SVG_PX_PER_INCH,
});

export const getSvgPhysicalSize = (svgElement: Element): SvgPhysicalSize | undefined => {
  const widthMm: number | undefined = getSvgLengthMm(svgElement.getAttribute(SVG_WIDTH_ATTRIBUTE));
  const heightMm: number | undefined = getSvgLengthMm(svgElement.getAttribute(SVG_HEIGHT_ATTRIBUTE));

  if (widthMm && heightMm) {
    return { widthMm, heightMm };
  }

  const viewBoxSize: SvgPhysicalSize | undefined = getViewBoxSize(svgElement);

  if (!viewBoxSize) {
    return undefined;
  }

  if (widthMm) {
    return { widthMm, heightMm: (widthMm * viewBoxSize.heightMm) / viewBoxSize.widthMm };
  }

  if (heightMm) {
    return { widthMm: (heightMm * viewBoxSize.widthMm) / viewBoxSize.heightMm, heightMm };
  }

  return getViewBoxPixelsAsMm(viewBoxSize);
};
