/**
 * Merges the painting declarations of one element: presentation attributes, then matching style rules, then the
 * inline style.
 *
 * @author michael.morosov
 *
 * @since 2026-11-01
 *
 * @copyright michael.morosov - All rights reserved.
 * You may not use, distribute or modify this code without explicit permission by michael.morosov.
 */
import { getCssDeclarations } from './get.css.declarations';
import type { SvgCssRule } from './interfaces/SvgCssRule';
import { SVG_STYLE_ATTRIBUTE_NAME } from '../svg.constants';
import { SVG_PROPERTY } from './svg.geometry.constants';

const PAINTING_PROPERTY_NAMES: readonly string[] = Object.values(SVG_PROPERTY);

const isRuleMatching = (element: Element, rule: SvgCssRule): boolean => {
  try {
    return element.matches(rule.selector);
  } catch {
    return false;
  }
};

const compareRules = (firstRule: SvgCssRule, secondRule: SvgCssRule): number =>
  firstRule.specificity - secondRule.specificity || firstRule.position - secondRule.position;

const getPresentationAttributes = (element: Element): Record<string, string> => {
  const attributeValues: Record<string, string> = {};

  for (const propertyName of PAINTING_PROPERTY_NAMES) {
    const attributeValue: string | null = element.getAttribute(propertyName);

    if (attributeValue?.trim()) {
      attributeValues[propertyName] = attributeValue.trim();
    }
  }

  return attributeValues;
};

export const getSvgElementDeclarations = (element: Element, rules: SvgCssRule[]): Record<string, string> => {
  const matchingRules: SvgCssRule[] = rules
    .filter((rule: SvgCssRule): boolean => isRuleMatching(element, rule))
    .sort(compareRules);

  return Object.assign(
    getPresentationAttributes(element),
    ...matchingRules.map((rule: SvgCssRule): Record<string, string> => rule.declarations),
    getCssDeclarations(element.getAttribute(SVG_STYLE_ATTRIBUTE_NAME) ?? ''),
  );
};
