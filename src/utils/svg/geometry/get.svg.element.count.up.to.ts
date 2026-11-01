/**
 * Counts an element and its descendants, but stops as soon as the count passes the limit and then gives limit + 1. A
 * copy too large for the budget is then rejected without walking all of it.
 *
 * @author michael.morosov
 *
 * @since 2026-11-01
 *
 * @copyright michael.morosov - All rights reserved.
 * You may not use, distribute or modify this code without explicit permission by michael.morosov.
 */
/**
 * The next element after the given one in document order, without going below it and staying inside the counted
 * root: its next sibling, or else the next sibling of the nearest ancestor that has one.
 */
const getNextElementAfterSubtree = (element: Element, rootElement: Element): Element | undefined => {
  for (let currentElement: Element | null = element; currentElement && currentElement !== rootElement;
    currentElement = currentElement.parentElement) {
    if (currentElement.nextElementSibling) {
      return currentElement.nextElementSibling;
    }
  }

  return undefined;
};

/**
 * Walks the tree one element at a time by its child and sibling links, so no list of children is built: the work stays
 * within the limit even under a node with very many children.
 */
export const getSvgElementCountUpTo = (element: Element, limit: number): number => {
  let elementCount = 0;

  for (let currentElement: Element | undefined = element; currentElement;
    currentElement = currentElement.firstElementChild ?? getNextElementAfterSubtree(currentElement, element)) {
    elementCount++;

    if (elementCount > limit) {
      return elementCount;
    }
  }

  return elementCount;
};
