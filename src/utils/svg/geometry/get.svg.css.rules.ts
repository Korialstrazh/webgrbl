/**
 * Collects the simple rules of every style element, in document order; other selectors and at-rules are left out.
 *
 * @author michael.morosov
 *
 * @since 2026-11-01
 *
 * @copyright 2026 michael.morosov
 * Licensed under the Apache License, Version 2.0. See the LICENSE file.
 */
import { getCssDeclarations } from './get.css.declarations';
import { getSelectorSpecificity } from './get.selector.specificity';
import type { SvgCssRule } from './interfaces/SvgCssRule';
import { SVG_STYLE_ELEMENT_NAME } from '../svg.constants';
import {
  CSS_COMMENT_PATTERN,
  CSS_RULE_PATTERN,
  CSS_SELECTOR_SEPARATOR,
  CSS_SIMPLE_SELECTOR_PATTERN,
} from './svg.geometry.constants';

const getRulesOfStyleText = (styleText: string, firstPosition: number): SvgCssRule[] => {
  const rules: SvgCssRule[] = [];

  for (const ruleMatch of styleText.replace(CSS_COMMENT_PATTERN, '').matchAll(CSS_RULE_PATTERN)) {
    const declarations: Record<string, string> = getCssDeclarations(ruleMatch[2] ?? '');

    for (const rawSelector of (ruleMatch[1] ?? '').split(CSS_SELECTOR_SEPARATOR)) {
      const selector: string = rawSelector.trim();

      if (CSS_SIMPLE_SELECTOR_PATTERN.test(selector)) {
        rules.push({
          selector,
          specificity: getSelectorSpecificity(selector),
          position: firstPosition + rules.length,
          declarations,
        });
      }
    }
  }

  return rules;
};

export const getSvgCssRules = (svgDocument: Document): SvgCssRule[] => {
  const rules: SvgCssRule[] = [];

  for (const styleElement of Array.from(svgDocument.getElementsByTagName(SVG_STYLE_ELEMENT_NAME))) {
    rules.push(...getRulesOfStyleText(styleElement.textContent ?? '', rules.length));
  }

  return rules;
};
