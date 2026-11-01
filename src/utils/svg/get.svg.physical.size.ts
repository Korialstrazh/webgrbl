/**
 * Works out the real size of an SVG file from its root width, height and viewBox.
 *
 * @author michael.morosov
 *
 * @since 2026-11-01
 *
 * @copyright michael.morosov - All rights reserved.
 * You may not use, distribute or modify this code without explicit permission by michael.morosov.
 */
import { getSvgLengthMm } from './get.svg.length.mm';
import type { SvgPhysicalSize } from './interfaces/SvgPhysicalSize';
import {
  MM_PER_INCH,
  SVG_HEIGHT_ATTRIBUTE,
  SVG_PX_PER_INCH,
  SVG_VIEW_BOX_ATTRIBUTE,
  SVG_VIEW_BOX_HEIGHT_INDEX,
  SVG_VIEW_BOX_SEPARATOR_PATTERN,
  SVG_VIEW_BOX_VALUE_COUNT,
  SVG_VIEW_BOX_WIDTH_INDEX,
  SVG_WIDTH_ATTRIBUTE,
} from './svg.constants';

const getViewBoxSize = (svgElement: Element): SvgPhysicalSize | undefined => {
  const parts: string[] = (svgElement.getAttribute(SVG_VIEW_BOX_ATTRIBUTE) ?? '')
    .trim()
    .split(SVG_VIEW_BOX_SEPARATOR_PATTERN);
  const numbers: number[] = parts.map((part: string): number => Number(part));
  const hasFourNumbers: boolean = numbers.length === SVG_VIEW_BOX_VALUE_COUNT && numbers.every(Number.isFinite);
  const widthUnits: number = numbers[SVG_VIEW_BOX_WIDTH_INDEX] ?? NaN;
  const heightUnits: number = numbers[SVG_VIEW_BOX_HEIGHT_INDEX] ?? NaN;

  if (!hasFourNumbers || !(widthUnits > 0) || !(heightUnits > 0)) {
    return undefined;
  }

  return { widthMm: widthUnits, heightMm: heightUnits };
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
