/**
 * Resolves the painting style of every element of an SVG document. Precedence from lowest to highest: presentation
 * attribute, style element rule, inline style. Fill, stroke, widths, fill and stroke opacity and visibility
 * inherit; opacity multiplies down the tree and display none hides the whole subtree.
 *
 * @author michael.morosov
 *
 * @since 2026-11-01
 *
 * @copyright 2026 michael.morosov
 * Licensed under the Apache License, Version 2.0. See the LICENSE file.
 */
import { getParsedColour } from '../../palette/get.parsed.colour';
import type { ParsedColour } from '../../palette/interfaces/ParsedColour';
import { SVG_ALL_ELEMENTS_SELECTOR } from '../svg.constants';
import { getSvgCssRules } from './get.svg.css.rules';
import { getSvgElementDeclarations } from './get.svg.element.declarations';
import { getSvgFraction } from './get.svg.fraction';
import { getSvgLengthUserUnits } from './get.svg.length.user.units';
import { getSvgPaintValue } from './get.svg.paint.value';
import type { SvgCssRule } from './interfaces/SvgCssRule';
import type { SvgResolvedPaint } from './interfaces/SvgResolvedPaint';
import type { SvgResolvedStop } from './interfaces/SvgResolvedStop';
import type { SvgResolvedStyle } from './interfaces/SvgResolvedStyle';
import {
  SVG_CURRENT_COLOUR_KEYWORD,
  SVG_DEFAULT_OPACITY,
  SVG_DEFAULT_STOP_COLOUR,
  SVG_DISPLAY_NONE,
  SVG_FILL_RULES,
  SVG_ID_ATTRIBUTE_NAME,
  SVG_LINEAR_GRADIENT_ELEMENT_NAME,
  SVG_RADIAL_GRADIENT_ELEMENT_NAME,
  SVG_PROPERTY,
  SVG_ROOT_DEFAULT_STYLE,
  SVG_VISIBILITY_HIDDEN,
  SVG_VISIBILITY_VISIBLE,
} from './svg.geometry.constants';
import type { SvgFillRule } from './svg.geometry.constants';

const getVisibility = (visibilityValue: string | undefined, parentIsVisible: boolean): boolean => {
  if (visibilityValue === SVG_VISIBILITY_HIDDEN) {
    return false;
  }

  return visibilityValue === SVG_VISIBILITY_VISIBLE ? true : parentIsVisible;
};

const isSvgFillRule = (fillRuleValue: string | undefined): fillRuleValue is SvgFillRule =>
  !!fillRuleValue && SVG_FILL_RULES.includes(fillRuleValue);

const getFillRule = (fillRuleValue: string | undefined, parentFillRule: SvgFillRule): SvgFillRule => {
  const normalizedValue: string | undefined = fillRuleValue?.trim().toLowerCase();

  return isSvgFillRule(normalizedValue) ? normalizedValue : parentFillRule;
};

const getStrokeWidth = (strokeWidthValue: string | undefined, parentStrokeWidth: number): number => {
  const strokeWidth: number = getSvgLengthUserUnits(strokeWidthValue, parentStrokeWidth);

  return strokeWidth < 0 ? parentStrokeWidth : strokeWidth;
};

const getColourProperty = (colourValue: string | undefined, parentColour: string): string => {
  const parsedColour: ParsedColour | undefined = colourValue ? getParsedColour(colourValue) : undefined;

  return parsedColour?.colour ?? parentColour;
};

const getResolvedStop = (
  stopColourValue: string | undefined,
  stopOpacityValue: string | undefined,
  colour: string,
): SvgResolvedStop => {
  const isCurrentColour: boolean = stopColourValue?.trim().toLowerCase() === SVG_CURRENT_COLOUR_KEYWORD;
  const parsedColour: ParsedColour | undefined =
    stopColourValue && !isCurrentColour ? getParsedColour(stopColourValue) : undefined;
  const stopColour: string = isCurrentColour ? colour : (parsedColour?.colour ?? SVG_DEFAULT_STOP_COLOUR);

  return {
    stopColour,
    stopOpacity: getSvgFraction(stopOpacityValue, SVG_DEFAULT_OPACITY) * (parsedColour?.alpha ?? SVG_DEFAULT_OPACITY),
  };
};

const getResolvedElementStyle = (
  declarations: Record<string, string>,
  parentStyle: SvgResolvedStyle,
  gradientIds: Set<string>,
): SvgResolvedStyle => {
  const colour: string = getColourProperty(declarations[SVG_PROPERTY.COLOR], parentStyle.colour);
  const fill: SvgResolvedPaint = getSvgPaintValue(declarations[SVG_PROPERTY.FILL], {
    parentPaint: { value: parentStyle.fill, alpha: parentStyle.fillAlpha },
    currentColour: colour,
    gradientIds,
  });
  const stroke: SvgResolvedPaint = getSvgPaintValue(declarations[SVG_PROPERTY.STROKE], {
    parentPaint: { value: parentStyle.stroke, alpha: parentStyle.strokeAlpha },
    currentColour: colour,
    gradientIds,
  });

  return {
    fill: fill.value,
    stroke: stroke.value,
    fillAlpha: fill.alpha,
    strokeAlpha: stroke.alpha,
    colour,
    strokeWidth: getStrokeWidth(declarations[SVG_PROPERTY.STROKE_WIDTH], parentStyle.strokeWidth),
    opacity: parentStyle.opacity * getSvgFraction(declarations[SVG_PROPERTY.OPACITY], SVG_DEFAULT_OPACITY),
    fillOpacity: getSvgFraction(declarations[SVG_PROPERTY.FILL_OPACITY], parentStyle.fillOpacity),
    strokeOpacity: getSvgFraction(declarations[SVG_PROPERTY.STROKE_OPACITY], parentStyle.strokeOpacity),
    isDisplayed: parentStyle.isDisplayed && declarations[SVG_PROPERTY.DISPLAY] !== SVG_DISPLAY_NONE,
    isVisible: getVisibility(declarations[SVG_PROPERTY.VISIBILITY], parentStyle.isVisible),
    fillRule: getFillRule(declarations[SVG_PROPERTY.FILL_RULE], parentStyle.fillRule),
    ...getResolvedStop(declarations[SVG_PROPERTY.STOP_COLOR], declarations[SVG_PROPERTY.STOP_OPACITY], colour),
  };
};

const getGradientIds = (svgDocument: Document): Set<string> => {
  const gradientIds: Set<string> = new Set<string>();

  for (const gradientName of [SVG_LINEAR_GRADIENT_ELEMENT_NAME, SVG_RADIAL_GRADIENT_ELEMENT_NAME]) {
    for (const gradientElement of Array.from(svgDocument.getElementsByTagName(gradientName))) {
      const gradientId: string | null = gradientElement.getAttribute(SVG_ID_ATTRIBUTE_NAME);

      if (gradientId) {
        gradientIds.add(gradientId);
      }
    }
  }

  return gradientIds;
};

export const getResolvedSvgStyles = (svgDocument: Document): Map<Element, SvgResolvedStyle> => {
  const rules: SvgCssRule[] = getSvgCssRules(svgDocument);
  const resolvedStyles: Map<Element, SvgResolvedStyle> = new Map<Element, SvgResolvedStyle>();
  const rootElement: Element = svgDocument.documentElement;
  const gradientIds: Set<string> = getGradientIds(svgDocument);

  // Document order lists a parent before its children, so the parent style is always ready.
  for (const element of [rootElement, ...Array.from(rootElement.querySelectorAll(SVG_ALL_ELEMENTS_SELECTOR))]) {
    const parentStyle: SvgResolvedStyle =
      (element.parentElement && resolvedStyles.get(element.parentElement)) || SVG_ROOT_DEFAULT_STYLE;

    const declarations: Record<string, string> = getSvgElementDeclarations(element, rules);

    resolvedStyles.set(element, getResolvedElementStyle(declarations, parentStyle, gradientIds));
  }

  return resolvedStyles;
};
