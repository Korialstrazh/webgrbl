/**
 * Gets the child elements of an element by following its sibling links. This avoids the element's live children
 * collection, which jsdom keeps up to date on every later change of the document; with many elements that made the
 * walk and the use expansion take minutes.
 *
 * @author michael.morosov
 *
 * @since 2026-11-01
 *
 * @copyright 2026 michael.morosov
 * Licensed under the Apache License, Version 2.0. See the LICENSE file.
 */
export const getSvgChildElements = (element: Element): Element[] => {
  const childElements: Element[] = [];

  for (let childElement = element.firstElementChild; childElement; childElement = childElement.nextElementSibling) {
    childElements.push(childElement);
  }

  return childElements;
};
