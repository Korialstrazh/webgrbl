/**
 * Reads the preserveAspectRatio attribute of an SVG element. A missing or unreadable value gives the default, xMidYMid
 * meet.
 *
 * @author michael.morosov
 *
 * @since 2026-11-01
 *
 * @copyright michael.morosov - All rights reserved.
 * You may not use, distribute or modify this code without explicit permission by michael.morosov.
 */
import type { SvgAspectRatioFit } from './interfaces/SvgAspectRatioFit';
import {
  SVG_ASPECT_RATIO_ALIGN_FRACTIONS,
  SVG_ASPECT_RATIO_ALIGN_NONE,
  SVG_ASPECT_RATIO_SLICE,
  SVG_DEFAULT_ASPECT_RATIO_FIT,
  SVG_PRESERVE_ASPECT_RATIO_ATTRIBUTE,
  SVG_PRESERVE_ASPECT_RATIO_PATTERN,
} from './svg.constants';

export const getSvgAspectRatioFit = (svgElement: Element): SvgAspectRatioFit => {
  const match: RegExpExecArray | null = SVG_PRESERVE_ASPECT_RATIO_PATTERN.exec(
    svgElement.getAttribute(SVG_PRESERVE_ASPECT_RATIO_ATTRIBUTE) ?? '',
  );

  if (!match) {
    return SVG_DEFAULT_ASPECT_RATIO_FIT;
  }

  const [, align, alignXKeyword = '', alignYKeyword = '', meetOrSlice] = match;

  return {
    isUniform: align !== SVG_ASPECT_RATIO_ALIGN_NONE,
    isSlice: meetOrSlice === SVG_ASPECT_RATIO_SLICE,
    alignX: SVG_ASPECT_RATIO_ALIGN_FRACTIONS[alignXKeyword] ?? SVG_DEFAULT_ASPECT_RATIO_FIT.alignX,
    alignY: SVG_ASPECT_RATIO_ALIGN_FRACTIONS[alignYKeyword] ?? SVG_DEFAULT_ASPECT_RATIO_FIT.alignY,
  };
};
