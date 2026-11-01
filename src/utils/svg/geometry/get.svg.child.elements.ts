/**
 * Gets the child elements of an element by following its sibling links. This avoids the element's live children
 * collection, which jsdom keeps up to date on every later change of the document; with many elements that made the
 * walk and the use expansion take minutes.
 *
 * @author michael.morosov
 *
 * @since 2026-11-01
 *
 * @copyright michael.morosov - All rights reserved.
 * You may not use, distribute or modify this code without explicit permission by michael.morosov.
 */
export const getSvgChildElements = (element: Element): Element[] => {
  const childElements: Element[] = [];

  for (let childElement = element.firstElementChild; childElement; childElement = childElement.nextElementSibling) {
    childElements.push(childElement);
  }

  return childElements;
};
