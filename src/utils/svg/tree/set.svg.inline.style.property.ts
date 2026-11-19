/**
 * Sets one property in the inline style of an element, replacing an earlier value of it. Inline style wins over
 * presentation attributes and style sheet rules.
 *
 * @author michael.morosov
 *
 * @since 2026-11-09
 *
 * @copyright 2026 michael.morosov
 * Licensed under the Apache License, Version 2.0. See the LICENSE file.
 */
import { SVG_STYLE_ATTRIBUTE_NAME } from '../svg.constants';
import { SVG_STYLE_DECLARATION_SEPARATOR, SVG_STYLE_PROPERTY_SEPARATOR } from './svg.tree.constants';

export const setSvgInlineStyleProperty = (element: Element, propertyName: string, propertyValue: string): void => {
  const otherDeclarations: string[] = [];

  const styleText: string = element.getAttribute(SVG_STYLE_ATTRIBUTE_NAME) ?? '';

  for (const declaration of styleText.split(SVG_STYLE_DECLARATION_SEPARATOR)) {
    const declaredName: string = (declaration.split(SVG_STYLE_PROPERTY_SEPARATOR)[0] ?? '').trim().toLowerCase();

    if (declaration.trim() && declaredName !== propertyName) {
      otherDeclarations.push(declaration.trim());
    }
  }

  otherDeclarations.push([propertyName, propertyValue].join(SVG_STYLE_PROPERTY_SEPARATOR));
  element.setAttribute(SVG_STYLE_ATTRIBUTE_NAME, otherDeclarations.join(SVG_STYLE_DECLARATION_SEPARATOR));
};
