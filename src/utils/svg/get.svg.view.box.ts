/**
 * Reads the viewBox of an SVG root, with its preserveAspectRatio. Gives undefined when there is no viewBox or it is
 * not four numbers with a width and height above 0.
 *
 * @author michael.morosov
 *
 * @since 2026-11-01
 *
 * @copyright michael.morosov - All rights reserved.
 * You may not use, distribute or modify this code without explicit permission by michael.morosov.
 */
import { getSvgAspectRatioFit } from './get.svg.aspect.ratio.fit';
import type { SvgViewBox } from './interfaces/SvgViewBox';
import {
  SVG_VIEW_BOX_ATTRIBUTE,
  SVG_VIEW_BOX_HEIGHT_INDEX,
  SVG_VIEW_BOX_MIN_X_INDEX,
  SVG_VIEW_BOX_MIN_Y_INDEX,
  SVG_VIEW_BOX_SEPARATOR_PATTERN,
  SVG_VIEW_BOX_VALUE_COUNT,
  SVG_VIEW_BOX_WIDTH_INDEX,
} from './svg.constants';

const hasViewBoxSize = (numbers: number[], width: number, height: number): boolean =>
  numbers.length === SVG_VIEW_BOX_VALUE_COUNT && numbers.every(Number.isFinite) && width > 0 && height > 0;

export const getSvgViewBox = (svgElement: Element): SvgViewBox | undefined => {
  const parts: string[] = (svgElement.getAttribute(SVG_VIEW_BOX_ATTRIBUTE) ?? '')
    .trim()
    .split(SVG_VIEW_BOX_SEPARATOR_PATTERN);
  const numbers: number[] = parts.map((part: string): number => Number(part));
  const width: number = numbers[SVG_VIEW_BOX_WIDTH_INDEX] ?? NaN;
  const height: number = numbers[SVG_VIEW_BOX_HEIGHT_INDEX] ?? NaN;

  if (!hasViewBoxSize(numbers, width, height)) {
    return undefined;
  }

  return {
    minX: numbers[SVG_VIEW_BOX_MIN_X_INDEX] ?? 0,
    minY: numbers[SVG_VIEW_BOX_MIN_Y_INDEX] ?? 0,
    width,
    height,
    aspectRatioFit: getSvgAspectRatioFit(svgElement),
  };
};
