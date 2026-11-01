/**
 * Resolves the painting style of every element of an SVG document. Precedence from lowest to highest: presentation
 * attribute, style element rule, inline style. Fill, stroke, widths, fill and stroke opacity and visibility
 * inherit; opacity multiplies down the tree and display none hides the whole subtree.
 *
 * @author michael.morosov
 *
 * @since 2026-11-01
 *
 * @copyright michael.morosov - All rights reserved.
 * You may not use, distribute or modify this code without explicit permission by michael.morosov.
 */
import { getSvgCssRules } from './get.svg.css.rules';
import { getSvgElementDeclarations } from './get.svg.element.declarations';
import { getSvgNumber } from './get.svg.number';
import { getSvgFraction } from './get.svg.fraction';
import { getSvgPaintValue } from './get.svg.paint.value';
import type { SvgCssRule } from './interfaces/SvgCssRule';
import type { SvgResolvedStyle } from './interfaces/SvgResolvedStyle';
import {
  SVG_DEFAULT_OPACITY,
  SVG_DEFAULT_STOP_COLOUR,
  SVG_DISPLAY_NONE,
  SVG_PROPERTY,
  SVG_ROOT_DEFAULT_STYLE,
  SVG_VISIBILITY_HIDDEN,
  SVG_VISIBILITY_VISIBLE,
} from './svg.geometry.constants';
import { getNormalizedColour } from '../../palette/normalize.colour';
import { SVG_ALL_ELEMENTS_SELECTOR } from '../svg.constants';

const getVisibility = (visibilityValue: string | undefined, parentIsVisible: boolean): boolean => {
  if (visibilityValue === SVG_VISIBILITY_HIDDEN) {
    return false;
  }

  return visibilityValue === SVG_VISIBILITY_VISIBLE ? true : parentIsVisible;
};

const getStrokeWidth = (strokeWidthValue: string | undefined, parentStrokeWidth: number): number => {
  const strokeWidth: number = getSvgNumber(strokeWidthValue, parentStrokeWidth);

  return strokeWidth < 0 ? parentStrokeWidth : strokeWidth;
};

const getResolvedElementStyle = (
  declarations: Record<string, string>,
  parentStyle: SvgResolvedStyle,
): SvgResolvedStyle => ({
  fill: getSvgPaintValue(declarations[SVG_PROPERTY.FILL], parentStyle.fill),
  stroke: getSvgPaintValue(declarations[SVG_PROPERTY.STROKE], parentStyle.stroke),
  strokeWidth: getStrokeWidth(declarations[SVG_PROPERTY.STROKE_WIDTH], parentStyle.strokeWidth),
  opacity: parentStyle.opacity * getSvgFraction(declarations[SVG_PROPERTY.OPACITY], SVG_DEFAULT_OPACITY),
  fillOpacity: getSvgFraction(declarations[SVG_PROPERTY.FILL_OPACITY], parentStyle.fillOpacity),
  strokeOpacity: getSvgFraction(declarations[SVG_PROPERTY.STROKE_OPACITY], parentStyle.strokeOpacity),
  isDisplayed: parentStyle.isDisplayed && declarations[SVG_PROPERTY.DISPLAY] !== SVG_DISPLAY_NONE,
  isVisible: getVisibility(declarations[SVG_PROPERTY.VISIBILITY], parentStyle.isVisible),
  stopColour: getNormalizedColour(declarations[SVG_PROPERTY.STOP_COLOR] ?? '') ?? SVG_DEFAULT_STOP_COLOUR,
  stopOpacity: getSvgFraction(declarations[SVG_PROPERTY.STOP_OPACITY], SVG_DEFAULT_OPACITY),
});

export const getResolvedSvgStyles = (svgDocument: Document): Map<Element, SvgResolvedStyle> => {
  const rules: SvgCssRule[] = getSvgCssRules(svgDocument);
  const resolvedStyles: Map<Element, SvgResolvedStyle> = new Map<Element, SvgResolvedStyle>();
  const rootElement: Element = svgDocument.documentElement;

  // Document order lists a parent before its children, so the parent style is always ready.
  for (const element of [rootElement, ...Array.from(rootElement.querySelectorAll(SVG_ALL_ELEMENTS_SELECTOR))]) {
    const parentStyle: SvgResolvedStyle =
      (element.parentElement && resolvedStyles.get(element.parentElement)) || SVG_ROOT_DEFAULT_STYLE;

    resolvedStyles.set(element, getResolvedElementStyle(getSvgElementDeclarations(element, rules), parentStyle));
  }

  return resolvedStyles;
};
