/**
 * Tells whether an element has a clip-path or a mask from an attribute, a style rule or its inline style.
 *
 * @author michael.morosov
 *
 * @since 2026-11-01
 *
 * @copyright michael.morosov - All rights reserved.
 * You may not use, distribute or modify this code without explicit permission by michael.morosov.
 */
import { getSvgElementDeclarations } from './get.svg.element.declarations';
import type { SvgCssRule } from './interfaces/SvgCssRule';
import { SVG_PAINT_NONE, SVG_PROPERTY } from './svg.geometry.constants';

const isClippingValue = (value: string | undefined): boolean => Boolean(value && value !== SVG_PAINT_NONE);

export const isSvgElementClipped = (element: Element, rules: SvgCssRule[]): boolean => {
  const declarations: Record<string, string> = getSvgElementDeclarations(element, rules);

  return isClippingValue(declarations[SVG_PROPERTY.CLIP_PATH]) || isClippingValue(declarations[SVG_PROPERTY.MASK]);
};
